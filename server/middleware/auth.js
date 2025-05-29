const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Vendor can only access their own data
const checkVendorAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'vendor') {
      req.vendorId = req.user._id;
    } else if (req.user.role === 'delivery_partner') {
      req.vendorId = req.user.vendorId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor or delivery partner access required.'
      });
    }
    next();
  } catch (error) {
    console.error('Vendor access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during access check.'
    });
  }
};

module.exports = { auth, authorize, checkVendorAccess };
