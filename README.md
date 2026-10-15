# RoomRento • Room Finder Web Application

A modern, high-performance web application for discovering, comparing, and booking verified rooms, luxury PGs, and private studio apartments, built entirely with **pure HTML, Vanilla CSS, Vanilla JavaScript**, and a **Node.js (Express)** backend.

---

## 🛠️ Technology Stack (No Frameworks)

- **Frontend Core**: Semantic HTML5 & Modern Vanilla JavaScript (ES6+)
- **Styling**: Handcrafted Vanilla CSS3 with **Urban Hearth** design tokens (CSS variables, dark mode, glassmorphism, responsive grid & flexbox, micro-animations)
- **Backend**: Node.js & Express REST API (`/api/v1/listings`, `/api/v1/auth`, `/api/v1/visits`, `/api/v1/enquiries`, `/api/v1/admin`)
- **Persistence**: Built-in in-memory domain store preloaded with verified listings (zero-config instant boot) + optional MongoDB integration.

---

## 🏗️ Project Architecture

```
room-rento-web-application/
├── data/                               # Domain fixtures & models
│   ├── rooms.js                        # Verified property listings & specs
│   ├── cities.js                       # Top metro coordinates & hotspots
│   └── users.js                        # Profile & inquiry threads
│
├── public/                             # Pure HTML, CSS, and Client JS
│   ├── index.html                      # Explore & Search page
│   ├── room-details.html               # Room Details, 360 tour, specs & host info
│   ├── compare.html                    # Smart Comparison Matrix with diff highlight
│   ├── saved.html                      # Shortlisted wishlist grid
│   ├── enquiries.html                  # Direct host chat & message threads
│   ├── account.html                    # User profile & scheduled visits manager
│   ├── admin.html                      # Admin portal, approvals & analytics
│   ├── login.html                      # Auth portal with 1-click Demo accounts
│   │
│   ├── css/
│   │   └── style.css                   # Handcrafted Urban Hearth Vanilla CSS
│   │
│   └── js/
│       ├── data.js                     # Global client data layer
│       ├── api.js                      # REST API client with offline fallback
│       ├── app.js                      # Global state, badges, theme & toast system
│       ├── explore.js                  # Search, filter chips, budget slider & cards
│       ├── details.js                  # Gallery carousel, 360 view, booking modal
│       ├── compare.js                  # Side-by-side comparison table & diff toggle
│       ├── saved.js                    # Wishlist management
│       ├── enquiries.js                # Simulated chat messaging
│       ├── account.js                  # Profile & booked visit management
│       ├── admin.js                    # Admin listings actions & metrics
│       └── auth.js                     # Authentication handling & demo accounts
│
├── server.js                           # Node.js + Express Full-Stack Server
├── package.json                        # Node dependencies & startup scripts
└── README.md                           # Documentation
```

---

## 🚀 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Node.js Server
```bash
npm start
```

### 3. Open in Browser
- **Explore & Search**: [http://localhost:5000/](http://localhost:5000/)
- **Room Details**: [http://localhost:5000/room-details.html?id=prop-101](http://localhost:5000/room-details.html?id=prop-101)
- **Compare Matrix**: [http://localhost:5000/compare.html](http://localhost:5000/compare.html)
- **Wishlist**: [http://localhost:5000/saved.html](http://localhost:5000/saved.html)
- **Host Enquiries**: [http://localhost:5000/enquiries.html](http://localhost:5000/enquiries.html)
- **User Account**: [http://localhost:5000/account.html](http://localhost:5000/account.html)
- **Admin Dashboard**: [http://localhost:5000/admin.html](http://localhost:5000/admin.html)
- **Login Portal**: [http://localhost:5000/login.html](http://localhost:5000/login.html)
- **API Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## ⚡ 1-Click Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Tenant** | `tenant@roomrento.in` | `Password123!` |
| **Owner / Host** | `priya.sharma@host.in` | `Password123!` |
| **Super Admin** | `admin@roomrento.in` | `Password123!` |
