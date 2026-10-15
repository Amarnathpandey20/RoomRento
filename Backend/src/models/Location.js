const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    area: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    state: {
      type: String,
      default: 'Karnataka'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      default: [77.5946, 12.9716]
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true
    },
    listingCount: {
      type: Number,
      default: 0
    },
    heroImage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

locationSchema.index({ city: 1, area: 1 }, { unique: true });
locationSchema.index({ isPopular: -1, listingCount: -1 });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
