/**
 * Listing Data Adapter
 * Normalizes MongoDB listing records to match React UI component requirements
 */

export function formatListingForFrontend(b) {
  if (!b) return null;

  const id = (b._id || b.id)?.toString() || '';
  const monthlyRent = b.pricing?.monthlyRent ?? b.price ?? 0;

  // Extract array of image URLs
  let images = [];
  if (Array.isArray(b.images) && b.images.length > 0) {
    images = b.images.map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean);
  }
  if (images.length === 0) {
    images = [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80'
    ];
  }

  // Capitalize helpers
  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');

  const propertyTypeFormatted = capitalize(b.propertyType || 'Room');
  const roomCategoryFormatted = b.roomType || 'Single';

  return {
    ...b,
    id,
    _id: id,
    title: b.title || 'Modern Room for Rent',
    city: b.location?.city || b.city || 'Bengaluru',
    state: b.location?.state || b.state || 'Karnataka',
    locality: b.location?.area || b.locality || 'Central',
    subtitle: b.subtitle || `${roomCategoryFormatted} in ${b.location?.area || 'Central'}, ${b.location?.city || 'Bengaluru'}`,
    type: propertyTypeFormatted,
    roomCategory: roomCategoryFormatted,
    address: b.location?.address || b.address || `${b.location?.area || 'Central'}, ${b.location?.city || 'Bengaluru'}`,
    distanceText: b.distanceText || b.location?.distanceText || 'Near transit & tech hubs',
    price: monthlyRent,
    priceDisplay: `₹${monthlyRent.toLocaleString('en-IN')}`,
    rating: b.ratingAvg || b.rating || 4.8,
    reviewCount: b.ratingCount || b.reviewCount || 16,
    isVerified: Boolean(b.isVerified),
    zeroBrokerage: b.pricing ? b.pricing.brokerage === 0 : true,
    offerTag: b.pricing?.offerTag || b.offerTag || (b.pricing?.brokerage === 0 ? 'Zero Brokerage' : ''),
    genderPreference: b.rules?.genderPreference
      ? capitalize(b.rules.genderPreference)
      : (b.genderPreference || 'Any'),
    furnishing: b.details?.furnishing
      ? `${capitalize(b.details.furnishing)} Furnished`
      : (b.furnishing || 'Fully Furnished'),
    moveIn: b.moveIn || (b.availableFrom
      ? `Available from ${new Date(b.availableFrom).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
      : 'Immediate Move-in'),
    noticePeriod: b.noticePeriod || `${b.rules?.noticePeriodDays || 30} Days Notice`,
    lockIn: b.lockIn || `${b.rules?.minimumStayMonths || 1} Month`,
    securityDeposit: b.securityDeposit || (b.pricing?.securityDeposit
      ? `₹${b.pricing.securityDeposit.toLocaleString('en-IN')}`
      : `₹${monthlyRent.toLocaleString('en-IN')}`),
    maintenance: b.maintenance || (b.pricing?.maintenanceCharges ? `₹${b.pricing.maintenanceCharges}` : 'Included'),
    carpetArea: b.carpetArea || (b.details?.areaSqFt ? `${b.details.areaSqFt} sq.ft` : '280 sq.ft'),
    floor: b.floor || (b.details ? `${b.details.floorNumber || 2} of ${b.details.totalFloors || 4} Floors` : '2nd of 4 Floors'),
    balcony: b.balcony || (b.roomFeatures?.balcony ? 'Private Balcony' : 'No Balcony'),
    facing: b.details?.facing || b.facing || 'East Facing',
    images,

    // Amenities badge list
    amenities: b.amenities || [
      ...(b.roomFeatures?.ac ? [{ icon: 'ac_unit', label: 'AC' }] : []),
      ...(b.roomFeatures?.attachedBathroom ? [{ icon: 'bathtub', label: 'Attached Bath' }] : []),
      ...(b.buildingFacilities?.wifi ? [{ icon: 'wifi', label: 'High-Speed Wi-Fi' }] : []),
      ...(b.buildingFacilities?.powerBackup ? [{ icon: 'bolt', label: 'Power Backup' }] : []),
      ...(b.roomFeatures?.balcony ? [{ icon: 'balcony', label: 'Private Balcony' }] : []),
      ...(b.buildingFacilities?.housekeeping ? [{ icon: 'cleaning_services', label: 'Housekeeping' }] : [])
    ],

    // Categorized specifications
    amenityCategories: b.amenityCategories || {
      inRoom: [
        { icon: 'bed', name: b.details?.bedType || 'Comfort Bed', desc: '8-inch orthopaedic mattress' },
        ...(b.roomFeatures?.ac ? [{ icon: 'ac_unit', name: 'Air Conditioner', desc: 'Inverter Split AC' }] : []),
        ...(b.roomFeatures?.studyTable ? [{ icon: 'desk', name: 'Workstation', desc: 'Ergonomic desk and chair' }] : []),
        ...(b.roomFeatures?.tv ? [{ icon: 'tv', name: 'Smart TV', desc: 'Pre-installed OTT apps' }] : []),
        ...(b.roomFeatures?.wardrobe ? [{ icon: 'wardrobe', name: 'Wardrobe', desc: 'Spacious storage with lock' }] : []),
        ...(b.roomFeatures?.attachedBathroom ? [{ icon: 'shower', name: 'Attached Bath & Geyser', desc: '24hr instant hot water' }] : [])
      ],
      building: [
        ...(b.buildingFacilities?.lift ? [{ icon: 'elevator', name: 'High-Speed Lift', desc: 'Power backup elevator' }] : []),
        ...(b.buildingFacilities?.powerBackup ? [{ icon: 'bolt', name: '100% DG Power Backup', desc: 'Seamless switch for AC & Wi-Fi' }] : []),
        ...(b.buildingFacilities?.securityGuard || b.buildingFacilities?.cctv ? [{ icon: 'security', name: 'Security & CCTV', desc: '24x7 gated security' }] : []),
        ...(b.buildingFacilities?.wifi ? [{ icon: 'wifi', name: 'High-Speed Fiber Wi-Fi', desc: '300 Mbps unlimited connectivity' }] : []),
        ...(b.buildingFacilities?.bikeParking || b.buildingFacilities?.carParking ? [{ icon: 'local_parking', name: 'Dedicated Parking', desc: 'Covered spots' }] : []),
        ...(b.buildingFacilities?.laundry ? [{ icon: 'local_laundry_service', name: 'Laundry Area', desc: 'Front-load washing machines' }] : [])
      ],
      food: [
        {
          icon: 'restaurant',
          name: 'Meals & Food Service',
          desc: b.foodServices?.mealsIncluded && b.foodServices.mealsIncluded !== 'none'
            ? `Meals provided: ${b.foodServices.mealsIncluded}`
            : 'Self-cooking modular kitchen allowed'
        }
      ],
      rules: [
        { icon: 'schedule', name: 'Gate Curfew', desc: b.rules?.gateClosingTime || 'No gate curfew' },
        { icon: 'group', name: 'Guests Allowed', desc: b.rules?.visitorsAllowed ? 'Guests welcome' : 'Restricted' },
        { icon: 'pets', name: 'Pets', desc: b.rules?.petsAllowed ? 'Pets allowed' : 'No pets' }
      ]
    },

    distanceHighlights: b.distanceHighlights || (b.nearby && b.nearby.length > 0 ? b.nearby.map((n) => ({
      icon: n.type === 'metro' ? 'directions_subway' : n.type === 'market' ? 'store' : 'business_center',
      text: `${n.distanceKm}km to ${n.name}`,
      color: 'text-primary'
    })) : [
      { icon: 'directions_subway', text: '350m to nearest Metro / Bus stop', color: 'text-primary' },
      { icon: 'business_center', text: '10 min to major Tech Parks', color: 'text-secondary' }
    ]),

    host: b.host || (b.owner ? {
      name: b.owner.name || 'Verified Superhost',
      title: `${b.owner.verifiedOwner ? 'Verified Superhost' : 'Host'} • ${b.ratingAvg || 4.9}★`,
      avatar: b.owner.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      responseRate: b.owner.responseTimeAvg || 'Replies in 10 mins',
      verifiedBadge: 'Identity & Police Verified',
      phone: b.owner.phone || '+91 98765 43210',
      whatsapp: (b.owner.phone || '919876543210').replace(/[^0-9]/g, '')
    } : {
      name: 'Priya Sharma',
      title: 'Superhost • 4.9★',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      responseRate: '98% (Replies in 10 mins)',
      verifiedBadge: 'Identity & Police Verified',
      phone: '+91 98765 43210',
      whatsapp: '919876543210'
    }),

    reviews: b.reviews || []
  };
}
