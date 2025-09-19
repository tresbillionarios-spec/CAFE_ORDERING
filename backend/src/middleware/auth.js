const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: require('../models').Cafe,
        as: 'cafe',
        required: false
      }]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'User not found or account is inactive' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please login again' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'An error occurred during authentication' 
    });
  }
};

// Middleware to check if user is cafe owner
const requireCafeOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please login to access this resource' 
      });
    }

    if (req.user.role !== 'cafe_owner') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'This resource is only available to cafe owners' 
      });
    }

    next();
  } catch (error) {
    console.error('Cafe owner middleware error:', error);
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'An error occurred during authorization' 
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please login to access this resource' 
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'This resource is only available to administrators' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'An error occurred during authorization' 
    });
  }
};

// Middleware to check if user owns the cafe
const requireCafeOwnership = async (req, res, next) => {
  try {
    const cafeId = req.params.cafeId || req.params.id;
    
    if (!cafeId) {
      return res.status(400).json({ 
        error: 'Cafe ID required',
        message: 'Please provide a valid cafe ID' 
      });
    }

    const { Cafe } = require('../models');
    const cafe = await Cafe.findOne({
      where: { 
        id: cafeId,
        owner_id: req.user.id 
      }
    });

    if (!cafe) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You do not have permission to access this cafe' 
      });
    }

    req.cafe = cafe;
    next();
  } catch (error) {
    console.error('Cafe ownership middleware error:', error);
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'An error occurred during authorization' 
    });
  }
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireCafeOwner,
  requireAdmin,
  requireCafeOwnership,
  optionalAuth
};
