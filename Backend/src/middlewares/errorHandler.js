const ApiError = require('../utils/apiError');
const env = require('../config/env');
const { logger } = require('../config/logger');

/**
 * 404 Route Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl} - Route not found on this server`));
};

/**
 * Centralized error handler
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not already an instance of ApiError, transform known errors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error instanceof SyntaxError ? 400 : 500);
    let message = error.message || 'Internal server error';
    let errors = [];

    // Mongoose bad ObjectId (CastError)
    if (error.name === 'CastError') {
      message = `Invalid format for resource identifier: ${error.value}`;
      error = new ApiError(400, message);
    }
    // Mongoose duplicate key error (E11000)
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      const val = error.keyValue ? error.keyValue[field] : '';
      message = `Duplicate value '${val}' for unique field '${field}'. Please provide an alternative`;
      error = new ApiError(409, message);
    }
    // Mongoose validation error
    else if (error.name === 'ValidationError') {
      errors = Object.values(error.errors || {}).map((val) => ({
        field: val.path,
        message: val.message
      }));
      message = 'Validation failed: ' + errors.map((e) => e.message).join(', ');
      error = new ApiError(400, message, errors);
    }
    // JWT token expired
    else if (error.name === 'TokenExpiredError') {
      message = 'Your session has expired. Please log in again';
      error = new ApiError(401, message);
    }
    // JWT malformed / invalid signature
    else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid authentication token';
      error = new ApiError(401, message);
    }
    // Multer file upload limit errors
    else if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File size is too large. Maximum allowed size is 10MB';
      error = new ApiError(400, message);
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Too many files uploaded or unexpected field name';
      error = new ApiError(400, message);
    } else {
      error = new ApiError(statusCode, message, errors, error.stack);
    }
  }

  // Log error
  if (error.statusCode >= 500) {
    logger.error(`[500 Server Error] ${req.method} ${req.originalUrl}: ${error.stack || error.message}`);
  } else {
    logger.warn(`[${error.statusCode} Client Error] ${req.method} ${req.originalUrl}: ${error.message}`);
  }

  const responsePayload = {
    success: false,
    message: error.message,
    ...(error.errors && error.errors.length > 0 ? { errors: error.errors } : {}),
    ...(env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  };

  return res.status(error.statusCode).json(responsePayload);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
