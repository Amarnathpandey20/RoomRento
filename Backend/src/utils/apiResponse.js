/**
 * Standardized API Response helper
 * Ensures every response matches { success, message, data, meta }
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response payload (object, array, etc.)
   * @param {string} message - Human-readable status message
   * @param {object|null} meta - Optional pagination, query filters, or server metrics
   */
  constructor(statusCode, data = null, message = 'Success', meta = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (meta !== null && meta !== undefined) {
      this.meta = meta;
    }
  }

  /**
   * Send JSON response via express response object
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.meta ? { meta: this.meta } : {})
    });
  }

  // Pre-configured response factories
  static ok(res, data = null, message = 'Success', meta = null) {
    return new ApiResponse(200, data, message, meta).send(res);
  }

  static created(res, data = null, message = 'Created successfully', meta = null) {
    return new ApiResponse(201, data, message, meta).send(res);
  }

  static noContent(res, message = 'Deleted successfully') {
    return res.status(200).json({
      success: true,
      message,
      data: null
    });
  }
}

module.exports = ApiResponse;
