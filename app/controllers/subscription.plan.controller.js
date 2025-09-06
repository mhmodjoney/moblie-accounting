const db = require("../models");
const SubscriptionPlan = db.subscription_plan;

// Create new subscription plan (ADMIN ONLY)
exports.createSubscriptionPlan = async (req, res) => {
  try {
    const {
      plan_key,
      name,
      price,
      currency = "USD",
      duration_days,
      description,
      features,
      max_users = 1,
      is_active = true
    } = req.body;

    // Validation
    if (!plan_key || !name || !price || !duration_days) {
      return res.status(400).json({
        message: "Plan key, name, price, and duration days are required"
      });
    }

    // Check if plan_key already exists
    const existingPlan = await SubscriptionPlan.findOne({
      where: { plan_key }
    });

    if (existingPlan) {
      return res.status(400).json({
        message: "Plan key already exists"
      });
    }

    // Create subscription plan
    const subscriptionPlan = await SubscriptionPlan.create({
      plan_key,
      name,
      price,
      currency,
      duration_days,
      description,
      features,
      max_users,
      is_active,
      created_by: req.userId || "admin"
    });

    return res.status(201).json({
      message: "Subscription plan created successfully",
      plan: subscriptionPlan
    });

  } catch (err) {
    console.error('Create subscription plan error:', err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get all subscription plans (public)
exports.getAllSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      order: [['price', 'ASC']]
    });

    return res.json({
      message: "Subscription plans retrieved successfully",
      total_plans: plans.length,
      plans: plans
    });
  } catch (err) {
    console.error('Get all subscription plans error:', err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get active subscription plans (public)
exports.getActiveSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { is_active: true },
      order: [['price', 'ASC']]
    });

    return res.json({
      message: "Active subscription plans retrieved successfully",
      total_plans: plans.length,
      plans: plans
    });
  } catch (err) {
    console.error('Get active subscription plans error:', err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get subscription plan by ID (public)
exports.getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        message: "Subscription plan not found"
      });
    }

    return res.json({
      message: "Subscription plan retrieved successfully",
      plan: plan
    });

  } catch (err) {
    console.error('Get subscription plan by ID error:', err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Update subscription plan (ADMIN ONLY)
exports.updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      plan_key,
      name,
      price,
      currency,
      duration_days,
      description,
      features,
      max_users,
      is_active
    } = req.body;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        message: "Subscription plan not found"
      });
    }

    // Check if plan_key is being updated and if it already exists
    if (plan_key && plan_key !== plan.plan_key) {
      const existingPlan = await SubscriptionPlan.findOne({
        where: { plan_key }
      });

      if (existingPlan) {
        return res.status(400).json({
          message: "Plan key already exists"
        });
      }
    }

    // Update plan
    const updateData = {
      plan_key: plan_key || plan.plan_key,
      name: name || plan.name,
      price: price !== undefined ? price : plan.price,
      currency: currency || plan.currency,
      duration_days: duration_days || plan.duration_days,
      description: description !== undefined ? description : plan.description,
      features: features !== undefined ? features : plan.features,
      max_users: max_users !== undefined ? max_users : plan.max_users,
      is_active: is_active !== undefined ? is_active : plan.is_active,
      updated_by: req.userId || "admin"
    };

    await plan.update(updateData);

    return res.json({
      message: "Subscription plan updated successfully",
      plan: plan
    });

  } catch (err) {
    console.error('Update subscription plan error:', err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Delete subscription plan (ADMIN ONLY)
exports.deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        message: "Subscription plan not found"
      });
    }

    // Check if plan is being used by any users
    const userCount = await db.user.count({
      where: { subscription_plan_id: id }
    });

    if (userCount > 0) {
      return res.status(400).json({
        message: `Cannot delete plan. ${userCount} user(s) are currently subscribed to this plan.`,
        user_count: userCount
      });
    }

    // Check if plan is being used by any active subscriptions
    const subscriptionCount = await db.subscription.count({
      where: { subscription_type: plan.plan_key }
    });

    if (subscriptionCount > 0) {
      return res.status(400).json({
        message: `Cannot delete plan. ${subscriptionCount} active subscription(s) are using this plan.`,
        subscription_count: subscriptionCount
      });
    }

    // Delete the plan
    await plan.destroy();

    return res.json({
      message: "Subscription plan deleted successfully",
      deleted_plan: {
        id: plan.id,
        plan_key: plan.plan_key,
        name: plan.name
      }
    });

  } catch (err) {
    console.error('Delete subscription plan error:', err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Soft delete subscription plan (ADMIN ONLY) - sets is_active to false
exports.deactivateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        message: "Subscription plan not found"
      });
    }

    if (!plan.is_active) {
      return res.status(400).json({
        message: "Subscription plan is already deactivated"
      });
    }

    // Deactivate the plan
    await plan.update({
      is_active: false,
      updated_by: req.userId || "admin"
    });

    return res.json({
      message: "Subscription plan deactivated successfully",
      plan: {
        id: plan.id,
        plan_key: plan.plan_key,
        name: plan.name,
        is_active: plan.is_active
      }
    });

  } catch (err) {
    console.error('Deactivate subscription plan error:', err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Reactivate subscription plan (ADMIN ONLY) - sets is_active to true
exports.reactivateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        message: "Subscription plan not found"
      });
    }

    if (plan.is_active) {
      return res.status(400).json({
        message: "Subscription plan is already active"
      });
    }

    // Reactivate the plan
    await plan.update({
      is_active: true,
      updated_by: req.userId || "admin"
    });

    return res.json({
      message: "Subscription plan reactivated successfully",
      plan: {
        id: plan.id,
        plan_key: plan.plan_key,
        name: plan.name,
        is_active: plan.is_active
      }
    });

  } catch (err) {
    console.error('Reactivate subscription plan error:', err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
