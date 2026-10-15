const Joi = require('joi');

const createVisitSchema = Joi.object({
  scheduledAt: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Visit time must be in the future',
    'any.required': 'Scheduled date and time is required'
  }),
  note: Joi.string().trim().max(500).allow('', null)
});

const updateVisitSchema = Joi.object({
  status: Joi.string().valid('requested', 'confirmed', 'completed', 'cancelled', 'rescheduled'),
  scheduledAt: Joi.date().iso().allow(null),
  note: Joi.string().trim().max(500).allow('', null)
}).min(1);

module.exports = {
  createVisitSchema,
  updateVisitSchema
};
