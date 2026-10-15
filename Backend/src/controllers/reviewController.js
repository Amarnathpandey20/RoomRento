const Review = require('../models/Review');
const Listing = require('../models/Listing');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, formatPaginationMeta } = require('../utils/pagination');
const { createNotification } = require('../services/notificationService');

/**
 * @route   GET /api/v1/listings/:id/reviews
 * @desc    Get all reviews for a listing with breakdown and pagination
 */
const getListingReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit, skip } = getPagination(req.query, 10, 50);

  const [total, reviews, listing] = await Promise.all([
    Review.countDocuments({ listing: id }),
    Review.find({ listing: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatar city')
      .lean(),
    Listing.findById(id).select('ratingAvg ratingCount ratingBreakdown').lean()
  ]);

  const meta = formatPaginationMeta(total, page, limit, {
    ratingSummary: listing
      ? {
          ratingAvg: listing.ratingAvg,
          ratingCount: listing.ratingCount,
          ratingBreakdown: listing.ratingBreakdown
        }
      : null
  });

  return ApiResponse.ok(res, reviews, 'Reviews retrieved successfully', meta);
});

/**
 * @route   POST /api/v1/listings/:id/reviews
 * @desc    Post a verified review for a listing (one review per user per listing)
 */
const createReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, cleanliness, safety, valueForMoney, ownerBehaviour, comment } = req.body;

  const listing = await Listing.findById(id);
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  // Prevent host from reviewing their own property
  if (listing.owner.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot review your own listing');
  }

  const existingReview = await Review.findOne({ listing: id, user: req.user._id });
  if (existingReview) {
    throw ApiError.conflict('You have already submitted a review for this property. You can edit your existing review');
  }

  const review = await Review.create({
    listing: id,
    user: req.user._id,
    rating,
    cleanliness: cleanliness || rating,
    safety: safety || rating,
    valueForMoney: valueForMoney || rating,
    ownerBehaviour: ownerBehaviour || rating,
    comment
  });

  // Notify the property owner
  await createNotification({
    userId: listing.owner,
    type: 'new_review',
    title: 'New Rating & Review',
    message: `${req.user.name} rated your property "${listing.title}" ${rating} stars`,
    link: `/property/${listing.slug || listing._id}`
  });

  return ApiResponse.created(res, review, 'Review submitted successfully');
});

/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Edit a user's existing review
 */
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only edit your own reviews');
  }

  Object.assign(review, req.body);
  await review.save(); // triggers post('save') recalculation hook

  return ApiResponse.ok(res, review, 'Review updated successfully');
});

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete a review (author or admin)
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only delete your own reviews');
  }

  await Review.findOneAndDelete({ _id: id }); // triggers post('findOneAndDelete') hook

  return ApiResponse.ok(res, null, 'Review deleted successfully');
});

/**
 * @route   POST /api/v1/reviews/:id/helpful
 * @desc    Upvote review helpfulness (toggle)
 */
const markHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  const hasUpvoted = review.helpfulUsers.some((uId) => uId.toString() === userId.toString());

  if (hasUpvoted) {
    review.helpfulUsers = review.helpfulUsers.filter((uId) => uId.toString() !== userId.toString());
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    review.helpfulUsers.push(userId);
    review.helpfulCount += 1;
  }

  await review.save();

  return ApiResponse.ok(res, {
    helpfulCount: review.helpfulCount,
    isHelpful: !hasUpvoted
  }, hasUpvoted ? 'Helpful vote removed' : 'Marked as helpful');
});

module.exports = {
  getListingReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful
};
