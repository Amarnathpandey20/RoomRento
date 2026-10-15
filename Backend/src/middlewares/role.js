const ApiError = require('../utils/apiError');

/**
 * Middleware factory for Role-Based Access Control (RBAC)
 * @param  {...string} roles - e.g. 'owner', 'admin'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize
};
