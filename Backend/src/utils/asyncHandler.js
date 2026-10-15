/**
 * Wraps async express routes to eliminate repetitive try-catch blocks
 * and pass uncaught rejections directly to the centralized error handler.
 *
 * @param {Function} requestHandler - (req, res, next) async handler
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
