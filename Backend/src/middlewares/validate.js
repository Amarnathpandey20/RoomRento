const ApiError = require('../utils/apiError');

/**
 * Validates request data (body, query, or params) against a Joi schema
 * @param {import('joi').Schema} schema - Joi schema object
 * @param {'body'|'query'|'params'} property - Target property on the Express request
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    if (!schema) return next();

    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // collect all validation errors
      stripUnknown: true, // remove unrecognized fields safely
      allowUnknown: false
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      const summaryMessage = errorDetails.map((e) => e.message).join(', ');
      return next(new ApiError(400, `Validation Error: ${summaryMessage}`, errorDetails));
    }

    // Overwrite with sanitized and validated values
    req[property] = value;
    next();
  };
};

module.exports = validate;
