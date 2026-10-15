const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Location = require('../models/Location');
const Wishlist = require('../models/Wishlist');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, formatPaginationMeta } = require('../utils/pagination');
const { calculateDistanceKm, formatDistanceText } = require('../utils/geo');
const { buildListingQuery } = require('../services/listingQueryBuilder');
const cache = require('../config/redis');

/**
 * @route   GET /api/v1/listings
 * @desc    Public search with dynamic room, building, food, rules, price, geo filters
 */
const searchListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 12, 50);
  const cacheKey = `search:${JSON.stringify(req.query)}:p${page}:l${limit}`;

  // Check cache first for rapid repeated searches
  const cachedResult = await cache.get(cacheKey);
  if (cachedResult) {
    return ApiResponse.ok(res, cachedResult.data, 'Search results (cached)', cachedResult.meta);
  }

  // Build dynamic MongoDB filter and sort criteria
  const { filter, sort, appliedFilters, geoCoords } = buildListingQuery(req.query);

  // Execute query with lean() and projection for high performance
  const [total, listings] = await Promise.all([
    Listing.countDocuments(filter),
    Listing.find(filter)
      .select(
        'title subtitle slug propertyType roomType details location pricing roomFeatures buildingFacilities foodServices rules images ratingAvg ratingCount isVerified isFeatured views availableFrom createdAt'
      )
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name avatar responseTimeAvg verifiedOwner')
      .lean()
  ]);

  // If user provided geo coordinates, calculate exact distance and distanceText for each listing
  let processedListings = listings;
  if (geoCoords && geoCoords.lat && geoCoords.lng) {
    processedListings = listings.map((item) => {
      if (item.location && item.location.geo && item.location.geo.coordinates) {
        const [lng, lat] = item.location.geo.coordinates;
        const distanceKm = calculateDistanceKm(geoCoords.lat, geoCoords.lng, lat, lng);
        return {
          ...item,
          distanceKm,
          distanceText: `${formatDistanceText(distanceKm)} from search location`
        };
      }
      return item;
    });

    // If sorting by nearest, sort by computed distance
    if (req.query.sort === 'nearest') {
      processedListings.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }
  }

  const meta = formatPaginationMeta(total, page, limit, { appliedFilters });

  // Cache response for 60 seconds
  await cache.set(cacheKey, { data: processedListings, meta }, 60);

  return ApiResponse.ok(res, processedListings, 'Listings fetched successfully', meta);
});

/**
 * @route   GET /api/v1/listings/featured
 * @desc    Get top featured verified listings for homepage
 */
const getFeaturedListings = asyncHandler(async (req, res) => {
  const cacheKey = 'listings:featured';
  const cached = await cache.get(cacheKey);
  if (cached) {
    return ApiResponse.ok(res, cached, 'Featured listings (cached)');
  }

  const listings = await Listing.find({
    status: 'published',
    isDeleted: false,
    isFeatured: true
  })
    .sort({ ratingAvg: -1, views: -1 })
    .limit(8)
    .populate('owner', 'name avatar verifiedOwner responseTimeAvg')
    .lean();

  await cache.set(cacheKey, listings, 300); // 5 mins cache
  return ApiResponse.ok(res, listings, 'Featured listings fetched successfully');
});

/**
 * @route   GET /api/v1/listings/popular-areas
 * @desc    Get top localities with average pricing and listing count via aggregation
 */
const getPopularAreas = asyncHandler(async (req, res) => {
  const cacheKey = 'listings:popular-areas';
  const cached = await cache.get(cacheKey);
  if (cached) {
    return ApiResponse.ok(res, cached, 'Popular areas (cached)');
  }

  const popularAreas = await Listing.aggregate([
    {
      $match: {
        status: 'published',
        isDeleted: false
      }
    },
    {
      $group: {
        _id: {
          area: '$location.area',
          city: '$location.city'
        },
        listingCount: { $sum: 1 },
        avgRent: { $avg: '$pricing.monthlyRent' },
        minRent: { $min: '$pricing.monthlyRent' },
        maxRent: { $max: '$pricing.monthlyRent' },
        sampleImage: { $first: { $arrayElemAt: ['$images.url', 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        area: '$_id.area',
        city: '$_id.city',
        listingCount: 1,
        avgRent: { $round: ['$avgRent', 0] },
        minRent: 1,
        maxRent: 1,
        sampleImage: 1
      }
    },
    { $sort: { listingCount: -1 } },
    { $limit: 12 }
  ]);

  await cache.set(cacheKey, popularAreas, 600); // 10 mins cache
  return ApiResponse.ok(res, popularAreas, 'Popular areas fetched successfully');
});

/**
 * @route   GET /api/v1/listings/autocomplete?q=
 * @desc    Search areas, cities, and titles for fast autocomplete input
 */
const autocomplete = asyncHandler(async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return ApiResponse.ok(res, [], 'Empty query');
  }

  const regex = new RegExp(query, 'i');

  const [areas, listings] = await Promise.all([
    Listing.distinct('location.area', {
      'location.area': regex,
      status: 'published',
      isDeleted: false
    }),
    Listing.find({
      title: regex,
      status: 'published',
      isDeleted: false
    })
      .select('title slug location.area location.city pricing.monthlyRent images')
      .limit(5)
      .lean()
  ]);

  const suggestions = [
    ...areas.slice(0, 5).map((area) => ({
      type: 'area',
      title: area,
      subtitle: 'Locality'
    })),
    ...listings.map((item) => ({
      type: 'listing',
      id: item._id,
      slug: item.slug,
      title: item.title,
      subtitle: `${item.location.area}, ${item.location.city} • ₹${item.pricing.monthlyRent.toLocaleString('en-IN')}`,
      image: item.images && item.images[0] ? item.images[0].url : ''
    }))
  ];

  return ApiResponse.ok(res, suggestions, 'Autocomplete suggestions');
});

/**
 * @route   GET /api/v1/listings/:idOrSlug
 * @desc    Get detailed listing by ID or unique slug, incrementing view count atomically
 */
const getListingDetails = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
  query.isDeleted = false;

  // Increment view counter atomically in background
  const listing = await Listing.findOneAndUpdate(
    query,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('owner', 'name email phone avatar responseTimeAvg totalListings verifiedOwner createdAt');

  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  // Check if current authenticated user has wishlisted this listing
  let isWishlisted = false;
  if (req.user) {
    const exists = await Wishlist.exists({ user: req.user._id, listing: listing._id });
    isWishlisted = Boolean(exists);
  }

  const responseData = {
    ...listing.toObject(),
    isWishlisted
  };

  return ApiResponse.ok(res, responseData, 'Listing details retrieved successfully');
});

/**
 * @route   GET /api/v1/listings/:id/similar
 * @desc    Find similar listings based on property type, room type, and locality
 */
const getSimilarListings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const current = await Listing.findById(id).select('propertyType roomType location pricing');
  if (!current) {
    throw ApiError.notFound('Listing not found');
  }

  // Find other published listings matching either same area or roomType/propertyType
  const similar = await Listing.find({
    _id: { $ne: current._id },
    status: 'published',
    isDeleted: false,
    $or: [
      { 'location.area': current.location.area },
      { propertyType: current.propertyType, roomType: current.roomType }
    ]
  })
    .select('title subtitle slug propertyType roomType location pricing images ratingAvg ratingCount isVerified')
    .limit(4)
    .populate('owner', 'name avatar verifiedOwner')
    .lean();

  return ApiResponse.ok(res, similar, 'Similar listings retrieved successfully');
});

/**
 * @route   POST /api/v1/listings/compare
 * @desc    Compare up to 3 listings with normalized side-by-side matrices
 */
const compareListings = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const objectIds = ids.map((id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null)).filter(Boolean);

  const listings = await Listing.find({
    $or: [{ _id: { $in: objectIds } }, { slug: { $in: ids } }],
    isDeleted: false
  })
    .populate('owner', 'name avatar responseTimeAvg verifiedOwner')
    .lean();

  if (listings.length === 0) {
    throw ApiError.notFound('No listings found for comparison');
  }

  // Build normalized comparison matrix for frontend
  const comparison = {
    listings,
    featuresMatrix: {
      pricing: listings.map((l) => ({
        id: l._id,
        rent: l.pricing.monthlyRent,
        deposit: l.pricing.securityDeposit,
        brokerage: l.pricing.brokerage === 0 ? 'Zero Brokerage' : `₹${l.pricing.brokerage}`,
        maintenance: l.pricing.maintenanceCharges === 0 ? 'Included' : `₹${l.pricing.maintenanceCharges}`
      })),
      roomDetails: listings.map((l) => ({
        id: l._id,
        propertyType: l.propertyType,
        roomType: l.roomType,
        furnishing: l.details.furnishing,
        areaSqFt: `${l.details.areaSqFt} sq.ft`,
        floor: `${l.details.floorNumber} of ${l.details.totalFloors}`
      })),
      amenities: listings.map((l) => ({
        id: l._id,
        ac: l.roomFeatures.ac,
        attachedBathroom: l.roomFeatures.attachedBathroom,
        balcony: l.roomFeatures.balcony,
        wifi: l.buildingFacilities.wifi,
        powerBackup: l.buildingFacilities.powerBackup,
        lift: l.buildingFacilities.lift,
        parking: l.buildingFacilities.bikeParking || l.buildingFacilities.carParking,
        security: l.buildingFacilities.securityGuard || l.buildingFacilities.cctv,
        laundry: l.buildingFacilities.laundry
      })),
      foodAndRules: listings.map((l) => ({
        id: l._id,
        mealsIncluded: l.foodServices.mealsIncluded,
        cookingAllowed: l.foodServices.cookingAllowed,
        genderPreference: l.rules.genderPreference,
        bachelorsAllowed: l.rules.bachelorsAllowed,
        petsAllowed: l.rules.petsAllowed,
        gateClosingTime: l.rules.gateClosingTime
      }))
    }
  };

  return ApiResponse.ok(res, comparison, 'Listings comparison generated successfully');
});

module.exports = {
  searchListings,
  getFeaturedListings,
  getPopularAreas,
  autocomplete,
  getListingDetails,
  getSimilarListings,
  compareListings
};
