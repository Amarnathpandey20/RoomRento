const Visit = require('../models/Visit');
const Listing = require('../models/Listing');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, formatPaginationMeta } = require('../utils/pagination');
const { createNotification } = require('../services/notificationService');
const { sendVisitNotificationEmail } = require('../services/emailService');

/**
 * @route   POST /api/v1/listings/:id/visits
 * @desc    Schedule a property visit (tenant)
 */
const scheduleVisit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { scheduledAt, note } = req.body;

  const listing = await Listing.findById(id).populate('owner', 'name email');
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  if (listing.owner._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot schedule a visit to your own property');
  }

  const visit = await Visit.create({
    listing: listing._id,
    tenant: req.user._id,
    owner: listing.owner._id,
    scheduledAt: new Date(scheduledAt),
    note: note || '',
    status: 'requested'
  });

  // In-app notification for owner
  await createNotification({
    userId: listing.owner._id,
    type: 'visit_requested',
    title: 'New Visit Request',
    message: `${req.user.name} requested a visit to "${listing.title}" on ${new Date(scheduledAt).toLocaleString()}`,
    link: `/dashboard/visits`
  });

  // Email to owner
  sendVisitNotificationEmail({
    recipientEmail: listing.owner.email,
    recipientName: listing.owner.name,
    propertyTitle: listing.title,
    scheduledAt,
    status: 'requested',
    note
  }).catch(() => {});

  return ApiResponse.created(res, visit, 'Visit requested successfully. Waiting for owner confirmation');
});

/**
 * @route   GET /api/v1/visits/mine
 * @desc    Get user's scheduled visits (works for both tenant and owner)
 */
const getMyVisits = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10, 50);
  const statusFilter = req.query.status;

  // Filter based on user's role or query
  const query = {};
  if (req.user.role === 'owner') {
    query.owner = req.user._id;
  } else {
    query.tenant = req.user._id;
  }

  if (statusFilter) {
    query.status = statusFilter;
  }

  const [total, visits] = await Promise.all([
    Visit.countDocuments(query),
    Visit.find(query)
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('listing', 'title slug images location pricing')
      .populate('tenant', 'name avatar phone email')
      .populate('owner', 'name avatar phone email verifiedOwner responseTimeAvg')
      .lean()
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return ApiResponse.ok(res, visits, 'Visits retrieved successfully', meta);
});

/**
 * @route   PATCH /api/v1/visits/:id
 * @desc    Confirm, reschedule, cancel, or complete visit
 */
const updateVisit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, scheduledAt, note } = req.body;

  const visit = await Visit.findById(id)
    .populate('listing', 'title')
    .populate('tenant', 'name email')
    .populate('owner', 'name email');

  if (!visit) {
    throw ApiError.notFound('Visit not found');
  }

  const isTenant = visit.tenant._id.toString() === req.user._id.toString();
  const isOwner = visit.owner._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isTenant && !isOwner && !isAdmin) {
    throw ApiError.forbidden('You are not authorized to modify this visit');
  }

  if (status) {
    visit.status = status;
  }
  if (scheduledAt) {
    visit.scheduledAt = new Date(scheduledAt);
    if (status !== 'cancelled' && status !== 'completed') {
      visit.status = 'rescheduled';
    }
  }
  if (note !== undefined) {
    visit.note = note;
  }

  await visit.save();

  // Notify the other party
  const targetUser = isTenant ? visit.owner : visit.tenant;
  const notificationType = status === 'confirmed' ? 'visit_confirmed' : status === 'cancelled' ? 'visit_cancelled' : 'visit_rescheduled';

  await createNotification({
    userId: targetUser._id,
    type: notificationType,
    title: `Visit ${visit.status.toUpperCase()}`,
    message: `Your visit for "${visit.listing.title}" has been updated to "${visit.status}"`,
    link: `/dashboard/visits`
  });

  sendVisitNotificationEmail({
    recipientEmail: targetUser.email,
    recipientName: targetUser.name,
    propertyTitle: visit.listing.title,
    scheduledAt: visit.scheduledAt,
    status: visit.status,
    note: visit.note
  }).catch(() => {});

  return ApiResponse.ok(res, visit, `Visit ${visit.status} successfully`);
});

module.exports = {
  scheduleVisit,
  getMyVisits,
  updateVisit
};
