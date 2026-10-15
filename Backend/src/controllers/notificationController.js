const Notification = require('../models/Notification');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, formatPaginationMeta } = require('../utils/pagination');

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications with unread badge count
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 15, 50);

  const [total, unreadCount, notifications] = await Promise.all([
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
  ]);

  const meta = formatPaginationMeta(total, page, limit, { unreadCount });

  return ApiResponse.ok(res, notifications, 'Notifications retrieved successfully', meta);
});

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a specific notification as read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({ _id: id, user: req.user._id });
  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  return ApiResponse.ok(res, notification, 'Notification marked as read');
});

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all unread notifications as read
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });

  return ApiResponse.ok(res, null, 'All notifications marked as read');
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
