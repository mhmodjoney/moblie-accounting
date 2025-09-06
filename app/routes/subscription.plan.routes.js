const express = require("express");
const router = express.Router();
const subscriptionPlanController = require("../controllers/subscription.plan.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkAdminRole } = require("../middleware/admin.middleware");

// Public routes (no authentication required)
router.get("/", subscriptionPlanController.getAllSubscriptionPlans);
router.get("/active", subscriptionPlanController.getActiveSubscriptionPlans);
router.get("/:id", subscriptionPlanController.getSubscriptionPlanById);

// Admin only routes (require authentication and admin role)
router.post("/", verifyToken, checkAdminRole, subscriptionPlanController.createSubscriptionPlan);
router.put("/:id", verifyToken, checkAdminRole, subscriptionPlanController.updateSubscriptionPlan);
router.delete("/:id", verifyToken, checkAdminRole, subscriptionPlanController.deleteSubscriptionPlan);
router.patch("/:id/deactivate", verifyToken, checkAdminRole, subscriptionPlanController.deactivateSubscriptionPlan);
router.patch("/:id/reactivate", verifyToken, checkAdminRole, subscriptionPlanController.reactivateSubscriptionPlan);

module.exports = router;
