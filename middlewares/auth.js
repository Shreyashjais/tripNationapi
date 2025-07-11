//auth, isSuperAdmin, isAdmin, isUser

const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req, res, next) => {
  try {
    // const token = req.body.token;
    const token= req.cookies?.token || req.body?.token || req.header('Authorization').replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
    next();
  } catch (error) {
    console.error(error)
    return res.status(401).json({
      succeess: false,
      message: "Error in fetching the token",
    });
  }
};

exports.isSuperAdmin = (req, res, next) => {
  try {
    if (req.user?.role !== "superAdmin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for students",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.isAdmin = (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(401).json({
        succeess: false,
        message: "This is a protected route for Admins",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


exports.isCustomer = (req, res, next) => {
    try {
      if (req.user?.role !== "customer") {
        return res.status(401).json({
          success: false,
          message: "This is a protected route for Users",
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
  
  exports.allowAdminOrSuperAdmin = (req, res, next) => {
    if (req.user?.role === "admin" || req.user?.role === "superAdmin") {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: "Access restricted to admin or superAdmin only",
    });
  }