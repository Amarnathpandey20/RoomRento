const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Report must reference a listing'],
      index: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Report must reference the reporting user'],
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: [
        'incorrect_pricing',
        'fake_photos',
        'already_rented',
        'scam_or_fraud',
        'inappropriate_behavior',
        'offensive_content',
        'other'
      ],
      default: 'other'
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'dismissed'],
      default: 'open',
      index: true
    },
    resolutionNote: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ listing: 1, reportedBy: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
