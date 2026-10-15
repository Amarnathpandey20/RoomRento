const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const Visit = require('../models/Visit');
const Enquiry = require('../models/Enquiry');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { sendEmail } = require('../services/emailService');

// Cookie options
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: maxAgeMs
});

/**
 * Helper to generate tokens and attach them to response cookies and JSON
 */
const sendAuthResponse = async (user, statusCode, res, message = 'Authenticated successfully') => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save hashed or raw refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 15 mins for access token, 7 days for refresh token
  res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken
    }
  });
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user (tenant or owner)
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, city } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: password,
    phone: phone || '',
    role: role || 'tenant',
    city: city || 'Bengaluru'
  });

  await sendAuthResponse(user, 201, res, 'Account created successfully');
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and get access + refresh tokens
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select(
    '+passwordHash +role +isActive'
  );

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account is inactive. Please contact support');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await sendAuthResponse(user, 200, res, 'Logged in successfully');
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Clear cookies and revoke refresh token
 */
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return ApiResponse.ok(res, null, 'Logged out successfully');
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Generate a new access token from refresh token cookie or body
 */
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken +isActive +isDeleted');

    if (!user || user.isDeleted || !user.isActive) {
      throw ApiError.unauthorized('User no longer exists or is suspended');
    }

    if (user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid or revoked refresh token');
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    return ApiResponse.ok(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently logged in user profile with dynamic counts
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Calculate dynamic dashboard counts for the user
  const [savedCount, visitsScheduled, enquiriesCount] = await Promise.all([
    Wishlist.countDocuments({ user: user._id }),
    Visit.countDocuments({ tenant: user._id, status: { $in: ['requested', 'confirmed'] } }),
    Enquiry.countDocuments({ tenant: user._id })
  ]);

  const userObj = user.toJSON();
  userObj.savedCount = savedCount;
  userObj.visitsScheduled = visitsScheduled;
  userObj.enquiriesCount = enquiriesCount;

  return ApiResponse.ok(res, userObj, 'User profile retrieved successfully');
});

/**
 * @route   PATCH /api/v1/auth/update-profile
 * @desc    Update user profile fields
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'city', 'bio', 'avatar', 'responseTimeAvg'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true
  });

  return ApiResponse.ok(res, updatedUser.toJSON(), 'Profile updated successfully');
});

/**
 * @route   PATCH /api/v1/auth/change-password
 * @desc    Change password with existing password confirmation
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password does not match');
  }

  user.passwordHash = newPassword;
  await user.save();

  return ApiResponse.ok(res, null, 'Password updated successfully');
});

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset token via email
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // For security, do not disclose whether user exists
    return ApiResponse.ok(res, null, 'If that email exists in our system, a password reset link has been dispatched');
  }

  // Generate a random token with expiry
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Store in user or cache with 30 min expiry
  user.refreshToken = `reset_${hashedToken}_${Date.now() + 30 * 60 * 1000}`;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  await sendEmail({
    to: user.email,
    subject: 'Room Rento - Password Reset Request',
    html: `
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link is valid for 30 minutes.</p>
    `
  });

  return ApiResponse.ok(res, null, 'If that email exists in our system, a password reset link has been dispatched');
});

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using reset token
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with matching active reset token
  const users = await User.find({ refreshToken: { $regex: `^reset_${hashedToken}_` } }).select('+refreshToken');
  const user = users[0];

  if (!user) {
    throw ApiError.badRequest('Invalid or expired password reset token');
  }

  const [, , expiryTime] = user.refreshToken.split('_');
  if (Date.now() > Number(expiryTime)) {
    throw ApiError.badRequest('Password reset token has expired');
  }

  user.passwordHash = password;
  user.refreshToken = null;
  await user.save();

  return ApiResponse.ok(res, null, 'Password reset successfully. You may now log in');
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
