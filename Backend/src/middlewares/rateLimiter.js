const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT.WINDOW_MS, // 15 mins by default
  max: env.RATE_LIMIT.MAX, // e.g. 200 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many requests from this IP, please try again after 15 minutes'));
  }
});

// Stricter rate limiter for authentication routes (login, register, forgot-password)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many login attempts. Please try again after 15 minutes'));
  }
});

// Enquiry limiter to prevent spamming owners
const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Enquiry limit exceeded. Please wait a bit before sending more enquiries'));
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  enquiryLimiter
};
