const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ 
      message: "No token provided!" 
    });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || "your-secret-key");
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ 
      message: "Unauthorized!" 
    });
  }
};

const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Check user status - more flexible approach
    const blockedStatuses = ["suspended", "expired", "banned", "inactive", "disabled"];
    if (blockedStatuses.includes(user.status)) {
      return res.status(403).json({ 
        message: `Account is ${user.status}. Please contact support.` 
      });
    }

    // Check if subscription is active
    if (user.subscription_end && new Date(user.subscription_end) <= new Date()) {
      // Update user status to expired
      await user.update({ status: "expired" });
      return res.status(403).json({ 
        message: "Subscription expired. Please renew to continue." 
      });
    }

    // Update status to active if subscription is valid - more flexible
    const validActiveStatuses = ["new", "pending", "trial", "awaiting_activation"];
    if (validActiveStatuses.includes(user.status) && user.subscription_end && new Date(user.subscription_end) > new Date()) {
      await user.update({ status: "active" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

module.exports = {
  verifyToken,
  checkSubscription
};
