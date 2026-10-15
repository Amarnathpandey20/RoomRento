const Joi = require('joi');

const createReportSchema = Joi.object({
  reason: Joi.string()
    .valid(
      'incorrect_pricing',
      'fake_photos',
      'already_rented',
      'scam_or_fraud',
      'inappropriate_behavior',
      'offensive_content',
      'other'
    )
    .required(),
  description: Joi.string().trim().min(5).max(1000).required()
});

const resolveReportSchema = Joi.object({
  status: Joi.string().valid('resolved', 'dismissed').required(),
  resolutionNote: Joi.string().trim().allow('', null)
});

module.exports = {
  createReportSchema,
  resolveReportSchema
};
