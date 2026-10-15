const express = require('express');
const router = express.Router();
const enquiryCtrl = require('../controllers/enquiryController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const validate = require('../middlewares/validate');
const { updateEnquiryStatusSchema } = require('../validators/enquiryValidator');

router.use(protect);

router.get('/sent', enquiryCtrl.getSentEnquiries);
router.get('/received', authorize('owner', 'admin'), enquiryCtrl.getReceivedEnquiries);
router.patch('/:id/status', validate(updateEnquiryStatusSchema), enquiryCtrl.updateEnquiryStatus);

module.exports = router;
