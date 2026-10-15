const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in Backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/room_rento',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_super_secret_access_key_room_rento_2026_xyz',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_super_secret_refresh_key_room_rento_2026_xyz',
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',

  COOKIE_SECRET: process.env.COOKIE_SECRET || 'cookie_signing_secret_dev_room_rento_99',

  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || 'room_rento_listings'
  },

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],

  SMTP: {
    HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || '',
    FROM: process.env.EMAIL_FROM || 'Room Rento <noreply@roomrento.in>'
  },

  REDIS_URL: process.env.REDIS_URL || '',

  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200
  },

  AUTO_APPROVE_VERIFIED_OWNERS: process.env.AUTO_APPROVE_VERIFIED_OWNERS === 'true'
};

module.exports = env;
