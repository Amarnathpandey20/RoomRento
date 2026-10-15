const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Visit must reference a listing'],
      index: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Visit must reference a tenant user'],
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Visit must reference an owner'],
      index: true
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'requested',
      index: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes
visitSchema.index({ tenant: 1, scheduledAt: -1 });
visitSchema.index({ owner: 1, status: 1 });
visitSchema.index({ listing: 1, status: 1 });

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;
