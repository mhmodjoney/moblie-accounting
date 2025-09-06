const db = require("../models");
const User = db.user;
const Subscription = db.subscription;
const SubscriptionPlan = db.subscription_plan;

// Get all subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { is_active: true },
      order: [['price', 'ASC']]
    });
    
    return res.json({
      message: "Subscription plans retrieved successfully",
      plans: plans
    });
  } catch (err) {
    console.error('Get subscription plans error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// Create new subscription
exports.createSubscription = async (req, res) => {
  try {
    const { user_id, subscription_type, payment_id, payment_method, auto_renew = false } = req.body;

    if (!user_id || !subscription_type) {
      return res.status(400).json({ 
        message: "User ID and subscription type are required" 
      });
    }

    // Get plan details from database
    const plan = await SubscriptionPlan.findOne({
      where: { plan_key: subscription_type, is_active: true }
    });
    if (!plan) {
      return res.status(400).json({ 
        message: "Invalid subscription type" 
      });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      where: { 
        user_id,
        status: "active"
      }
    });

    if (existingSubscription) {
      return res.status(400).json({ 
        message: "User already has an active subscription" 
      });
    }

    // Calculate dates
    const now = new Date();
    const subscription_end = new Date(now.getTime() + (plan.duration_days * 24 * 60 * 60 * 1000));

    // Create subscription
    const subscription = await Subscription.create({
      user_id,
      subscription_type,
      price: plan.price,
      currency: plan.currency,
      payment_id,
      payment_status: payment_id ? "completed" : "pending",
      payment_method,
      subscription_start: now,
      subscription_end,
      auto_renew,
      trial_end: subscription_type === "free_trial" ? subscription_end : null,
      created_by: req.userId || "system"
    });

    // Update user status and subscription_plan_id
    await user.update({ 
      status: "active",
      subscription_plan_id: plan.id, // Set the foreign key
      updated_by: req.userId || "system"
    });

    return res.status(201).json({
      message: "Subscription created successfully",
      subscription: {
        id: subscription.id,
        user_id: subscription.user_id,
        subscription_type: subscription.subscription_type,
        status: subscription.status,
        price: subscription.price,
        currency: subscription.currency,
        subscription_start: subscription.subscription_start,
        subscription_end: subscription.subscription_end,
        auto_renew: subscription.auto_renew
      }
    });

  } catch (err) {
    console.error('Create subscription error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// Get user's active subscription
exports.getUserSubscription = async (req, res) => {
  try {
    const userId = req.userId || req.params.user_id;

    const subscription = await Subscription.findOne({
      where: { 
        user_id: userId,
        status: "active"
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'full_name']
      }],
      order: [['createdAt', 'DESC']]
    });

    if (!subscription) {
      return res.status(404).json({ 
        message: "No active subscription found" 
      });
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil((new Date(subscription.subscription_end) - new Date()) / (1000 * 60 * 60 * 24));

    return res.json({
      message: "User subscription retrieved successfully",
      subscription: {
        id: subscription.id,
        subscription_type: subscription.subscription_type,
        status: subscription.status,
        price: subscription.price,
        currency: subscription.currency,
        subscription_start: subscription.subscription_start,
        subscription_end: subscription.subscription_end,
        days_remaining: daysRemaining > 0 ? daysRemaining : 0,
        auto_renew: subscription.auto_renew,
        user: subscription.user
      }
    });

  } catch (err) {
    console.error('Get user subscription error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// Update subscription (ADMIN ONLY)
exports.updateSubscription = async (req, res) => {
  try {
    const { subscription_id } = req.params;
    const { user_id, subscription_type, status, auto_renew, notes, payment_status } = req.body;

    const subscription = await Subscription.findByPk(subscription_id);
    if (!subscription) {
      return res.status(404).json({ 
        message: "Subscription not found" 
      });
    }

    // Check if user_id is being updated and validate it exists
    if (user_id && user_id !== subscription.user_id) {
      const newUser = await User.findByPk(user_id);
      if (!newUser) {
        return res.status(404).json({ 
          message: "New user not found" 
        });
      }
    }

    // Update subscription with all fields
    const updateData = {
      user_id: user_id || subscription.user_id,
      subscription_type: subscription_type || subscription.subscription_type,
      status: status || subscription.status,
      auto_renew: auto_renew !== undefined ? auto_renew : subscription.auto_renew,
      notes: notes || subscription.notes,
      payment_status: payment_status || subscription.payment_status,
      updated_by: req.userId || "admin"
    };

    // If subscription type changed, recalculate end date from database
    if (subscription_type && subscription_type !== subscription.subscription_type) {
      const plan = await SubscriptionPlan.findOne({
        where: { plan_key: subscription_type, is_active: true }
      });
      if (plan) {
        const now = new Date();
        updateData.subscription_end = new Date(now.getTime() + (plan.duration_days * 24 * 60 * 60 * 1000));
      }
    }

    await subscription.update(updateData);

    return res.json({
      message: "Subscription updated successfully by admin",
      subscription: {
        id: subscription.id,
        user_id: subscription.user_id,
        subscription_type: subscription.subscription_type,
        status: subscription.status,
        auto_renew: subscription.auto_renew,
        notes: subscription.notes,
        payment_status: subscription.payment_status,
        subscription_end: subscription.subscription_end
      }
    });

  } catch (err) {
    console.error('Update subscription error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// Get all subscriptions (admin only)
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'full_name', 'status']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      message: "All subscriptions retrieved successfully",
      total_subscriptions: subscriptions.length,
      subscriptions: subscriptions
    });

  } catch (err) {
    console.error('Get all subscriptions error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { subscription_id } = req.params;
    const { reason } = req.body;

    const subscription = await Subscription.findByPk(subscription_id);
    if (!subscription) {
      return res.status(404).json({ 
        message: "Subscription not found" 
      });
    }

    // Cancel subscription
    await subscription.update({
      status: "cancelled",
      notes: reason ? `Cancelled: ${reason}` : "Subscription cancelled",
      updated_by: req.userId || "system"
    });

    // Update user status if no other active subscriptions
    const activeSubscriptions = await Subscription.count({
      where: { 
        user_id: subscription.user_id,
        status: "active"
      }
    });

    if (activeSubscriptions === 0) {
      await User.update(
        { status: "expired", updated_by: req.userId || "system" },
        { where: { id: subscription.user_id } }
      );
    }

    return res.json({
      message: "Subscription cancelled successfully",
      subscription: {
        id: subscription.id,
        status: subscription.status,
        notes: subscription.notes
      }
    });

  } catch (err) {
    console.error('Cancel subscription error:', err);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};
