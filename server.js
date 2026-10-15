/**
 * RoomRento • Full-Stack Web Application Server (Node.js + Express)
 * Serves pure HTML, CSS, JavaScript frontend and REST API v1
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Load In-Memory Domain Data Store (Zero-Config Startup)
const { INITIAL_ROOMS, LOCALITY_OPTIONS, ROOM_TYPE_OPTIONS } = require('./data/rooms');
const { CITIES, CITY_COORDINATES } = require('./data/cities');
const { INITIAL_USER, INITIAL_ENQUIRIES, INITIAL_SCHEDULED_VISITS } = require('./data/users');

// In-Memory Data Store (Persists during runtime, instant boot)
const db = {
  listings: [...INITIAL_ROOMS],
  visits: [...INITIAL_SCHEDULED_VISITS],
  enquiries: [...INITIAL_ENQUIRIES],
  users: [
    INITIAL_USER,
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@host.in',
      role: 'owner',
      phone: '+91 98765 43210',
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    },
    {
      name: 'Super Admin',
      email: 'admin@roomrento.in',
      role: 'admin',
      phone: '+91 99999 00000',
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  ]
};

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, 'public')));

// ─── API v1 Endpoints ─────────────────────────────────────────────────────────

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'RoomRento Full-Stack Web Application',
    version: '1.0.0',
    totalListings: db.listings.length
  });
});

// 1. Listings API
app.get('/api/v1/listings', (req, res) => {
  const { city, locality, roomType, maxPrice, search, sort } = req.query;
  let results = [...db.listings];

  if (city && city !== 'All') {
    results = results.filter(r => (r.locality || '').toLowerCase().includes(city.toLowerCase()) || (r.address || '').toLowerCase().includes(city.toLowerCase()));
  }
  if (locality && locality !== 'All') {
    results = results.filter(r => (r.locality || '').toLowerCase() === locality.toLowerCase());
  }
  if (roomType && roomType !== 'all') {
    results = results.filter(r => (r.type || '').toLowerCase().includes(roomType.toLowerCase()));
  }
  if (maxPrice) {
    results = results.filter(r => (r.price || 0) <= Number(maxPrice));
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(r => 
      (r.title || '').toLowerCase().includes(q) ||
      (r.locality || '').toLowerCase().includes(q) ||
      (r.address || '').toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
  if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);

  res.json({
    success: true,
    count: results.length,
    data: results
  });
});

// Get Listing by ID
app.get('/api/v1/listings/:id', (req, res) => {
  const room = db.listings.find(r => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }
  res.json({ success: true, data: room });
});

// Create Listing (Owner / Admin)
app.post('/api/v1/listings', (req, res) => {
  const { title, price, locality, type, images } = req.body || {};
  if (!title || !price || !locality) {
    return res.status(400).json({ success: false, message: 'Missing required property details' });
  }

  const newRoom = {
    id: 'prop-' + Date.now(),
    title,
    price: Number(price),
    locality,
    type: type || 'Studio',
    rating: 5.0,
    reviewCount: 1,
    isVerified: true,
    zeroBrokerage: true,
    carpetArea: '280 sq.ft',
    furnishing: 'Fully Furnished',
    images: images && images.length ? images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200'],
    createdAt: new Date().toISOString()
  };

  db.listings.unshift(newRoom);
  res.status(201).json({ success: true, data: newRoom });
});

// Delete Listing
app.delete('/api/v1/listings/:id', (req, res) => {
  const idx = db.listings.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }
  const removed = db.listings.splice(idx, 1);
  res.json({ success: true, message: 'Property deleted', data: removed[0] });
});

// 2. Auth API
app.post('/api/v1/auth/login', (req, res) => {
  const { email } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const cleanEmail = email.trim();
  let user = db.users.find(u => (u.email || '').toLowerCase() === cleanEmail.toLowerCase());
  
  if (!user) {
    user = {
      name: cleanEmail.split('@')[0] || 'User',
      email: cleanEmail,
      role: 'tenant',
      phone: '+91 98123 45678',
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
    db.users.push(user);
  }

  res.json({
    success: true,
    token: 'jwt_token_' + Date.now(),
    user
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  res.json({ success: true, user: db.users[0] });
});

// 3. Visits API
app.get('/api/v1/visits', (req, res) => {
  res.json({ success: true, count: db.visits.length, data: db.visits });
});

app.post('/api/v1/visits', (req, res) => {
  const visit = {
    id: 'visit-' + Date.now(),
    status: 'Confirmed',
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.visits.unshift(visit);
  res.status(201).json({ success: true, data: visit });
});

app.delete('/api/v1/visits/:id', (req, res) => {
  db.visits = db.visits.filter(v => v.id !== req.params.id);
  res.json({ success: true, message: 'Visit cancelled' });
});

// 4. Enquiries API
app.get('/api/v1/enquiries', (req, res) => {
  res.json({ success: true, data: db.enquiries });
});

app.post('/api/v1/enquiries', (req, res) => {
  const enq = {
    id: 'enq-' + Date.now(),
    ...req.body,
    timestamp: 'Just now'
  };
  db.enquiries.unshift(enq);
  res.status(201).json({ success: true, data: enq });
});

// 5. Admin Stats API
app.get('/api/v1/admin/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalListings: db.listings.length,
      activeTenants: 1420,
      completedVisits: db.visits.length + 384,
      pendingApprovals: db.listings.filter(r => !r.isVerified).length
    }
  });
});

// ─── Frontend Unified Page Routes ──────────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/explore', (req, res) => res.redirect('/#explore'));
app.get('/compare', (req, res) => res.redirect('/#compare'));
app.get('/compare.html', (req, res) => res.redirect('/#compare'));
app.get('/saved', (req, res) => res.redirect('/#saved'));
app.get('/saved.html', (req, res) => res.redirect('/#saved'));
app.get('/enquiries', (req, res) => res.redirect('/#enquiries'));
app.get('/enquiries.html', (req, res) => res.redirect('/#enquiries'));
app.get('/account', (req, res) => res.redirect('/#account'));
app.get('/account.html', (req, res) => res.redirect('/#account'));
app.get('/admin', (req, res) => res.redirect('/#admin'));
app.get('/admin.html', (req, res) => res.redirect('/#admin'));
app.get('/login', (req, res) => res.redirect('/#login'));
app.get('/login.html', (req, res) => res.redirect('/#login'));

app.get('/room/:id', (req, res) => res.redirect(`/#room-${req.params.id}`));
app.get('/room-details', (req, res) => {
  if (req.query.id) return res.redirect(`/#room-${req.query.id}`);
  res.redirect('/#explore');
});
app.get('/room-details.html', (req, res) => {
  if (req.query.id) return res.redirect(`/#room-${req.query.id}`);
  res.redirect('/#explore');
});

// Catch-all fallback to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` 🏠 RoomRento Full-Stack Web Application (HTML, CSS, JS & Node.js)`);
    console.log(` 🚀 Server running at: http://localhost:${PORT}`);
    console.log(` 🌐 Explore Page:     http://localhost:${PORT}/index.html`);
    console.log(` 🔍 Room Details:     http://localhost:${PORT}/room-details.html`);
    console.log(` ⚖️  Compare Matrix:   http://localhost:${PORT}/compare.html`);
    console.log(` 💖 Saved Wishlist:   http://localhost:${PORT}/saved.html`);
    console.log(` 💬 Host Enquiries:   http://localhost:${PORT}/enquiries.html`);
    console.log(` 👤 User Account:     http://localhost:${PORT}/account.html`);
    console.log(` 🛡️  Admin Dashboard:  http://localhost:${PORT}/admin.html`);
    console.log(` 🔑 Login Portal:     http://localhost:${PORT}/login.html`);
    console.log(` ⚡ API Health:       http://localhost:${PORT}/api/v1/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
