const express = require('express');
const router = express.Router();
const wishlistCtrl = require('../controllers/wishlistController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', wishlistCtrl.getWishlist);
router.post('/:listingId', wishlistCtrl.addToWishlist);
router.delete('/:listingId', wishlistCtrl.removeFromWishlist);

module.exports = router;
