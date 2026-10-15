const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a recipient user'],
      index: true
    },
    type: {
      type: String,
      enum: [
        'enquiry_received',
        'enquiry_status_updated',
        'visit_requested',
        'visit_confirmed',
        'visit_rescheduled',
        'visit_cancelled',
        'listing_verified',
        'listing_rejected',
        'listing_rented',
        'new_review',
        'system'
      ],
      default: 'system'
    },
    title: {
      type: String,
      default: 'Notification'
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    link: {
      type: String,
      default: ''
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
