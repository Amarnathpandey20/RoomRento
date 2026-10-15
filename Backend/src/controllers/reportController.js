const Report = require('../models/Report');
const Listing = require('../models/Listing');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, formatPaginationMeta } = require('../utils/pagination');

/**
 * @route   POST /api/v1/listings/:id/report
 * @desc    Report an issue or fraudulent listing
 */
const createReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, description } = req.body;

  const listing = await Listing.findById(id);
  if (!listing || listing.isDeleted) {
    throw ApiError.notFound('Listing not found');
  }

  const report = await Report.create({
    listing: id,
    reportedBy: req.user._id,
    reason,
    description,
    status: 'open'
  });

  return ApiResponse.created(
    res,
    report,
    'Report received. Our trust and safety team will inspect this property promptly'
  );
});

/**
 * @route   GET /api/v1/admin/reports
 * @desc    Get all reports (admin only)
 */
const getReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 15, 50);
  const status = req.query.status;

  const query = {};
  if (status) {
    query.status = status;
  }

  const [total, reports] = await Promise.all([
    Report.countDocuments(query),
    Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('listing', 'title slug owner status pricing')
      .populate('reportedBy', 'name email')
      .lean()
  ]);

  const meta = formatPaginationMeta(total, page, limit);

  return ApiResponse.ok(res, reports, 'Reports fetched successfully', meta);
});

/**
 * @route   PATCH /api/v1/admin/reports/:id
 * @desc    Resolve or dismiss a report
 */
const resolveReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, resolutionNote } = req.body;

  const report = await Report.findById(id);
  if (!report) {
    throw ApiError.notFound('Report not found');
  }

  report.status = status;
  if (resolutionNote) {
    report.resolutionNote = resolutionNote;
  }
  await report.save();

  return ApiResponse.ok(res, report, `Report marked as ${status}`);
});

module.exports = {
  createReport,
  getReports,
  resolveReport
};
