const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Enquiry = require('../models/Enquiry');
const Wishlist = require('../models/Wishlist');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { getPagination, formatPaginationMeta } = require('../utils/pagination');
const env = require('../config/env');
const cache = require('../config/redis');

/**
 * Helper to assert that the requesting user owns the listing (or is admin)
 */
const assertListingOwnership = (listing, user) => {
  if (user.role === 'admin') return;
  if (listing.owner.toString() !== user._id.toString()) {
    throw ApiError.forbidden('You are not authorized to modify this property listing');
  }
};

/**
 * @route   POST /api/v1/listings
 * @desc    Create a new listing (owner only)
 */
const createListing = asyncHandler(async (req, res) => {
  // Published by default so newly listed rooms are immediately searchable and visible
  const initialStatus = req.body.status || 'published';

  const listingData = {
    ...req.body,
    owner: req.user._id,
    status: initialStatus
  };

  const listing = await Listing.create(listingData);

  // Increment totalListings counter for owner
  await User.findByIdAndUpdate(req.user._id, { $inc: { totalListings: 1 } });
  await cache.flushPattern('listings:');

  return ApiResponse.created(res, listing, 'Property listing created successfully');
});

/**
 * @route   POST /api/v1/listings/draft
 * @desc    Autosave draft listing for multi-step form
 */
const saveDraft = asyncHandler(async (req, res) => {
  const { listingId, ...draftData } = req.body;

  let listing;
  if (listingId && mongoose.Types.ObjectId.isValid(listingId)) {
    listing = await Listing.findById(listingId);
    if (listing) {
      assertListingOwnership(listing, req.user);
      Object.assign(listing, draftData);
      listing.status = 'draft';
      await listing.save();
    }
  }

  if (!listing) {
    listing = await Listing.create({
      ...draftData,
      title: draftData.title || 'Untitled Draft Listing',
      description: draftData.description || 'Draft in progress...',
      propertyType: draftData.propertyType || 'room',
      roomType: draftData.roomType || 'single',
      'location.address': draftData.location?.address || 'TBD',
      'location.area': draftData.location?.area || 'TBD',
      'location.city': draftData.location?.city || 'Bengaluru',
      'pricing.monthlyRent': draftData.pricing?.monthlyRent || 0,
      owner: req.user._id,
      status: 'draft'
    });
  }

  return ApiResponse.ok(res, listing, 'Draft saved successfully');
});

/**
 * @route   PUT /api/v1/listings/:id
 * @desc    Update listing details (owner only)
 */
const updateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  assertListingOwnership(listing, req.user);

  // Prevent changing owner or soft-delete state directly here
  delete req.body.owner;
  delete req.body.isDeleted;
  delete req.body.deletedAt;

  Object.assign(listing, req.body);
  await listing.save();

  await cache.flushPattern('listings:');
  return ApiResponse.ok(res, listing, 'Listing updated successfully');
});

/**
 * @route   PATCH /api/v1/listings/:id/status
 * @desc    Update listing status (draft, published, rented, archived)
 */
const updateListingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const listing = await Listing.findById(id);
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  assertListingOwnership(listing, req.user);

  listing.status = status;
  await listing.save();

  await cache.flushPattern('listings:');
  return ApiResponse.ok(res, listing, `Listing status changed to ${status}`);
});

/**
 * @route   DELETE /api/v1/listings/:id
 * @desc    Soft delete listing (owner or admin)
 */
const deleteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  assertListingOwnership(listing, req.user);

  listing.isDeleted = true;
  listing.deletedAt = new Date();
  listing.status = 'archived';
  await listing.save();

  await User.findByIdAndUpdate(listing.owner, { $inc: { totalListings: -1 } });
  await cache.flushPattern('listings:');

  return ApiResponse.ok(res, null, 'Listing deleted successfully');
});

/**
 * @route   POST /api/v1/listings/:id/images
 * @desc    Upload multiple photos for a listing via Cloudinary
 */
const uploadListingImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  assertListingOwnership(listing, req.user);

  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('Please upload at least one image');
  }

  const uploadPromises = req.files.map((file) =>
    uploadToCloudinary(file.buffer, 'room_rento/listings', file.originalname)
  );
  const uploadedResults = await Promise.all(uploadPromises);

  const startOrder = listing.images.length;
  const newImages = uploadedResults.map((result, idx) => ({
    url: result.url,
    publicId: result.publicId,
    order: startOrder + idx,
    isCover: listing.images.length === 0 && idx === 0 // first image becomes cover by default
  }));

  listing.images.push(...newImages);
  await listing.save();

  await cache.flushPattern('listings:');
  return ApiResponse.ok(res, listing.images, 'Images uploaded successfully');
});

/**
 * @route   POST /api/v1/listings/upload
 * @desc    Direct standalone photo upload returning uploaded image URLs
 */
const uploadImagesDirect = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('Please upload at least one image file');
  }

  const uploadPromises = req.files.map((file) =>
    uploadToCloudinary(file.buffer, 'room_rento/listings', file.originalname)
  );
  const uploadedResults = await Promise.all(uploadPromises);

  const images = uploadedResults.map((result, idx) => ({
    url: result.url,
    publicId: result.publicId,
    order: idx,
    isCover: idx === 0
  }));

  return ApiResponse.ok(res, images, 'Images uploaded successfully');
});

/**
 * @route   DELETE /api/v1/listings/:id/images/:imageId
 * @desc    Remove an image from a listing and delete from Cloudinary
 */
const deleteListingImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  const listing = await Listing.findById(id);
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  assertListingOwnership(listing, req.user);

  const imageIndex = listing.images.findIndex((img) => img._id.toString() === imageId);
  if (imageIndex === -1) {
    throw ApiError.notFound('Image not found on this listing');
  }

  const imageToDelete = listing.images[imageIndex];
  if (imageToDelete.publicId) {
    await deleteFromCloudinary(imageToDelete.publicId);
  }

  listing.images.splice(imageIndex, 1);

  // If deleted image was cover, make first remaining image cover
  if (imageToDelete.isCover && listing.images.length > 0) {
    listing.images[0].isCover = true;
  }

  await listing.save();
  await cache.flushPattern('listings:');

  return ApiResponse.ok(res, listing.images, 'Image deleted successfully');
});

/**
 * @route   PATCH /api/v1/listings/:id/images/reorder
 * @desc    Reorder images and set cover image
 */
const reorderListingImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { imageOrders } = req.body; // array of { imageId, order, isCover }

  const listing = await Listing.findById(id);
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  assertListingOwnership(listing, req.user);

  imageOrders.forEach((item) => {
    const target = listing.images.id(item.imageId);
    if (target) {
      if (item.order !== undefined) target.order = item.order;
      if (item.isCover !== undefined) target.isCover = item.isCover;
    }
  });

  // Sort images by order ascending
  listing.images.sort((a, b) => a.order - b.order);
  await listing.save();

  return ApiResponse.ok(res, listing.images, 'Images reordered successfully');
});

/**
 * @route   GET /api/v1/owner/listings
 * @desc    Get all listings belonging to current owner with filter by status
 */
const getOwnerListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10, 50);
  const statusFilter = req.query.status;

  const query = {
    owner: req.user._id,
    isDeleted: false
  };

  if (statusFilter) {
    query.status = statusFilter;
  }

  const [total, listings, statusCounts] = await Promise.all([
    Listing.countDocuments(query),
    Listing.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Listing.aggregate([
      { $match: { owner: req.user._id, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const summary = statusCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const meta = formatPaginationMeta(total, page, limit, { statusCounts: summary });

  return ApiResponse.ok(res, listings, 'Owner listings fetched successfully', meta);
});

/**
 * @route   GET /api/v1/owner/stats
 * @desc    Aggregated analytics: total views, enquiries, wishlists, and trends
 */
const getOwnerStats = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const ownerListings = await Listing.find({ owner: ownerId, isDeleted: false }).select(
    '_id title views enquiryCount wishlistCount ratingAvg status pricing.monthlyRent'
  );

  const listingIds = ownerListings.map((l) => l._id);

  // Total summary
  const totalListings = ownerListings.length;
  const totalViews = ownerListings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalEnquiries = ownerListings.reduce((sum, l) => sum + (l.enquiryCount || 0), 0);
  const totalWishlists = ownerListings.reduce((sum, l) => sum + (l.wishlistCount || 0), 0);

  // 30 days trends via aggregation
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const enquiriesTrend = await Enquiry.aggregate([
    {
      $match: {
        owner: ownerId,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const stats = {
    overview: {
      totalListings,
      totalViews,
      totalEnquiries,
      totalWishlists
    },
    perListing: ownerListings,
    trends: {
      enquiriesTrend
    }
  };

  return ApiResponse.ok(res, stats, 'Owner analytics generated successfully');
});

module.exports = {
  createListing,
  saveDraft,
  updateListing,
  updateListingStatus,
  deleteListing,
  uploadListingImages,
  uploadImagesDirect,
  deleteListingImage,
  reorderListingImages,
  getOwnerListings,
  getOwnerStats
};
