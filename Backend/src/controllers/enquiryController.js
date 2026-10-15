const Enquiry = require('../models/Enquiry');
const Listing = require('../models/Listing');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, formatPaginationMeta } = require('../utils/pagination');
const { createNotification } = require('../services/notificationService');
const { sendEnquiryNotificationEmail } = require('../services/emailService');

/**
 * @route   POST /api/v1/listings/:id/enquiries
 * @desc    Submit a new rental enquiry for a listing
 */
const createEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message, phone, preferredContact, moveInDate } = req.body;

  const listing = await Listing.findById(id).populate('owner', 'name email');
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  // Prevent owner from enquiring about their own property
  if (listing.owner._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot send an enquiry on your own property');
  }

  // Business Rule: Prevent duplicate enquiries on the same listing within 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentEnquiry = await Enquiry.findOne({
    listing: listing._id,
    tenant: req.user._id,
    createdAt: { $gte: twentyFourHoursAgo }
  });

  if (recentEnquiry) {
    throw ApiError.conflict(
      'You have already submitted an enquiry for this property in the last 24 hours. The owner will respond shortly!'
    );
  }

  const enquiry = await Enquiry.create({
    listing: listing._id,
    tenant: req.user._id,
    owner: listing.owner._id,
    message,
    phone: phone || req.user.phone || '',
    preferredContact: preferredContact || 'whatsapp',
    moveInDate: moveInDate || null,
    status: 'new'
  });

  // Atomically increment enquiryCount on listing
  await Listing.findByIdAndUpdate(listing._id, { $inc: { enquiryCount: 1 } });

  // Create in-app notification for the owner
  await createNotification({
    userId: listing.owner._id,
    type: 'enquiry_received',
    title: 'New Rental Enquiry',
    message: `${req.user.name} sent an enquiry for "${listing.title}"`,
    link: `/dashboard/enquiries?id=${enquiry._id}`,
    metadata: { enquiryId: enquiry._id, listingId: listing._id }
  });

  // Dispatch email notification to owner asynchronously
  sendEnquiryNotificationEmail({
    ownerEmail: listing.owner.email,
    ownerName: listing.owner.name,
    tenantName: req.user.name,
    propertyTitle: listing.title,
    message,
    phone: phone || req.user.phone
  }).catch(() => {});

  return ApiResponse.created(res, enquiry, 'Enquiry submitted successfully. The host has been notified');
});

/**
 * @route   GET /api/v1/enquiries/sent
 * @desc    Get enquiries submitted by the current tenant
 */
const getSentEnquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10, 50);

  const [total, enquiries] = await Promise.all([
    Enquiry.countDocuments({ tenant: req.user._id }),
    Enquiry.find({ tenant: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('listing', 'title slug images location pricing')
      .populate('owner', 'name avatar phone responseTimeAvg verifiedOwner')
      .lean()
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return ApiResponse.ok(res, enquiries, 'Sent enquiries retrieved successfully', meta);
});

/**
 * @route   GET /api/v1/enquiries/received
 * @desc    Get enquiries received by the owner
 */
const getReceivedEnquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10, 50);
  const statusFilter = req.query.status;

  const query = { owner: req.user._id };
  if (statusFilter) {
    query.status = statusFilter;
  }

  const [total, enquiries] = await Promise.all([
    Enquiry.countDocuments(query),
    Enquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('listing', 'title slug images location pricing')
      .populate('tenant', 'name avatar email phone city')
      .lean()
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return ApiResponse.ok(res, enquiries, 'Received enquiries retrieved successfully', meta);
});

/**
 * @route   PATCH /api/v1/enquiries/:id/status
 * @desc    Update status of an enquiry (owner or admin)
 */
const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const enquiry = await Enquiry.findById(id).populate('listing', 'title');
  if (!enquiry) {
    throw ApiError.notFound('Enquiry not found');
  }

  // Only the property owner or an admin can update enquiry status
  if (req.user.role !== 'admin' && enquiry.owner.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not authorized to update this enquiry');
  }

  enquiry.status = status;
  await enquiry.save();

  // Notify tenant of the update
  await createNotification({
    userId: enquiry.tenant,
    type: 'enquiry_status_updated',
    title: 'Enquiry Status Update',
    message: `Your enquiry for "${enquiry.listing?.title || 'property'}" is now marked as "${status}"`,
    link: `/dashboard/enquiries`
  });

  return ApiResponse.ok(res, enquiry, `Enquiry status updated to ${status}`);
});

module.exports = {
  createEnquiry,
  getSentEnquiries,
  getReceivedEnquiries,
  updateEnquiryStatus
};
