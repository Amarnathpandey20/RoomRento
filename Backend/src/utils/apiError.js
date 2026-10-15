/**
 * Custom ApiError class for centralized error handling
 * Extends built-in Error with status codes and validation error arrays.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error description
   * @param {Array} errors - Optional validation or field error array
   * @param {string} stack - Optional stack trace override
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Pre-configured common HTTP errors for convenience
  static badRequest(msg = 'Bad Request', errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Unauthorized access', errors = []) {
    return new ApiError(401, msg, errors);
  }

  static forbidden(msg = 'Forbidden: Access denied', errors = []) {
    return new ApiError(403, msg, errors);
  }

  static notFound(msg = 'Resource not found', errors = []) {
    return new ApiError(404, msg, errors);
  }

  static conflict(msg = 'Resource conflict or duplicate entry', errors = []) {
    return new ApiError(409, msg, errors);
  }

  static tooManyRequests(msg = 'Too many requests, please try again later', errors = []) {
    return new ApiError(429, msg, errors);
  }

  static internal(msg = 'Internal server error', errors = []) {
    return new ApiError(500, msg, errors);
  }
}

module.exports = ApiError;
