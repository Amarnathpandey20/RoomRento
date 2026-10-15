const express = require('express');
const router = express.Router();

const publicCtrl = require('../controllers/listingPublicController');
const ownerCtrl = require('../controllers/listingOwnerController');
const enquiryCtrl = require('../controllers/enquiryController');
const visitCtrl = require('../controllers/visitController');
const reviewCtrl = require('../controllers/reviewController');
const reportCtrl = require('../controllers/reportController');

const { protect, optionalAuth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const validate = require('../middlewares/validate');
const { uploadMultiple } = require('../middlewares/upload');
const { enquiryLimiter } = require('../middlewares/rateLimiter');

const {
  createListingSchema,
  draftListingSchema,
  updateListingSchema,
  compareListingSchema,
  reorderImagesSchema,
  updateStatusSchema
} = require('../validators/listingValidator');

const { createEnquirySchema } = require('../validators/enquiryValidator');
const { createVisitSchema } = require('../validators/visitValidator');
const { createReviewSchema } = require('../validators/reviewValidator');
const { createReportSchema } = require('../validators/reportValidator');

// ─── Public Discovery Routes ──────────────────────────────────────────────────
router.get('/', publicCtrl.searchListings);
router.get('/featured', publicCtrl.getFeaturedListings);
router.get('/popular-areas', publicCtrl.getPopularAreas);
router.get('/autocomplete', publicCtrl.autocomplete);
router.post('/compare', validate(compareListingSchema), publicCtrl.compareListings);

// ─── Owner / Host Listing Operations ───────────────────────────────────────────
router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  validate(createListingSchema),
  ownerCtrl.createListing
);

// Standalone Photo Upload
router.post(
  '/upload',
  protect,
  authorize('owner', 'admin'),
  uploadMultiple('images', 10),
  ownerCtrl.uploadImagesDirect
);

router.post(
  '/draft',
  protect,
  authorize('owner', 'admin'),
  validate(draftListingSchema),
  ownerCtrl.saveDraft
);

// Specific listing sub-actions (Owner)
router.post(
  '/:id/images',
  protect,
  authorize('owner', 'admin'),
  uploadMultiple('images', 10),
  ownerCtrl.uploadListingImages
);

router.delete(
  '/:id/images/:imageId',
  protect,
  authorize('owner', 'admin'),
  ownerCtrl.deleteListingImage
);

router.patch(
  '/:id/images/reorder',
  protect,
  authorize('owner', 'admin'),
  validate(reorderImagesSchema),
  ownerCtrl.reorderListingImages
);

router.patch(
  '/:id/status',
  protect,
  authorize('owner', 'admin'),
  validate(updateStatusSchema),
  ownerCtrl.updateListingStatus
);

// ─── User Interactions with Listings ──────────────────────────────────────────
// Enquiries
router.post(
  '/:id/enquiries',
  protect,
  enquiryLimiter,
  validate(createEnquirySchema),
  enquiryCtrl.createEnquiry
);

// Visits
router.post(
  '/:id/visits',
  protect,
  validate(createVisitSchema),
  visitCtrl.scheduleVisit
);

// Reviews
router.get('/:id/reviews', reviewCtrl.getListingReviews);
router.post(
  '/:id/reviews',
  protect,
  validate(createReviewSchema),
  reviewCtrl.createReview
);

// Reports
router.post(
  '/:id/report',
  protect,
  validate(createReportSchema),
  reportCtrl.createReport
);

// ─── Listing Detail & Similar (Parameterized routes last to prevent collisions) ──
router.get('/:id/similar', publicCtrl.getSimilarListings);
router.get('/:idOrSlug', optionalAuth, publicCtrl.getListingDetails);

router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  validate(updateListingSchema),
  ownerCtrl.updateListing
);

router.delete(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  ownerCtrl.deleteListing
);

module.exports = router;
