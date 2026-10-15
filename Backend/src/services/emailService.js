const nodemailer = require('nodemailer');
const env = require('../config/env');
const { logger } = require('../config/logger');

let transporter = null;

if (env.SMTP.USER && env.SMTP.PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP.HOST,
    port: env.SMTP.PORT,
    secure: env.SMTP.PORT === 465,
    auth: {
      user: env.SMTP.USER,
      pass: env.SMTP.PASS
    }
  });
  logger.info('Nodemailer SMTP transport configured');
} else {
  logger.warn('SMTP credentials not configured; emails will be logged to console in dev mode');
}

/**
 * Send an email notification or transaction email
 * @param {object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!transporter) {
      logger.info(`[Email Mock] To: ${to} | Subject: ${subject}`);
      return { success: true, mocked: true };
    }

    const info = await transporter.sendMail({
      from: env.SMTP.FROM,
      to,
      subject,
      text: text || '',
      html
    });

    logger.info(`Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    // Non-blocking in dev mode
    return { success: false, error: error.message };
  }
};

/**
 * Notification email templates
 */
const sendEnquiryNotificationEmail = async ({ ownerEmail, ownerName, tenantName, propertyTitle, message, phone }) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5;">New Rental Enquiry - Room Rento</h2>
      <p>Hi <strong>${ownerName}</strong>,</p>
      <p>You have received a new enquiry for your property <strong>${propertyTitle}</strong> from <strong>${tenantName}</strong>:</p>
      <blockquote style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 12px; margin: 16px 0; font-style: italic;">
        "${message}"
      </blockquote>
      <p><strong>Tenant Contact:</strong> ${phone || 'Available in dashboard'}</p>
      <p style="margin-top: 24px;">
        <a href="${env.FRONTEND_URL}/dashboard/enquiries" style="background: #4f46e5; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          View & Reply in Dashboard
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to: ownerEmail,
    subject: `New Enquiry for ${propertyTitle} from ${tenantName}`,
    html
  });
};

const sendVisitNotificationEmail = async ({ recipientEmail, recipientName, propertyTitle, scheduledAt, status, note }) => {
  const formattedDate = new Date(scheduledAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Property Visit Update - Room Rento</h2>
      <p>Hi <strong>${recipientName}</strong>,</p>
      <p>Your property visit for <strong>${propertyTitle}</strong> has an update:</p>
      <div style="background: #f8fafc; padding: 14px; border-radius: 6px; margin: 16px 0;">
        <p><strong>Scheduled Time:</strong> ${formattedDate}</p>
        <p><strong>Current Status:</strong> <span style="text-transform: capitalize; font-weight: bold; color: #2563eb;">${status}</span></p>
        ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
      </div>
      <p style="margin-top: 24px;">
        <a href="${env.FRONTEND_URL}/dashboard/visits" style="background: #4f46e5; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          View Visits in Dashboard
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `Visit ${status.toUpperCase()}: ${propertyTitle}`,
    html
  });
};

module.exports = {
  sendEmail,
  sendEnquiryNotificationEmail,
  sendVisitNotificationEmail
};
