/**
 * Geospatial calculation helpers (Haversine distance, bounds, coordinate validations)
 */

/**
 * Calculates distance between two points in kilometers using Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Formats distance into human readable string: e.g. "450m" or "2.3 km"
 * @param {number} distanceInKm
 * @returns {string}
 */
const formatDistanceText = (distanceInKm) => {
  if (distanceInKm == null || isNaN(distanceInKm)) return '';
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
};

/**
 * Validates longitude and latitude bounds
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
const isValidCoordinates = (lng, lat) => {
  return (
    typeof lng === 'number' &&
    !isNaN(lng) &&
    lng >= -180 &&
    lng <= 180 &&
    typeof lat === 'number' &&
    !isNaN(lat) &&
    lat >= -90 &&
    lat <= 90
  );
};

module.exports = {
  calculateDistanceKm,
  formatDistanceText,
  isValidCoordinates
};
