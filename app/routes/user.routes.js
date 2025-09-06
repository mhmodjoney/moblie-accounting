const express = require("express");
const router = express.Router();
const authController = require("../controllers/user.controller");
const { verifyToken, checkSubscription } = require("../middleware/auth.middleware");
const { checkAdminRole } = require("../middleware/admin.middleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes (require authentication)
router.get("/subscription", verifyToken, authController.checkSubscription);
router.post("/upgrade-subscription", verifyToken, authController.checkSubscription, authController.upgradeSubscription);
router.get("/status", verifyToken, authController.checkSubscription);

// ADMIN ONLY routes (require admin role)
router.get("/admin/users", verifyToken, checkAdminRole, authController.getAllUsers);
router.post("/admin/upgrade-user", verifyToken, checkAdminRole, authController.adminUpgradeUserSubscription);
router.post("/admin/update-user-status", verifyToken, checkAdminRole, authController.adminUpdateUserStatus);
router.post("/admin/reset-user-device", verifyToken, checkAdminRole, authController.adminResetUserDevice);

module.exports = router;
