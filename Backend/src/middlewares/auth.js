const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect routes: verifies access token from Bearer header or signed/unsigned cookies
 */
const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1. Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check httpOnly cookies as fallback
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required: please log in to continue');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('+role +isActive +isDeleted');

    if (!user) {
      throw ApiError.unauthorized('User account no longer exists');
    }

    if (user.isDeleted) {
      throw ApiError.unauthorized('Account has been deactivated or deleted');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been suspended by administration');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token has expired. Please refresh your token');
    }
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid authentication token');
    }
    throw error;
  }
});

/**
 * Optional authentication: attaches req.user if a valid token is present,
 * but allows public/anonymous requests to proceed if not.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('+role +isActive +isDeleted');
    if (user && !user.isDeleted && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }

  next();
});

module.exports = {
  protect,
  optionalAuth
};
