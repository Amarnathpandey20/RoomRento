const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Enquiry must specify a listing'],
      index: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Enquiry must belong to a tenant user'],
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Enquiry must specify an owner'],
      index: true
    },
    message: {
      type: String,
      required: [true, 'Enquiry message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    preferredContact: {
      type: String,
      enum: ['call', 'whatsapp', 'email'],
      default: 'whatsapp'
    },
    moveInDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'visit-scheduled', 'closed'],
      default: 'new',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
enquirySchema.index({ listing: 1, tenant: 1, createdAt: -1 });
enquirySchema.index({ owner: 1, status: 1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
