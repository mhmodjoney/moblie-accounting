const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");
const { verifyToken, checkSubscription } = require("../middleware/auth.middleware");
const { checkAdminRole } = require("../middleware/admin.middleware");

// Public routes
router.get("/plans", subscriptionController.getSubscriptionPlans);

// Protected routes (require authentication)
router.get("/user", verifyToken, subscriptionController.getUserSubscription);
router.post("/create", verifyToken, subscriptionController.createSubscription);

// ADMIN ONLY routes for sensitive operations
router.put("/:subscription_id", verifyToken, checkAdminRole, subscriptionController.updateSubscription);
router.delete("/:subscription_id/cancel", verifyToken, checkAdminRole, subscriptionController.cancelSubscription);
router.get("/admin/all", verifyToken, checkAdminRole, subscriptionController.getAllSubscriptions);

module.exports = router;
