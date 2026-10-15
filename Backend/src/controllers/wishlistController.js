const Wishlist = require('../models/Wishlist');
const Listing = require('../models/Listing');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, formatPaginationMeta } = require('../utils/pagination');

/**
 * @route   GET /api/v1/wishlist
 * @desc    Get user's saved wishlist listings
 */
const getWishlist = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 12, 50);

  const [total, wishlistItems] = await Promise.all([
    Wishlist.countDocuments({ user: req.user._id }),
    Wishlist.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'listing',
        match: { isDeleted: false },
        select:
          'title subtitle slug propertyType roomType location pricing images ratingAvg ratingCount isVerified availableFrom status',
        populate: {
          path: 'owner',
          select: 'name avatar verifiedOwner responseTimeAvg'
        }
      })
      .lean()
  ]);

  // Filter out any items where listing was soft-deleted
  const validListings = wishlistItems.filter((item) => item.listing !== null).map((item) => item.listing);

  const meta = formatPaginationMeta(total, page, limit);

  return ApiResponse.ok(res, validListings, 'Wishlist retrieved successfully', meta);
});

/**
 * @route   POST /api/v1/wishlist/:listingId
 * @desc    Save property to wishlist (prevents duplicate, increments counter)
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  const listing = await Listing.findById(listingId);
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  const existing = await Wishlist.findOne({ user: req.user._id, listing: listingId });
  if (existing) {
    return ApiResponse.ok(res, existing, 'Property already in wishlist');
  }

  const item = await Wishlist.create({
    user: req.user._id,
    listing: listingId
  });

  // Atomically increment wishlist counter on listing
  await Listing.findByIdAndUpdate(listingId, { $inc: { wishlistCount: 1 } });

  return ApiResponse.created(res, item, 'Property added to wishlist');
});

/**
 * @route   DELETE /api/v1/wishlist/:listingId
 * @desc    Remove property from wishlist
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  const deleted = await Wishlist.findOneAndDelete({
    user: req.user._id,
    listing: listingId
  });

  if (deleted) {
    // Atomically decrement wishlist counter on listing
    await Listing.findByIdAndUpdate(listingId, { $inc: { wishlistCount: -1 } });
  }

  return ApiResponse.ok(res, null, 'Property removed from wishlist');
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
