const multer = require('multer');
const ApiError = require('../utils/apiError');

// Memory storage keeps uploaded files in RAM as Buffers so we can stream them directly
// to Cloudinary with zero disk clutter and immediate resizing
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file format: ${file.mimetype}. Only JPEG, PNG, and WebP images are permitted.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per image
  }
});

// Single avatar upload helper
const uploadSingle = (fieldName = 'image') => upload.single(fieldName);

// Multiple listing images upload helper (up to 10 images at once)
const uploadMultiple = (fieldName = 'images', maxCount = 10) => upload.array(fieldName, maxCount);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple
};
