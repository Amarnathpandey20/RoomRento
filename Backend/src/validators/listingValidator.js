const Joi = require('joi');

const createListingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required(),
  subtitle: Joi.string().trim().allow('', null),
  description: Joi.string()
    .trim()
    .empty('')
    .default('Spacious, well-ventilated stay with modern amenities, round-the-clock water, and excellent connectivity.')
    .max(5000),
  availableFrom: Joi.date().iso().allow(null),
  status: Joi.string().valid('draft', 'pending', 'published', 'archived').default('published'),

  propertyType: Joi.string().valid('room', 'pg', 'flat', 'hostel', 'studio').required(),
  roomType: Joi.string()
    .valid('single', 'double-sharing', 'triple-sharing', '1RK', '1BHK', '2BHK', '3BHK', 'studio')
    .required(),

  details: Joi.object({
    floorNumber: Joi.number().integer().allow(null),
    totalFloors: Joi.number().integer().min(1).allow(null),
    areaSqFt: Joi.number().positive().allow(null),
    totalOccupants: Joi.number().integer().positive().allow(null),
    propertyAgeYears: Joi.number().min(0).allow(null),
    furnishing: Joi.string().valid('furnished', 'semi-furnished', 'unfurnished').default('furnished'),
    bedType: Joi.string().allow('', null),
    bedSize: Joi.string().allow('', null),
    facing: Joi.string().allow('', null)
  }).default(),

  location: Joi.object({
    address: Joi.string().required(),
    area: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    state: Joi.string().default('Karnataka'),
    pincode: Joi.string().allow('', null),
    landmark: Joi.string().allow('', null),
    distanceText: Joi.string().allow('', null),
    geo: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).default([77.6271, 12.9352])
    }).default({
      type: 'Point',
      coordinates: [77.6271, 12.9352]
    })
  }).required(),

  pricing: Joi.object({
    monthlyRent: Joi.number().min(0).required(),
    securityDeposit: Joi.number().min(0).default(0),
    brokerage: Joi.number().min(0).default(0),
    maintenanceCharges: Joi.number().min(0).default(0),
    electricity: Joi.string().valid('included', 'metered').default('metered'),
    electricityRate: Joi.number().min(0).default(9),
    waterCharges: Joi.number().min(0).default(0),
    isNegotiable: Joi.boolean().default(false),
    discounts: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        percentage: Joi.number().min(0).max(100),
        description: Joi.string().allow('')
      })
    ).default([]),
    currency: Joi.string().default('INR'),
    offerTag: Joi.string().allow('', null)
  }).required(),

  roomFeatures: Joi.object({
    wardrobe: Joi.boolean().default(false),
    studyTable: Joi.boolean().default(false),
    ac: Joi.boolean().default(false),
    cooler: Joi.boolean().default(false),
    fan: Joi.boolean().default(true),
    attachedBathroom: Joi.boolean().default(false),
    geyser: Joi.boolean().default(false),
    balcony: Joi.boolean().default(false),
    window: Joi.boolean().default(true),
    naturalLight: Joi.boolean().default(true),
    tv: Joi.boolean().default(false),
    fridge: Joi.boolean().default(false),
    mattressIncluded: Joi.boolean().default(false)
  }).default(),

  buildingFacilities: Joi.object({
    wifi: Joi.boolean().default(false),
    powerBackup: Joi.boolean().default(false),
    lift: Joi.boolean().default(false),
    water24x7: Joi.boolean().default(true),
    roDrinkingWater: Joi.boolean().default(false),
    bikeParking: Joi.boolean().default(false),
    carParking: Joi.boolean().default(false),
    cctv: Joi.boolean().default(false),
    securityGuard: Joi.boolean().default(false),
    fireSafety: Joi.boolean().default(false),
    laundry: Joi.boolean().default(false),
    commonKitchen: Joi.boolean().default(false),
    diningArea: Joi.boolean().default(false),
    terraceAccess: Joi.boolean().default(false),
    gym: Joi.boolean().default(false),
    housekeeping: Joi.boolean().default(false),
    commonLounge: Joi.boolean().default(false)
  }).default(),

  foodServices: Joi.object({
    mealsIncluded: Joi.string().valid('none', 'veg', 'non-veg', 'both').default('none'),
    tiffinService: Joi.boolean().default(false),
    cookingAllowed: Joi.boolean().default(true),
    maidService: Joi.boolean().default(false),
    cleaningFrequency: Joi.string().valid('daily', 'weekly', 'none').default('weekly')
  }).default(),

  rules: Joi.object({
    genderPreference: Joi.string().valid('boys', 'girls', 'family', 'any').default('any'),
    bachelorsAllowed: Joi.boolean().default(true),
    couplesAllowed: Joi.boolean().default(true),
    petsAllowed: Joi.boolean().default(false),
    smokingAllowed: Joi.boolean().default(false),
    drinkingAllowed: Joi.boolean().default(false),
    visitorsAllowed: Joi.boolean().default(true),
    gateClosingTime: Joi.string().allow('', null),
    noticePeriodDays: Joi.number().integer().min(0).default(30),
    minimumStayMonths: Joi.number().integer().min(0).default(3)
  }).default(),

  nearby: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('metro', 'bus', 'railway', 'college', 'office', 'market', 'hospital', 'atm', 'gym', 'other'),
      name: Joi.string().required(),
      distanceKm: Joi.number().min(0).required()
    })
  ).default([]),

  safetyRating: Joi.number().min(1).max(5).default(4.5),
  walkScore: Joi.number().min(0).max(100).default(85),

  images: Joi.array().items(
    Joi.object({
      url: Joi.string().required(),
      publicId: Joi.string().allow('', null).default(''),
      order: Joi.number().integer().default(0),
      isCover: Joi.boolean().default(false)
    })
  ).default([]),
  videoUrl: Joi.string().allow('', null),
  virtualTourUrl: Joi.string().allow('', null)
});

// Draft schema allows partial fields for autosave
const draftListingSchema = Joi.object({
  title: Joi.string().trim().max(120).allow(''),
  subtitle: Joi.string().trim().allow(''),
  description: Joi.string().trim().max(5000).allow(''),
  propertyType: Joi.string().valid('room', 'pg', 'flat', 'hostel', 'studio').allow(''),
  roomType: Joi.string().allow(''),
  details: Joi.object().unknown(),
  location: Joi.object().unknown(),
  pricing: Joi.object().unknown(),
  roomFeatures: Joi.object().unknown(),
  buildingFacilities: Joi.object().unknown(),
  foodServices: Joi.object().unknown(),
  rules: Joi.object().unknown(),
  nearby: Joi.array(),
  images: Joi.array()
}).unknown();

const updateListingSchema = createListingSchema.fork(
  ['title', 'description', 'propertyType', 'roomType', 'location', 'pricing'],
  (schema) => schema.optional()
);

const compareListingSchema = Joi.object({
  ids: Joi.array().items(Joi.string().required()).min(1).max(3).required().messages({
    'array.min': 'Please specify at least 1 listing ID to compare',
    'array.max': 'You can compare up to 3 listings simultaneously'
  })
});

const reorderImagesSchema = Joi.object({
  imageOrders: Joi.array().items(
    Joi.object({
      imageId: Joi.string().required(),
      order: Joi.number().integer().required(),
      isCover: Joi.boolean().default(false)
    })
  ).required()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('draft', 'pending', 'published', 'rented', 'archived').required()
});

module.exports = {
  createListingSchema,
  draftListingSchema,
  updateListingSchema,
  compareListingSchema,
  reorderImagesSchema,
  updateStatusSchema
};
