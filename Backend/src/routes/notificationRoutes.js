const express = require('express');
const router = express.Router();
const notificationCtrl = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', notificationCtrl.getNotifications);
router.patch('/read-all', notificationCtrl.markAllAsRead);
router.patch('/:id/read', notificationCtrl.markAsRead);

module.exports = router;
