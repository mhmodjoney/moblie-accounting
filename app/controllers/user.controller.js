const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const SubscriptionPlan = db.subscription_plan;
const { Op } = require("sequelize");

const SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
const validatePassword = (password) => {
  return password && password.length >= 8;
};

// Dynamic subscription calculation from database
const calculateSubscriptionEnd = async (subscriptionType, startDate = new Date()) => {
  try {
    // Get plan details from database
    const plan = await SubscriptionPlan.findOne({
      where: { plan_key: subscriptionType, is_active: true }
    });
    
    if (!plan) {
      // Default to 7 days if plan not found
      const defaultEnd = new Date(startDate);
      defaultEnd.setDate(defaultEnd.getDate() + 7);
      return defaultEnd;
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration_days);
    return endDate;
  } catch (error) {
    console.error('Error calculating subscription end:', error);
    // Default to 7 days if error occurs
    const defaultEnd = new Date(startDate);
    defaultEnd.setDate(defaultEnd.getDate() + 7);
    return defaultEnd;
  }
};

// Check if subscription is active
const isSubscriptionActive = (subscriptionEnd) => {
  if (!subscriptionEnd) return false;
  return new Date(subscriptionEnd) > new Date();
};

exports.register = async (req, res) => {
  try {
    const {
      username,
      full_name,
      email,
      password,
      subscription_type = "free_trial",
      role = "user"
    } = req.body;

    // Input validation
    if (!username || !full_name || !email || !password) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: "Invalid email format" 
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { username }] 
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email or username already registered" 
      });
    }

    // Validate subscription type exists in database
    const subscriptionPlan = await SubscriptionPlan.findOne({
      where: { plan_key: subscription_type, is_active: true }
    });

    if (!subscriptionPlan) {
      return res.status(400).json({ 
        message: "Invalid subscription type" 
      });
    }

    // Calculate subscription end date dynamically
    const subscriptionEnd = await calculateSubscriptionEnd(subscription_type);

    // Create user with subscription
    const user = await User.create({
      username,
      full_name,
      email,
      password,
      role: role, // Use the role from request body
      status: role === "admin" ? "active" : "new", // Admin users start with 'active' status
      subscription_type: subscription_type,
      subscription_plan_id: subscriptionPlan.id, // Set the foreign key
      subscription_end: subscriptionEnd,
      created_by: username
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        subscription_type: user.subscription_type,
        subscription_plan_id: user.subscription_plan_id,
        subscription_end: user.subscription_end
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, device_id } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    if (!device_id) {
      return res.status(400).json({ 
        message: "Device ID is required for security purposes" 
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Check user status - more flexible approach
    const blockedStatuses = ["suspended", "expired", "banned", "inactive", "disabled"];
    if (blockedStatuses.includes(user.status)) {
      return res.status(403).json({ 
        message: `User account is ${user.status}` 
      });
    }

    // Check subscription status
    if (!isSubscriptionActive(user.subscription_end)) {
      return res.status(403).json({ 
        message: "Subscription expired. Please renew to continue." 
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Device validation logic
    if (user.device_id === null) {
      // First time login - save the device_id
      await user.update({ 
        device_id: device_id,
        status: "active", // Activate user on first login
        updated_by: user.username
      });
    } else if (user.device_id !== device_id) {
      // Different device trying to login
      return res.status(403).json({ 
        message: "Access denied. This account is already registered to another device. Please contact support if you need to change devices." 
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        subscription_type: user.subscription_type,
        subscription_end: user.subscription_end,
        device_id: device_id
      },
      SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        status: user.status,
        role: user.role,
        subscription_type: user.subscription_type,
        subscription_end: user.subscription_end,
        device_id: user.device_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// NEW: Check subscription status
exports.checkSubscription = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    const isActive = isSubscriptionActive(user.subscription_end);
    
    return res.json({
      subscription_active: isActive,
      subscription_type: user.subscription_type,
      subscription_end: user.subscription_end,
      days_remaining: isActive ? 
        Math.ceil((new Date(user.subscription_end) - new Date()) / (1000 * 60 * 60 * 24)) : 0
    });
  } catch (err) {
    console.error('Subscription check error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// Upgrade subscription
exports.upgradeSubscription = async (req, res) => {
  try {
    const { subscription_type } = req.body;
    
    if (!subscription_type) {
      return res.status(400).json({ 
        message: "Subscription type is required" 
      });
    }
    
    // Validate subscription type exists in database
    const subscriptionPlan = await SubscriptionPlan.findOne({
      where: { plan_key: subscription_type, is_active: true }
    });
    
    if (!subscriptionPlan) {
      return res.status(400).json({ 
        message: "Invalid subscription type. Please choose a valid plan." 
      });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Update subscription
    await user.update({
      subscription_type,
      subscription_plan_id: subscriptionPlan.id, // Set the foreign key
      subscription_end: await calculateSubscriptionEnd(subscription_type),
      status: "active",
      updated_by: user.username
    });

    return res.status(200).json({
      message: "Subscription upgraded successfully",
      subscription_type: user.subscription_type,
      subscription_end: user.subscription_end,
      status: user.status
    });
  } catch (err) {
    console.error('Upgrade subscription error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// ADMIN: Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 'username', 'full_name', 'email', 'status', 'role',
        'subscription_type', 'subscription_plan_id', 'subscription_end', 'device_id', 'createdAt', 'updatedAt'
      ],
      include: [{
        model: SubscriptionPlan,
        as: 'plan',
        attributes: ['id', 'plan_key', 'name', 'price', 'duration_days']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      message: "All users retrieved successfully",
      total_users: users.length,
      users: users
    });
  } catch (err) {
    console.error('Get all users error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// ADMIN: Upgrade any user's subscription (admin only)
exports.adminUpgradeUserSubscription = async (req, res) => {
  try {
    const { user_id, subscription_type } = req.body;
    
    if (!user_id || !subscription_type) {
      return res.status(400).json({ 
        message: "User ID and subscription type are required" 
      });
    }
    
    // Validate subscription type exists in database
    const subscriptionPlan = await SubscriptionPlan.findOne({
      where: { plan_key: subscription_type, is_active: true }
    });
    
    if (!subscriptionPlan) {
      return res.status(400).json({ 
        message: "Invalid subscription type. Please choose a valid plan." 
      });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Update user's subscription
    await user.update({
      subscription_type,
      subscription_plan_id: subscriptionPlan.id, // Set the foreign key
      subscription_end: await calculateSubscriptionEnd(subscription_type),
      status: "active",
      updated_by: "admin"
    });

    return res.status(200).json({
      message: "User subscription upgraded successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        subscription_type: user.subscription_type,
        subscription_end: user.subscription_end,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Admin upgrade user subscription error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// ADMIN: Update user status (admin only)
exports.adminUpdateUserStatus = async (req, res) => {
  try {
    const { user_id, status } = req.body;
    
    if (!user_id || !status) {
      return res.status(400).json({ 
        message: "User ID and status are required" 
      });
    }
    
    // Validate status
    const validStatuses = [
      'new', 'active', 'suspended', 'expired', 'banned', 'inactive', 'disabled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` 
      });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Update user status
    await user.update({
      status,
      updated_by: "admin"
    });

    return res.status(200).json({
      message: "User status updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Admin update user status error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// ADMIN: Reset user device ID (admin only) - for users who need to change devices
exports.adminResetUserDevice = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ 
        message: "User ID is required" 
      });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Reset device_id to null so user can login from new device
    await user.update({
      device_id: null,
      status: "new", // Reset status to new so they need to login again
      updated_by: "admin"
    });

    return res.status(200).json({
      message: "User device ID reset successfully. User can now login from a new device.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        device_id: user.device_id,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Admin reset user device error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};
