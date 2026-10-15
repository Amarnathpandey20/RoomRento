const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const reportCtrl = require('../controllers/reportController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const validate = require('../middlewares/validate');
const { resolveReportSchema } = require('../validators/reportValidator');

router.use(protect);
router.use(authorize('admin'));

// Admin User Management
router.get('/users', adminCtrl.getUsers);
router.patch('/users/:id/block', adminCtrl.toggleBlockUser);
router.delete('/users/:id', adminCtrl.deleteUser);

// Admin Listing Moderation
router.get('/listings', adminCtrl.getAdminListings);
router.patch('/listings/:id/verify', adminCtrl.verifyListing);
router.patch('/listings/:id/reject', adminCtrl.rejectListing);
router.delete('/listings/:id', adminCtrl.deleteListing);

// Admin Review Moderation
router.get('/reviews', adminCtrl.getAdminReviews);
router.delete('/reviews/:id', require('../controllers/reviewController').deleteReview);

// Admin Reports
router.get('/reports', reportCtrl.getReports);
router.patch('/reports/:id', validate(resolveReportSchema), reportCtrl.resolveReport);

// Platform Analytics
router.get('/stats', adminCtrl.getAdminStats);

module.exports = router;
