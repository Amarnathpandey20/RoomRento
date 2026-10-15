const Joi = require('joi');

const createReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5'
  }),
  cleanliness: Joi.number().min(1).max(5).default(5),
  safety: Joi.number().min(1).max(5).default(5),
  valueForMoney: Joi.number().min(1).max(5).default(5),
  ownerBehaviour: Joi.number().min(1).max(5).default(5),
  comment: Joi.string().trim().min(5).max(1200).required().messages({
    'string.min': 'Review comment must be at least 5 characters'
  })
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5),
  cleanliness: Joi.number().min(1).max(5),
  safety: Joi.number().min(1).max(5),
  valueForMoney: Joi.number().min(1).max(5),
  ownerBehaviour: Joi.number().min(1).max(5),
  comment: Joi.string().trim().min(5).max(1200)
}).min(1);

module.exports = {
  createReviewSchema,
  updateReviewSchema
};
