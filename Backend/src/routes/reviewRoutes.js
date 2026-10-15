const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateReviewSchema } = require('../validators/reviewValidator');

router.use(protect);

router.put('/:id', validate(updateReviewSchema), reviewCtrl.updateReview);
router.delete('/:id', reviewCtrl.deleteReview);
router.post('/:id/helpful', reviewCtrl.markHelpful);

module.exports = router;
