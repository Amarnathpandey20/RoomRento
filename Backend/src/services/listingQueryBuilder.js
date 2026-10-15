/**
 * ============================================================================
 * Dynamic Listing Query Builder & Geo Search Service
 * ============================================================================
 * Translates HTTP query parameters from the React frontend into optimized
 * MongoDB filter expressions, geospatial queries, and sorting criteria.
 */

/**
 * Map of human-friendly amenity tags (e.g. from comma-separated URL params)
 * to their exact Mongo schema boolean/field paths.
 */
const AMENITY_FIELD_MAP = {
  // In-room features
  ac: 'roomFeatures.ac',
  cooler: 'roomFeatures.cooler',
  wardrobe: 'roomFeatures.wardrobe',
  desk: 'roomFeatures.studyTable',
  studytable: 'roomFeatures.studyTable',
  attachedbath: 'roomFeatures.attachedBathroom',
  attachedbathroom: 'roomFeatures.attachedBathroom',
  geyser: 'roomFeatures.geyser',
  balcony: 'roomFeatures.balcony',
  tv: 'roomFeatures.tv',
  fridge: 'roomFeatures.fridge',
  mattress: 'roomFeatures.mattressIncluded',

  // Building facilities
  wifi: 'buildingFacilities.wifi',
  powerbackup: 'buildingFacilities.powerBackup',
  power_backup: 'buildingFacilities.powerBackup',
  lift: 'buildingFacilities.lift',
  elevator: 'buildingFacilities.lift',
  water24x7: 'buildingFacilities.water24x7',
  ro_water: 'buildingFacilities.roDrinkingWater',
  bikeparking: 'buildingFacilities.bikeParking',
  carparking: 'buildingFacilities.carParking',
  parking: 'parking_composite', // special handler: bike or car parking
  cctv: 'buildingFacilities.cctv',
  security: 'buildingFacilities.securityGuard',
  securityguard: 'buildingFacilities.securityGuard',
  laundry: 'buildingFacilities.laundry',
  gym: 'buildingFacilities.gym',
  housekeeping: 'buildingFacilities.housekeeping',
  terrace: 'buildingFacilities.terraceAccess',
  commonkitchen: 'buildingFacilities.commonKitchen',
  commonlounge: 'buildingFacilities.commonLounge',

  // Food & Mess
  food: 'food_composite',
  meals: 'food_composite',
  cookingallowed: 'foodServices.cookingAllowed',
  tiffinservice: 'foodServices.tiffinService',

  // Rules
  petsallowed: 'rules.petsAllowed',
  pets: 'rules.petsAllowed',
  bachelors: 'rules.bachelorsAllowed',
  couples: 'rules.couplesAllowed',
  visitors: 'rules.visitorsAllowed'
};

/**
 * Builds the MongoDB filter object based on query parameters.
 * Only published, non-deleted listings are returned for public searches.
 *
 * @param {object} queryParams - Express req.query
 * @returns {{ filter: object, sort: object, appliedFilters: object, geoNear: object|null }}
 */
const buildListingQuery = (queryParams) => {
  const {
    q,
    search,
    city,
    area,
    locality,
    minPrice,
    maxPrice,
    roomType,
    propertyType,
    furnishing,
    gender,
    occupancy,
    availableFrom,
    verified,
    amenities,
    lat,
    lng,
    radius = 10, // default 10 km
    sort = 'newest'
  } = queryParams;

  // Base visibility criteria: Must be published and not soft-deleted
  const filter = {
    status: 'published',
    isDeleted: false
  };

  const appliedFilters = {};

  // 1. Flexible Text / Location / Keyword Search (supports both 'q' and 'search')
  const queryText = (q || search || '').trim();
  if (queryText) {
    const escapedQ = queryText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQ, 'i');
    filter.$or = [
      { title: regex },
      { 'location.area': regex },
      { 'location.city': regex },
      { 'location.address': regex },
      { 'location.landmark': regex },
      { roomType: regex },
      { propertyType: regex },
      { description: regex }
    ];
    appliedFilters.q = queryText;
  }

  // 2. City Filter (Case-insensitive, ignores 'All' / 'All India')
  if (city && city.trim() && !city.trim().toLowerCase().startsWith('all')) {
    const escapedCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter['location.city'] = new RegExp(`^${escapedCity}$`, 'i');
    appliedFilters.city = city.trim();
  }

  // 3. Locality / Area Filter (Partial or exact regex match, supports both 'area' and 'locality')
  const areaFilter = (area || locality || '').trim();
  if (areaFilter && !areaFilter.toLowerCase().startsWith('all')) {
    const escapedArea = areaFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter['location.area'] = new RegExp(escapedArea, 'i');
    appliedFilters.area = areaFilter;
  }

  // 4. Monthly Rent Price Range
  const priceFilter = {};
  if (minPrice !== undefined && minPrice !== '') {
    const minVal = Number(minPrice);
    if (!isNaN(minVal)) {
      priceFilter.$gte = minVal;
      appliedFilters.minPrice = minVal;
    }
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    const maxVal = Number(maxPrice);
    if (!isNaN(maxVal)) {
      priceFilter.$lte = maxVal;
      appliedFilters.maxPrice = maxVal;
    }
  }
  if (Object.keys(priceFilter).length > 0) {
    filter['pricing.monthlyRent'] = priceFilter;
  }

  // 5. Room Type (supports single or comma-separated e.g. "single,1BHK,studio")
  if (roomType) {
    const types = roomType.split(',').map((t) => t.trim().toLowerCase());
    if (types.length === 1) {
      filter.roomType = types[0];
    } else {
      filter.roomType = { $in: types };
    }
    appliedFilters.roomType = roomType;
  }

  // 6. Property Type (room, pg, flat, hostel, studio)
  if (propertyType) {
    const pTypes = propertyType.split(',').map((t) => t.trim().toLowerCase());
    if (pTypes.length === 1) {
      filter.propertyType = pTypes[0];
    } else {
      filter.propertyType = { $in: pTypes };
    }
    appliedFilters.propertyType = propertyType;
  }

  // 7. Furnishing Status (furnished, semi-furnished, unfurnished)
  if (furnishing) {
    const fTypes = furnishing.split(',').map((f) => f.trim().toLowerCase());
    if (fTypes.length === 1) {
      filter['details.furnishing'] = fTypes[0];
    } else {
      filter['details.furnishing'] = { $in: fTypes };
    }
    appliedFilters.furnishing = furnishing;
  }

  // 8. Gender Preference (boys, girls, family, any)
  if (gender) {
    const g = gender.trim().toLowerCase();
    // If a user selects 'boys', listings allowing 'boys' OR 'any' should match
    if (g === 'boys' || g === 'male') {
      filter['rules.genderPreference'] = { $in: ['boys', 'any'] };
    } else if (g === 'girls' || g === 'female') {
      filter['rules.genderPreference'] = { $in: ['girls', 'any'] };
    } else if (g === 'family') {
      filter['rules.genderPreference'] = { $in: ['family', 'any'] };
    } else {
      filter['rules.genderPreference'] = g;
    }
    appliedFilters.gender = gender;
  }

  // 9. Occupancy / Bed capacity
  if (occupancy) {
    const occ = parseInt(occupancy, 10);
    if (!isNaN(occ) && occ > 0) {
      filter['details.totalOccupants'] = occ;
      appliedFilters.occupancy = occ;
    }
  }

  // 10. Verified Only Listings
  if (verified === 'true' || verified === true) {
    filter.isVerified = true;
    appliedFilters.verified = true;
  }

  // 11. Availability Date Filter
  if (availableFrom) {
    const dateObj = new Date(availableFrom);
    if (!isNaN(dateObj.getTime())) {
      filter.availableFrom = { $lte: dateObj };
      appliedFilters.availableFrom = availableFrom;
    }
  }

  // 12. Dynamic Amenities & Features Filter Builder
  // Parses comma-separated tags: e.g. "amenities=wifi,ac,lift,parking,geyser"
  if (amenities) {
    const tags = amenities
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/[- ]/g, ''))
      .filter(Boolean);

    tags.forEach((tag) => {
      const fieldPath = AMENITY_FIELD_MAP[tag];
      if (fieldPath) {
        if (fieldPath === 'parking_composite') {
          // Matches either bike parking or car parking
          filter.$or = filter.$or || [];
          filter.$or.push({ 'buildingFacilities.bikeParking': true }, { 'buildingFacilities.carParking': true });
        } else if (fieldPath === 'food_composite') {
          // Food included: veg, non-veg, or both
          filter['foodServices.mealsIncluded'] = { $in: ['veg', 'non-veg', 'both'] };
        } else {
          filter[fieldPath] = true;
        }
      }
    });

    appliedFilters.amenities = tags;
  }

  // 13. Geospatial Search ($geoWithin / $centerSphere)
  // When latitude and longitude are supplied, searches within radius (in kilometers)
  let geoNear = null;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusKm = parseFloat(radius) || 10;

  if (!isNaN(latitude) && !isNaN(longitude)) {
    // Radius in radians = distance in km / earth radius in km (~6378.1 km)
    const radiusInRadians = radiusKm / 6378.1;
    filter['location.geo'] = {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInRadians]
      }
    };
    appliedFilters.geo = { lat: latitude, lng: longitude, radiusKm };
  }

  // 14. Sorting Mapping
  let sortCriteria = { isFeatured: -1, createdAt: -1 }; // Featured listings first by default

  switch (sort) {
    case 'price_asc':
      sortCriteria = { 'pricing.monthlyRent': 1 };
      break;
    case 'price_desc':
      sortCriteria = { 'pricing.monthlyRent': -1 };
      break;
    case 'popular':
      sortCriteria = { ratingAvg: -1, views: -1 };
      break;
    case 'newest':
      sortCriteria = { createdAt: -1 };
      break;
    case 'nearest':
      // Handled via $near if no text search or via distance calculation in controller
      sortCriteria = { createdAt: -1 };
      break;
    default:
      sortCriteria = { isFeatured: -1, createdAt: -1 };
  }

  return {
    filter,
    sort: sortCriteria,
    appliedFilters,
    geoCoords: !isNaN(latitude) && !isNaN(longitude) ? { lng: longitude, lat: latitude } : null
  };
};

module.exports = {
  buildListingQuery,
  AMENITY_FIELD_MAP
};
