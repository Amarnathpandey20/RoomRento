/**
 * Pagination helper to normalize page, limit, skip, and compute metadata
 */
const getPagination = (query, defaultLimit = 12, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  let limit = parseInt(query.limit, 10) || defaultLimit;
  if (limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip
  };
};

/**
 * Format pagination metadata for API responses
 * @param {number} total - Total count of matching records
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {object} extraMeta - Any extra metadata (e.g., active filters, time)
 */
const formatPaginationMeta = (total, page, limit, extraMeta = {}) => {
  const totalPages = Math.ceil(total / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
    ...extraMeta
  };
};

module.exports = {
  getPagination,
  formatPaginationMeta
};
