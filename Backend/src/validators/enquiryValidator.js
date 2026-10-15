const Joi = require('joi');

const createEnquirySchema = Joi.object({
  message: Joi.string().trim().min(5).max(1000).required().messages({
    'string.empty': 'Enquiry message is required',
    'string.min': 'Message must be at least 5 characters'
  }),
  phone: Joi.string().trim().allow('', null),
  preferredContact: Joi.string().valid('call', 'whatsapp', 'email').default('whatsapp'),
  moveInDate: Joi.date().iso().allow(null)
});

const updateEnquiryStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'contacted', 'visit-scheduled', 'closed').required()
});

module.exports = {
  createEnquirySchema,
  updateEnquiryStatusSchema
};
