const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Review must reference a listing'],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must reference a user'],
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    cleanliness: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    safety: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    ownerBehaviour: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [1200, 'Comment cannot exceed 1200 characters']
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// One review per user per listing
reviewSchema.index({ listing: 1, user: 1 }, { unique: true });

/**
 * Static method to calculate and persist aggregate ratings on the Listing model
 */
reviewSchema.statics.calculateListingAverage = async function (listingId) {
  const stats = await this.aggregate([
    {
      $match: { listing: new mongoose.Types.ObjectId(listingId) }
    },
    {
      $group: {
        _id: '$listing',
        ratingCount: { $sum: 1 },
        ratingAvg: { $avg: '$rating' },
        cleanlinessAvg: { $avg: '$cleanliness' },
        safetyAvg: { $avg: '$safety' },
        valueForMoneyAvg: { $avg: '$valueForMoney' },
        ownerBehaviourAvg: { $avg: '$ownerBehaviour' }
      }
    }
  ]);

  const Listing = mongoose.model('Listing');

  if (stats.length > 0) {
    await Listing.findByIdAndUpdate(listingId, {
      ratingAvg: Math.round(stats[0].ratingAvg * 10) / 10,
      ratingCount: stats[0].ratingCount,
      ratingBreakdown: {
        cleanliness: Math.round(stats[0].cleanlinessAvg * 10) / 10,
        safety: Math.round(stats[0].safetyAvg * 10) / 10,
        valueForMoney: Math.round(stats[0].valueForMoneyAvg * 10) / 10,
        ownerBehaviour: Math.round(stats[0].ownerBehaviourAvg * 10) / 10
      }
    });
  } else {
    // Reset to defaults if all reviews deleted
    await Listing.findByIdAndUpdate(listingId, {
      ratingAvg: 0,
      ratingCount: 0,
      ratingBreakdown: {
        cleanliness: 0,
        safety: 0,
        valueForMoney: 0,
        ownerBehaviour: 0
      }
    });
  }
};

// Post-save hook to recalculate aggregates
reviewSchema.post('save', async function () {
  await this.constructor.calculateListingAverage(this.listing);
});

// Post-remove / delete hook to recalculate aggregates
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateListingAverage(doc.listing);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
