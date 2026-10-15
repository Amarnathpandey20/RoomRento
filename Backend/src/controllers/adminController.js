const User = require('../models/User');
const Listing = require('../models/Listing');
const Enquiry = require('../models/Enquiry');
const Visit = require('../models/Visit');
const Report = require('../models/Report');
const Review = require('../models/Review');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, formatPaginationMeta } = require('../utils/pagination');
const { createNotification } = require('../services/notificationService');
const cache = require('../config/redis');

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with search, role filters, and pagination
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20, 100);
  const { role, search, isActive } = req.query;

  const query = { isDeleted: false };
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') }
    ];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return ApiResponse.ok(res, users, 'Users retrieved successfully', meta);
});

/**
 * @route   PATCH /api/v1/admin/users/:id/block
 * @desc    Toggle block/unblock status for a user
 */
const toggleBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'admin') {
    throw ApiError.forbidden('Cannot block an admin user');
  }

  user.isActive = !user.isActive;
  await user.save();

  return ApiResponse.ok(
    res,
    user,
    `User has been ${user.isActive ? 'unblocked/activated' : 'blocked/suspended'}`
  );
});

/**
 * @route   GET /api/v1/admin/listings
 * @desc    Get listings with status filters (default: pending approval)
 */
const getAdminListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 15, 100);
  const status = req.query.status || 'pending';

  const query = { isDeleted: false };
  if (status !== 'all') {
    query.status = status;
  }

  const [total, listings] = await Promise.all([
    Listing.countDocuments(query),
    Listing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name email phone verifiedOwner')
      .lean()
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return ApiResponse.ok(res, listings, 'Admin listings fetched successfully', meta);
});

/**
 * @route   PATCH /api/v1/admin/listings/:id/verify
 * @desc    Approve and publish a pending listing, mark verified
 */
const verifyListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id).populate('owner', 'name email');
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  listing.status = 'published';
  listing.isVerified = true;
  await listing.save();

  await cache.flushPattern('listings:');

  // Notify owner
  await createNotification({
    userId: listing.owner._id,
    type: 'listing_verified',
    title: 'Listing Approved & Published! 🎉',
    message: `Your property "${listing.title}" is now verified and live on Room Rento!`,
    link: `/property/${listing.slug || listing._id}`
  });

  return ApiResponse.ok(res, listing, 'Listing verified and published');
});

/**
 * @route   PATCH /api/v1/admin/listings/:id/reject
 * @desc    Reject a listing with reason
 */
const rejectListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = 'Listing details did not meet platform safety and content guidelines' } = req.body;

  const listing = await Listing.findById(id).populate('owner', 'name email');
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  listing.status = 'rejected';
  listing.isVerified = false;
  await listing.save();

  await cache.flushPattern('listings:');

  // Notify owner
  await createNotification({
    userId: listing.owner._id,
    type: 'listing_rejected',
    title: 'Listing Submission Update',
    message: `Your listing "${listing.title}" was rejected: ${reason}`,
    link: `/dashboard/my-listings`
  });

  return ApiResponse.ok(res, listing, 'Listing marked as rejected');
});

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Platform-wide high level statistics
 */
const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalTenants,
    totalOwners,
    totalListings,
    publishedListings,
    pendingListings,
    totalEnquiries,
    totalVisits,
    openReports
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    User.countDocuments({ role: 'tenant', isDeleted: false }),
    User.countDocuments({ role: 'owner', isDeleted: false }),
    Listing.countDocuments({ isDeleted: false }),
    Listing.countDocuments({ status: 'published', isDeleted: false }),
    Listing.countDocuments({ status: 'pending', isDeleted: false }),
    Enquiry.countDocuments(),
    Visit.countDocuments(),
    Report.countDocuments({ status: 'open' })
  ]);

  const stats = {
    users: {
      total: totalUsers,
      tenants: totalTenants,
      owners: totalOwners
    },
    listings: {
      total: totalListings,
      published: publishedListings,
      pending: pendingListings
    },
    engagement: {
      enquiries: totalEnquiries,
      visits: totalVisits,
      openReports
    }
  };

  return ApiResponse.ok(res, stats, 'Platform analytics retrieved successfully');
});

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete a user account and mark associated listings removed (admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'admin') {
    throw ApiError.forbidden('Cannot delete super administrator account');
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.isActive = false;
  await user.save();

  // Also soft-delete listings owned by this user
  await Listing.updateMany({ owner: id }, { isDeleted: true, status: 'rejected' });
  await cache.flushPattern('listings:');

  return ApiResponse.ok(res, null, 'User and associated data deleted successfully');
});

/**
 * @route   DELETE /api/v1/admin/listings/:id
 * @desc    Delete a listing (admin only)
 */
const deleteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw ApiError.notFound('Listing not found');
  }

  listing.isDeleted = true;
  listing.deletedAt = new Date();
  await listing.save();

  await cache.flushPattern('listings:');

  return ApiResponse.ok(res, null, 'Listing deleted successfully by administrator');
});

/**
 * @route   GET /api/v1/admin/reviews
 * @desc    Get all reviews across listings for admin moderation
 */
const getAdminReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20, 100);

  const [total, reviews] = await Promise.all([
    Review.countDocuments(),
    Review.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email avatar')
      .populate('listing', 'title slug pricing location')
      .lean()
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return ApiResponse.ok(res, reviews, 'Admin reviews retrieved successfully', meta);
});

module.exports = {
  getUsers,
  toggleBlockUser,
  deleteUser,
  getAdminListings,
  verifyListing,
  rejectListing,
  deleteListing,
  getAdminReviews,
  getAdminStats
};
