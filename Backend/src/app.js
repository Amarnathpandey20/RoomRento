const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const env = require('./config/env');
const { morganMiddleware } = require('./config/logger');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const path = require('path');
const routes = require('./routes/index');
const docsRoutes = require('./routes/docsRoutes');

const app = express();

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 1. Trust proxy if running behind reverse proxy / load balancer (e.g. Nginx, Heroku, Docker)
app.set('trust proxy', 1);

// 2. HTTP Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI to load assets smoothly
    crossOriginEmbedderPolicy: false
  })
);

// 3. CORS Configuration
const allowedOrigins = env.ALLOWED_ORIGINS;
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin policy blocked request from ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

// 4. Request Logging (Morgan -> Winston)
app.use(morganMiddleware);

// 5. Body Parsers & Compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// 6. Security Sanitization
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution (whitelist multiple query values for filters)
app.use(
  hpp({
    whitelist: ['amenities', 'roomType', 'propertyType', 'furnishing', 'ids', 'sort', 'status']
  })
);

// 7. Global API Rate Limiter
app.use('/api', apiLimiter);

// 8. Swagger / OpenAPI Documentation
app.use('/api/docs', docsRoutes);

// 9. Root Landing
app.get('/', (req, res) => {
  res.json({
    name: 'Room Rento REST API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/v1/health'
  });
});

// 10. Mount API v1 Routes
app.use('/api/v1', routes);

// 11. Centralized 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
