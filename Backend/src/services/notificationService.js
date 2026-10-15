const Notification = require('../models/Notification');
const { logger } = require('../config/logger');

/**
 * Creates an in-app notification for a user
 * @param {object} param0 - { userId, type, title, message, link, metadata }
 */
const createNotification = async ({ userId, type, title, message, link = '', metadata = {} }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title: title || 'Notification',
      message,
      link,
      metadata
    });
    return notification;
  } catch (error) {
    logger.error(`Failed to create notification: ${error.message}`);
    return null;
  }
};

module.exports = {
  createNotification
};
