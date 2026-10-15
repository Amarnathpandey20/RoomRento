const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const env = require('./env');
const { logger } = require('./logger');

const isConfigured = Boolean(
  env.CLOUDINARY.CLOUD_NAME &&
  env.CLOUDINARY.API_KEY &&
  env.CLOUDINARY.API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY.CLOUD_NAME,
    api_key: env.CLOUDINARY.API_KEY,
    api_secret: env.CLOUDINARY.API_SECRET,
    secure: true
  });
  logger.info('Cloudinary configured successfully');
} else {
  logger.warn('Cloudinary credentials missing; image upload will fallback to local/mock URLs');
}

const fs = require('fs');
const path = require('path');

const uploadToCloudinary = (buffer, folder = 'room_rento/listings', originalname = 'photo.jpg') => {
  return new Promise(async (resolve, reject) => {
    if (!isConfigured) {
      try {
        const uploadsDir = path.join(__dirname, '../../public/uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const ext = path.extname(originalname || 'photo.jpg') || '.jpg';
        const cleanName = path.basename(originalname || 'photo', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${cleanName}_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filePath, buffer);
        logger.info(`[Upload] Image saved locally: ${filename}`);
        return resolve({
          url: `/uploads/${filename}`,
          publicId: filename
        });
      } catch (err) {
        logger.warn(`Failed local upload file save: ${err.message}. Using high-res fallback.`);
        return resolve({
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
          publicId: `mock_${Date.now()}`
        });
      }
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1400, height: 950, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload failed: ${error.message}`);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary by public ID
 * @param {string} publicId
 * @returns {Promise<object>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!isConfigured || !publicId || publicId.startsWith('mock_')) {
    try {
      const filePath = path.join(__dirname, '../../public/uploads', publicId);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (e) {}
    return { result: 'ok' };
  }
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.error(`Failed to delete asset ${publicId} from Cloudinary: ${err.message}`);
    return { result: 'error', error: err.message };
  }
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadToCloudinary,
  deleteFromCloudinary
};
