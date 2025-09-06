const db = require("../models");
const User = db.user;

const checkAdminRole = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ 
        message: "Access denied. Admin privileges required." 
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

module.exports = {
  checkAdminRole
};
