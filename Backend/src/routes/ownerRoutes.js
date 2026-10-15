const express = require('express');
const router = express.Router();
const ownerCtrl = require('../controllers/listingOwnerController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

router.use(protect);
router.use(authorize('owner', 'admin'));

router.get('/listings', ownerCtrl.getOwnerListings);
router.get('/stats', ownerCtrl.getOwnerStats);

module.exports = router;
