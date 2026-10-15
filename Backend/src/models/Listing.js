const mongoose = require('mongoose');
const slugify = require('slugify');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isCover: { type: Boolean, default: false }
  },
  { _id: true }
);

const nearbySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['metro', 'bus', 'railway', 'college', 'office', 'market', 'hospital', 'atm', 'gym', 'other'],
      default: 'other'
    },
    name: { type: String, required: true },
    distanceKm: { type: Number, required: true }
  },
  { _id: false }
);

const discountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., 'earlyBird', 'longStay', 'festive'
    percentage: { type: Number, default: 0 },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Listing must belong to an owner'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    subtitle: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rented', 'rejected', 'archived'],
      default: 'pending',
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    views: {
      type: Number,
      default: 0
    },
    postedAt: {
      type: Date,
      default: Date.now
    },
    availableFrom: {
      type: Date,
      default: Date.now,
      index: true
    },

    propertyType: {
      type: String,
      enum: ['room', 'pg', 'flat', 'hostel', 'studio'],
      required: [true, 'Property type is required'],
      index: true
    },
    roomType: {
      type: String,
      enum: ['single', 'double-sharing', 'triple-sharing', '1RK', '1BHK', '2BHK', '3BHK', 'studio'],
      required: [true, 'Room type is required'],
      index: true
    },

    // Specifications & Details
    details: {
      floorNumber: { type: Number, default: 1 },
      totalFloors: { type: Number, default: 1 },
      areaSqFt: { type: Number, default: 250 },
      totalOccupants: { type: Number, default: 1 },
      propertyAgeYears: { type: Number, default: 2 },
      furnishing: {
        type: String,
        enum: ['furnished', 'semi-furnished', 'unfurnished'],
        default: 'furnished',
        index: true
      },
      bedType: { type: String, default: 'Single Bed' }, // Single, Double, Queen, Bunk
      bedSize: { type: String, default: 'Standard' },
      facing: { type: String, default: 'East' }
    },

    // Location & Geo
    location: {
      address: { type: String, required: true },
      area: { type: String, required: true, trim: true, index: true },
      city: { type: String, required: true, trim: true, index: true },
      state: { type: String, default: 'Karnataka' },
      pincode: { type: String, default: '' },
      landmark: { type: String, default: '' },
      distanceText: { type: String, default: '' },
      geo: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true,
          default: [77.5946, 12.9716] // Bengaluru default
        }
      }
    },

    // Pricing Structure
    pricing: {
      monthlyRent: { type: Number, required: true, min: 0, index: true },
      securityDeposit: { type: Number, required: true, min: 0, default: 0 },
      brokerage: { type: Number, default: 0 }, // 0 = zero brokerage
      maintenanceCharges: { type: Number, default: 0 },
      electricity: {
        type: String,
        enum: ['included', 'metered'],
        default: 'metered'
      },
      electricityRate: { type: Number, default: 9 }, // per unit
      waterCharges: { type: Number, default: 0 },
      isNegotiable: { type: Boolean, default: false },
      discounts: [discountSchema],
      currency: { type: String, default: 'INR' },
      offerTag: { type: String, default: '' }
    },

    // Room Amenities (Booleans)
    roomFeatures: {
      wardrobe: { type: Boolean, default: false },
      studyTable: { type: Boolean, default: false },
      ac: { type: Boolean, default: false },
      cooler: { type: Boolean, default: false },
      fan: { type: Boolean, default: true },
      attachedBathroom: { type: Boolean, default: false },
      geyser: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
      window: { type: Boolean, default: true },
      naturalLight: { type: Boolean, default: true },
      tv: { type: Boolean, default: false },
      fridge: { type: Boolean, default: false },
      mattressIncluded: { type: Boolean, default: false }
    },

    // Building Facilities (Booleans)
    buildingFacilities: {
      wifi: { type: Boolean, default: false },
      powerBackup: { type: Boolean, default: false },
      lift: { type: Boolean, default: false },
      water24x7: { type: Boolean, default: true },
      roDrinkingWater: { type: Boolean, default: false },
      bikeParking: { type: Boolean, default: false },
      carParking: { type: Boolean, default: false },
      cctv: { type: Boolean, default: false },
      securityGuard: { type: Boolean, default: false },
      fireSafety: { type: Boolean, default: false },
      laundry: { type: Boolean, default: false },
      commonKitchen: { type: Boolean, default: false },
      diningArea: { type: Boolean, default: false },
      terraceAccess: { type: Boolean, default: false },
      gym: { type: Boolean, default: false },
      housekeeping: { type: Boolean, default: false },
      commonLounge: { type: Boolean, default: false }
    },

    // Food Services & Mess
    foodServices: {
      mealsIncluded: {
        type: String,
        enum: ['none', 'veg', 'non-veg', 'both'],
        default: 'none'
      },
      tiffinService: { type: Boolean, default: false },
      cookingAllowed: { type: Boolean, default: true },
      maidService: { type: Boolean, default: false },
      cleaningFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'none'],
        default: 'weekly'
      }
    },

    // House Rules & Policy
    rules: {
      genderPreference: {
        type: String,
        enum: ['boys', 'girls', 'family', 'any'],
        default: 'any',
        index: true
      },
      bachelorsAllowed: { type: Boolean, default: true },
      couplesAllowed: { type: Boolean, default: true },
      petsAllowed: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      drinkingAllowed: { type: Boolean, default: false },
      visitorsAllowed: { type: Boolean, default: true },
      gateClosingTime: { type: String, default: 'No curfew' },
      noticePeriodDays: { type: Number, default: 30 },
      minimumStayMonths: { type: Number, default: 3 }
    },

    nearby: [nearbySchema],
    safetyRating: { type: Number, default: 4.5, min: 1, max: 5 },
    walkScore: { type: Number, default: 85, min: 0, max: 100 },

    images: [imageSchema],
    videoUrl: { type: String, default: '' },
    virtualTourUrl: { type: String, default: '' },

    // Dynamic metrics & counters
    ratingAvg: { type: Number, default: 0, min: 0, max: 5, index: true },
    ratingCount: { type: Number, default: 0 },
    ratingBreakdown: {
      cleanliness: { type: Number, default: 0 },
      safety: { type: Number, default: 0 },
      valueForMoney: { type: Number, default: 0 },
      ownerBehaviour: { type: Number, default: 0 }
    },
    enquiryCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
// 1. Text Search Index for keyword search: title, description, location.area, location.city
listingSchema.index(
  {
    title: 'text',
    description: 'text',
    'location.area': 'text',
    'location.city': 'text'
  },
  {
    weights: {
      title: 5,
      'location.area': 4,
      'location.city': 3,
      description: 1
    },
    name: 'ListingTextSearchIndex'
  }
);

// 2. 2dsphere index on location.geo for geospatial proximity & radius queries
listingSchema.index({ 'location.geo': '2dsphere' });

// 3. High-traffic compound indexes for search filters & sorting
listingSchema.index({ 'location.city': 1, status: 1, 'pricing.monthlyRent': 1 });
listingSchema.index({ roomType: 1, 'details.furnishing': 1 });
listingSchema.index({ status: 1, isDeleted: 1, isFeatured: -1, createdAt: -1 });

// Slug generator pre-save middleware
listingSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = slugify(this.title, { lower: true, strict: true, trim: true });
    // Append random 6-character hex suffix to ensure global uniqueness without race conditions
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
  next();
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
