const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const listingRoutes = require('./listingRoutes');
const ownerRoutes = require('./ownerRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const enquiryRoutes = require('./enquiryRoutes');
const visitRoutes = require('./visitRoutes');
const reviewRoutes = require('./reviewRoutes');
const reportRoutes = require('./reportRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminRoutes = require('./adminRoutes');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'Room Rento REST API'
  });
});

// Mount resource routers
router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/owner', ownerRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/visits', visitRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
