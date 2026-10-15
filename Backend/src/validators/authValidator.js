const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters'
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Please provide a valid email address'
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Password must be at least 6 characters long'
  }),
  phone: Joi.string().trim().allow('', null),
  role: Joi.string().valid('tenant', 'owner', 'admin').default('tenant'),
  city: Joi.string().trim().allow('', null)
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Valid email is required to login'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  phone: Joi.string().trim().allow('', null),
  city: Joi.string().trim().allow('', null),
  bio: Joi.string().trim().max(500).allow('', null),
  avatar: Joi.string().uri().allow('', null),
  responseTimeAvg: Joi.string().allow('', null)
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema
};
