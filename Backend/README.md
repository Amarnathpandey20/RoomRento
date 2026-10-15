# Room Rento - Backend REST API

A production-grade RESTful API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** for a full-featured "Room Finder for Rent" platform (Rooms, PGs, Flats, Hostels, and Studios). Designed to seamlessly match a modern React frontend.

---

## 📑 Table of Contents
1. [Architecture & Tech Stack](#architecture--tech-stack)
2. [Folder Structure](#folder-structure)
3. [MongoDB Models & Indexes](#mongodb-models--indexes)
4. [Key Engineering Highlights](#key-engineering-highlights)
5. [API Endpoints Summary](#api-endpoints-summary)
6. [Search & Dynamic Filter Guide with cURL Samples](#search--dynamic-filter-guide-with-curl-samples)
7. [Installation & Setup](#installation--setup)
8. [Database Seeding](#database-seeding)
9. [Running Tests](#running-tests)
10. [Docker Deployment](#docker-deployment)
11. [Swagger Documentation](#swagger-documentation)

---

## 🛠 Architecture & Tech Stack

- **Runtime**: Node.js (LTS v18+) & Express.js
- **Database**: MongoDB with Mongoose (compatible with MongoDB Atlas and local instances)
- **Authentication**: JWT (Access Token + Refresh Token stored in `httpOnly` secure cookies & Bearer headers), bcrypt password hashing
- **Validation**: Joi schema validation for `body`, `query`, and `params`
- **File Upload**: Multer (memory buffer stream) + Cloudinary (automatic image resize, WebP conversion, remote deletion)
- **Security Suite**:
  - `helmet`: Secure HTTP headers
  - `cors`: Allowed origins whitelist with cookie credentials
  - `express-rate-limit`: Tiered rate limiting (General, Auth, Enquiry spam prevention)
  - `express-mongo-sanitize`: NoSQL injection defense
  - `hpp`: HTTP parameter pollution prevention
  - `xss-clean`: Cross-site scripting sanitization
- **Logging**: Morgan HTTP logger piped into Winston (console + daily rotating file logs in `/logs`)
- **Documentation**: Swagger / OpenAPI 3.0 at `/api/docs` and JSON spec at `/api/docs/json`
- **Testing**: Jest, Supertest, and `mongodb-memory-server`

---

## 📂 Folder Structure

```
Backend/
├── .env.example              # Sample environment configuration
├── .env                      # Local environment configuration
├── Dockerfile                # Multi-stage production container
├── docker-compose.yml        # Docker compose for API + MongoDB + Mongo Express
├── package.json              # NPM dependencies and scripts
├── postman_collection.json   # Ready-to-import Postman API collection
├── README.md                 # Complete documentation
└── src/
    ├── app.js                # Express app setup, security middlewares, routes
    ├── server.js             # Server bootstrapper, MongoDB connection, graceful shutdown
    ├── config/
    │   ├── db.js             # Mongoose connection with reconnection events
    │   ├── cloudinary.js     # Cloudinary SDK buffer stream & delete handlers
    │   ├── env.js            # Validated environment configurations
    │   ├── logger.js         # Winston logger + Morgan stream
    │   └── redis.js          # In-memory/Redis cache manager for fast query caching
    ├── models/
    │   ├── User.js           # Users (Tenants, Owners, Admins) with role extras & soft delete
    │   ├── Listing.js        # Listings with text index, 2dsphere geo, compound indexes
    │   ├── Enquiry.js        # Rental enquiries with 24-hr duplicate protection
    │   ├── Visit.js          # In-person property visit scheduling
    │   ├── Wishlist.js       # Unique compound index [user, listing]
    │   ├── Review.js         # Rating breakdown & auto-calculated aggregates on Listing
    │   ├── Report.js         # Listing flag & moderation reports
    │   ├── Notification.js   # User in-app notifications
    │   └── Location.js       # Popular localities and cities
    ├── controllers/
    │   ├── authController.js
    │   ├── listingPublicController.js
    │   ├── listingOwnerController.js
    │   ├── wishlistController.js
    │   ├── enquiryController.js
    │   ├── visitController.js
    │   ├── reviewController.js
    │   ├── reportController.js
    │   ├── notificationController.js
    │   └── adminController.js
    ├── routes/
    │   ├── index.js          # Aggregated /api/v1 router + health check
    │   ├── authRoutes.js
    │   ├── listingRoutes.js
    │   ├── ownerRoutes.js
    │   ├── wishlistRoutes.js
    │   ├── enquiryRoutes.js
    │   ├── visitRoutes.js
    │   ├── reviewRoutes.js
    │   ├── reportRoutes.js
    │   ├── notificationRoutes.js
    │   ├── adminRoutes.js
    │   └── docsRoutes.js     # Swagger UI
    ├── middlewares/
    │   ├── auth.js           # JWT verification & optional auth
    │   ├── role.js           # Role-based access control (RBAC)
    │   ├── validate.js       # Joi request validation middleware
    │   ├── upload.js         # Multer image upload filter & buffer memory storage
    │   ├── errorHandler.js   # Centralized error handler & 404 responder
    │   └── rateLimiter.js    # Rate limiting middlewares
    ├── services/
    │   ├── listingQueryBuilder.js # Dynamic filter, text search & geoNear builder
    │   ├── emailService.js        # Nodemailer transactional email delivery
    │   └── notificationService.js # In-app notification dispatcher
    ├── validators/
    │   ├── authValidator.js
    │   ├── listingValidator.js
    │   ├── enquiryValidator.js
    │   ├── visitValidator.js
    │   ├── reviewValidator.js
    │   └── reportValidator.js
    ├── utils/
    │   ├── apiError.js       # Standardized custom error class
    │   ├── apiResponse.js    # Standardized JSON response helper
    │   ├── asyncHandler.js   # Async route wrapper
    │   ├── pagination.js     # Pagination metadata formatter
    │   ├── geo.js            # Haversine distance calculation helpers
    │   └── swagger.js        # Swagger JSDoc OpenAPI definition
    ├── seed/
    │   └── seed.js           # 32 realistic listings, 10 users, reviews, enquiries
    └── tests/
        ├── setup.js          # In-memory MongoDB testing harness
        ├── auth.test.js      # Auth integration tests
        ├── listing.test.js   # Listing CRUD & draft tests
        └── search.test.js    # Search & dynamic filter tests
```

---

## 🗄 MongoDB Models & Indexes

### 1. `User`
- **Fields**: `name`, `email` (unique), `phone`, `passwordHash` (hidden), `role` (`tenant` | `owner` | `admin`), `avatar`, `isVerified`, `isActive`, `city`, `bio`, `refreshToken` (hidden), `savedSearches[]`, `isDeleted`.
- **Owner Extras**: `responseTimeAvg`, `totalListings`, `verifiedOwner`.
- **Indexes**: `{ email: 1, isDeleted: 1 }`, `{ role: 1, verifiedOwner: 1 }`.

### 2. `Listing` (The Core Property Collection)
- **Hierarchy & Specs**:
  - `owner`: ref User
  - `title`, `subtitle`, `description`, `slug` (unique auto-generated), `status` (`draft` | `pending` | `published` | `rented` | `rejected` | `archived`), `isVerified`, `isFeatured`, `views`, `availableFrom`
  - `propertyType`: `room` | `pg` | `flat` | `hostel` | `studio`
  - `roomType`: `single` | `double-sharing` | `triple-sharing` | `1RK` | `1BHK` | `2BHK` | `3BHK` | `studio`
  - `details`: `floorNumber`, `totalFloors`, `areaSqFt`, `totalOccupants`, `propertyAgeYears`, `furnishing` (`furnished` | `semi-furnished` | `unfurnished`), `bedType`, `bedSize`, `facing`
  - `location`: `address`, `area`, `city`, `state`, `pincode`, `landmark`, `distanceText`, `geo: { type: "Point", coordinates: [lng, lat] }`
  - `pricing`: `monthlyRent`, `securityDeposit`, `brokerage`, `maintenanceCharges`, `electricity` (`included` | `metered`), `electricityRate`, `waterCharges`, `isNegotiable`, `discounts[]`, `offerTag`
  - `roomFeatures`: `wardrobe`, `studyTable`, `ac`, `cooler`, `fan`, `attachedBathroom`, `geyser`, `balcony`, `window`, `naturalLight`, `tv`, `fridge`, `mattressIncluded`
  - `buildingFacilities`: `wifi`, `powerBackup`, `lift`, `water24x7`, `roDrinkingWater`, `bikeParking`, `carParking`, `cctv`, `securityGuard`, `fireSafety`, `laundry`, `commonKitchen`, `diningArea`, `terraceAccess`, `gym`, `housekeeping`, `commonLounge`
  - `foodServices`: `mealsIncluded` (`none` | `veg` | `non-veg` | `both`), `tiffinService`, `cookingAllowed`, `maidService`, `cleaningFrequency` (`daily` | `weekly` | `none`)
  - `rules`: `genderPreference` (`boys` | `girls` | `family` | `any`), `bachelorsAllowed`, `couplesAllowed`, `petsAllowed`, `smokingAllowed`, `drinkingAllowed`, `visitorsAllowed`, `gateClosingTime`, `noticePeriodDays`, `minimumStayMonths`
  - `nearby`: Array of `{ type, name, distanceKm }`
  - `images`: Array of `{ url, publicId, order, isCover }`
  - `ratingAvg`, `ratingCount`, `ratingBreakdown: { cleanliness, safety, valueForMoney, ownerBehaviour }`, `enquiryCount`, `wishlistCount`
- **Indexes**:
  - **Text Index**: Weighted across `title (weight 5)`, `location.area (4)`, `location.city (3)`, `description (1)`
  - **2dsphere Index**: On `location.geo` for radius search and `$geoNear`
  - **Compound Indexes**:
    - `{ "location.city": 1, status: 1, "pricing.monthlyRent": 1 }`
    - `{ roomType: 1, "details.furnishing": 1 }`
    - `{ status: 1, isDeleted: 1, isFeatured: -1, createdAt: -1 }`

### 3. `Enquiry`
- Fields: `listing`, `tenant`, `owner`, `message`, `phone`, `preferredContact`, `moveInDate`, `status` (`new` | `contacted` | `visit-scheduled` | `closed`).
- **Business Rule**: Prevent duplicate enquiries on the same listing within 24 hours.

### 4. `Visit`
- Fields: `listing`, `tenant`, `owner`, `scheduledAt`, `status` (`requested` | `confirmed` | `completed` | `cancelled` | `rescheduled`), `note`.

### 5. `Review`
- Fields: `listing`, `user`, `rating`, `cleanliness`, `safety`, `valueForMoney`, `ownerBehaviour`, `comment`, `helpfulCount`, `helpfulUsers[]`.
- **Constraint**: One review per user per listing (unique index `{ listing: 1, user: 1 }`).
- **Atomic Recalculation**: Mongoose post-save / post-delete aggregation hook automatically updates `ratingAvg`, `ratingCount`, and `ratingBreakdown` directly on the `Listing` document.

### 6. `Wishlist`
- Compound Unique Index: `{ user: 1, listing: 1 }` to prevent duplicate saves.

---

## ⚡ Key Engineering Highlights

### 1. Dynamic Query & Amenity Filter Builder (`listingQueryBuilder.js`)
Frontend users can combine arbitrary parameters:
- `amenities=wifi,ac,lift,parking,geyser,powerBackup`
- The query builder dynamically maps each tag into its appropriate boolean flag:
  - `ac` $\rightarrow$ `roomFeatures.ac = true`
  - `parking` $\rightarrow$ `$or: [ { "buildingFacilities.bikeParking": true }, { "buildingFacilities.carParking": true } ]`
  - `food` $\rightarrow$ `"foodServices.mealsIncluded": { $in: ["veg", "non-veg", "both"] }`

### 2. Geospatial Proximity Search (`$centerSphere` + Haversine Distance)
When `lat` & `lng` are supplied:
- Uses `$geoWithin: { $centerSphere: [[lng, lat], radiusInRadians] }`
- Calculates the exact distance in kilometers using the Haversine formula and attaches a formatted `distanceText` (e.g., `350m from search location` or `2.4 km from search location`).

### 3. Atomic Counter Updates
Listing counters (`views`, `enquiryCount`, `wishlistCount`, `ratings`) are mutated atomically using MongoDB operators (`$inc`) to prevent race conditions during high concurrency.

### 4. In-Memory / Redis Caching
Search results, popular localities, and featured listings are cached with automatic invalidation upon listing creation, updates, or status changes.

---

## 🚀 API Endpoints Summary (Prefix: `/api/v1`)

### Authentication (`/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create tenant or owner account | Public |
| POST | `/auth/login` | Login & receive tokens / cookies | Public |
| POST | `/auth/logout` | Revoke tokens & clear cookies | Private |
| POST | `/auth/refresh` | Refresh access token | Public/Cookie |
| POST | `/auth/forgot-password` | Request password reset email | Public |
| POST | `/auth/reset-password` | Reset password using token | Public |
| GET | `/auth/me` | Current profile + stats counts | Private |
| PATCH | `/auth/update-profile` | Update profile details | Private |
| PATCH | `/auth/change-password` | Change user password | Private |

### Public Listings (`/listings`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/listings` | Dynamic search with multiple filters | Public |
| GET | `/listings/featured` | Top verified featured listings | Public |
| GET | `/listings/popular-areas` | Localities with avg rent & counts | Public |
| GET | `/listings/autocomplete?q=` | Autocomplete for localities & titles | Public |
| GET | `/listings/:idOrSlug` | Detailed listing (increments view) | Public/Optional |
| GET | `/listings/:id/similar` | Similar recommendations in area | Public |
| POST | `/listings/compare` | Compare up to 3 listings side-by-side | Public |

### Owner Listings Management
| Method | Endpoint | Description | Role |
|---|---|---|---|
| POST | `/listings` | Publish new listing | Owner/Admin |
| POST | `/listings/draft` | Autosave draft for multi-step form | Owner/Admin |
| PUT | `/listings/:id` | Update listing details | Owner/Admin |
| PATCH | `/listings/:id/status` | Change status (draft, published, rented) | Owner/Admin |
| DELETE | `/listings/:id` | Soft delete listing | Owner/Admin |
| POST | `/listings/:id/images` | Upload up to 10 images (Cloudinary) | Owner/Admin |
| DELETE | `/listings/:id/images/:imgId`| Delete an image from listing | Owner/Admin |
| PATCH | `/listings/:id/images/reorder`| Reorder images & set cover photo | Owner/Admin |
| GET | `/owner/listings` | Owner's listings with status counts | Owner/Admin |
| GET | `/owner/stats` | Analytics, total views & enquiries trend | Owner/Admin |

### Tenant & Social Features
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/wishlist` | Get user saved listings | Private |
| POST | `/wishlist/:listingId` | Add listing to wishlist | Private |
| DELETE| `/wishlist/:listingId` | Remove from wishlist | Private |
| POST | `/listings/:id/enquiries` | Submit rental enquiry | Private |
| GET | `/enquiries/sent` | Tenant sent enquiries | Private |
| GET | `/enquiries/received` | Owner received enquiries | Owner/Admin |
| PATCH| `/enquiries/:id/status` | Update enquiry status | Owner/Admin |
| POST | `/listings/:id/visits` | Schedule property visit | Private |
| GET | `/visits/mine` | View scheduled visits | Private |
| PATCH| `/visits/:id` | Confirm/reschedule/cancel visit | Private |
| GET | `/listings/:id/reviews` | View listing reviews & ratings | Public |
| POST | `/listings/:id/reviews` | Submit verified review | Private |
| PUT | `/reviews/:id` | Edit own review | Private |
| DELETE| `/reviews/:id` | Delete own review | Private |
| POST | `/reviews/:id/helpful` | Upvote review helpfulness | Private |
| POST | `/listings/:id/report` | Report fraudulent listing | Private |
| GET | `/notifications` | Get in-app notifications | Private |
| PATCH| `/notifications/:id/read` | Mark notification as read | Private |
| PATCH| `/notifications/read-all` | Mark all notifications as read | Private |

### Admin Moderation (`/admin`)
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/admin/users` | List users with search & filters | Admin |
| PATCH| `/admin/users/:id/block` | Block / unblock user account | Admin |
| GET | `/admin/listings` | Moderation queue (pending/rejected) | Admin |
| PATCH| `/admin/listings/:id/verify` | Approve and verify listing | Admin |
| PATCH| `/admin/listings/:id/reject` | Reject listing with feedback | Admin |
| GET | `/admin/reports` | List flagged listing reports | Admin |
| PATCH| `/admin/reports/:id` | Resolve / dismiss report | Admin |
| GET | `/admin/stats` | Platform-wide analytics overview | Admin |

---

## 🔍 Search & Dynamic Filter Guide with cURL Samples

### 1. General Search (Price Range, City, and Sort)
```bash
curl -X GET "http://localhost:5000/api/v1/listings?city=Bengaluru&area=Koramangala&minPrice=10000&maxPrice=25000&sort=price_asc&page=1&limit=10" \
  -H "Accept: application/json"
```

### 2. Multi-Amenity Filter Search
Filter properties that have Wi-Fi, Air Conditioning, Power Backup, and Lift:
```bash
curl -X GET "http://localhost:5000/api/v1/listings?city=Bengaluru&amenities=wifi,ac,powerBackup,lift" \
  -H "Accept: application/json"
```

### 3. Food, Gender, and Room Type Search (PGs & Hostels)
```bash
curl -X GET "http://localhost:5000/api/v1/listings?propertyType=pg&roomType=double-sharing&gender=girls&amenities=food,wifi" \
  -H "Accept: application/json"
```

### 4. Geospatial Proximity Search
Search listings within 5 km radius of coordinates (e.g., Koramangala 12.9352, 77.6271):
```bash
curl -X GET "http://localhost:5000/api/v1/listings?lat=12.9352&lng=77.6271&radius=5&sort=nearest" \
  -H "Accept: application/json"
```

### 5. Full-Text Search
```bash
curl -X GET "http://localhost:5000/api/v1/listings?q=balcony%20studio" \
  -H "Accept: application/json"
```

### 6. Side-by-Side Property Comparison
```bash
curl -X POST "http://localhost:5000/api/v1/listings/compare" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["670cc8b23419df1234567890", "670cc8b23419df1234567891"]
  }'
```

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas connection string

### Steps
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your secrets or use the default local configuration:
   ```bash
   cp .env.example .env
   ```

4. Start development server with live reload:
   ```bash
   npm run dev
   ```

5. Production start:
   ```bash
   npm start
   ```

---

## 🌱 Database Seeding

Populate the database with 32 realistic listings across Bengaluru, Mumbai, Hyderabad, and Pune, along with demo users, reviews, enquiries, visits, and wishlists matching the frontend mock data:

```bash
npm run seed
```

### Default Demo Credentials:
- **Tenant**: `arjun.mehta@techcorp.in` / `Password123!`
- **Owner (Superhost)**: `priya.sharma@host.in` / `Password123!`
- **Owner (PG Host)**: `rajesh.kumar@host.in` / `Password123!`
- **Admin**: `admin@roomrento.in` / `Password123!`

---

## 🧪 Running Tests

The test suite runs using Jest, Supertest, and `mongodb-memory-server`:

```bash
npm test
```

Tests cover:
- Authentication, tokens, password hashing, and duplicate account prevention
- Owner listing creation, draft autosaves, status updates, and soft deletion
- Public search filters, dynamic amenities mapping, price ranges, and pagination

---

## 🐳 Docker Deployment

Run the complete platform stack (API + MongoDB + Mongo Express UI) with Docker Compose:

```bash
docker-compose up --build -d
```

- API Server: `http://localhost:5000`
- Swagger Docs: `http://localhost:5000/api/docs`
- Mongo Express DB Management: `http://localhost:8081` (User: `admin`, Pass: `admin`)

---

## 📖 Swagger / OpenAPI Documentation

Interactive Swagger documentation is available at:
`http://localhost:5000/api/docs`

You can test every endpoint directly from your browser, inspect schemas, and authenticate using the Bearer token authorization button.
