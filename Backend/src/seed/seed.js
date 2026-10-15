const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = require('../config/env');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Enquiry = require('../models/Enquiry');
const Visit = require('../models/Visit');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const Location = require('../models/Location');

// Curated high quality room & interior images
const IMAGES = {
  studio1: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80'
  ],
  room1: [
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=80'
  ],
  flat1: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80'
  ],
  pg1: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop&q=80'
  ],
  hostel1: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80'
  ]
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB at:', env.MONGO_URI);
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected successfully for seeding.');

    // 1. Clean existing collections
    console.log('Purging existing data...');
    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Enquiry.deleteMany({}),
      Visit.deleteMany({}),
      Review.deleteMany({}),
      Wishlist.deleteMany({}),
      Notification.deleteMany({}),
      Location.deleteMany({})
    ]);

    // 2. Create Users
    console.log('Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const commonPasswordHash = await bcrypt.hash('Password123!', salt);

    const usersData = [
      {
        name: 'Super Admin',
        email: 'admin@roomrento.in',
        passwordHash: commonPasswordHash,
        role: 'admin',
        phone: '+91 99999 00000',
        city: 'Bengaluru',
        isVerified: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@host.in',
        passwordHash: commonPasswordHash,
        role: 'owner',
        phone: '+91 98765 43210',
        city: 'Bengaluru',
        bio: 'Superhost managing modern boutique co-living spaces and private studios in Koramangala & Indiranagar.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        verifiedOwner: true,
        responseTimeAvg: 'Replies in 10 mins'
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@host.in',
        passwordHash: commonPasswordHash,
        role: 'owner',
        phone: '+91 98765 43211',
        city: 'Bengaluru',
        bio: 'PG owner in HSR Layout and Bellandur offering hygienic home-cooked meals and high-speed Wi-Fi.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        verifiedOwner: true,
        responseTimeAvg: 'Replies in 15 mins'
      },
      {
        name: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@host.in',
        passwordHash: commonPasswordHash,
        role: 'owner',
        phone: '+91 98765 43212',
        city: 'Bengaluru',
        bio: 'Architect offering tastefully furnished 1BHK and 2BHK apartments near tech corridors.',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        verifiedOwner: true,
        responseTimeAvg: 'Replies within 1 hour'
      },
      {
        name: 'Vikram Reddy',
        email: 'vikram.reddy@host.in',
        passwordHash: commonPasswordHash,
        role: 'owner',
        phone: '+91 98765 43213',
        city: 'Hyderabad',
        bio: 'Owner of modern executive luxury coliving homes across Gachibowli and Hitec City.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        verifiedOwner: true,
        responseTimeAvg: 'Replies in 30 mins'
      },
      {
        name: 'Suresh Patel',
        email: 'suresh.patel@host.in',
        passwordHash: commonPasswordHash,
        role: 'owner',
        phone: '+91 98765 43214',
        city: 'Mumbai',
        bio: 'Premium studio apartments in Powai and Andheri with zero brokerage.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        verifiedOwner: true,
        responseTimeAvg: 'Replies within 2 hours'
      },
      // Tenants matching frontend mock data
      {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@techcorp.in',
        passwordHash: commonPasswordHash,
        role: 'tenant',
        phone: '+91 98123 45678',
        city: 'Bengaluru',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isVerified: true
      },
      {
        name: 'Meera Nair',
        email: 'meera.nair@swiggy.in',
        passwordHash: commonPasswordHash,
        role: 'tenant',
        phone: '+91 98123 45679',
        city: 'Bengaluru',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        isVerified: true
      },
      {
        name: 'Aditya Verma',
        email: 'aditya.verma@razorpay.in',
        passwordHash: commonPasswordHash,
        role: 'tenant',
        phone: '+91 98123 45680',
        city: 'Bengaluru',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
        isVerified: true
      },
      {
        name: 'Sneha Kulkarni',
        email: 'sneha.k@gmail.com',
        passwordHash: commonPasswordHash,
        role: 'tenant',
        phone: '+91 98123 45681',
        city: 'Pune',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        isVerified: true
      }
    ];

    const users = await User.insertMany(usersData);
    const priya = users.find((u) => u.email === 'priya.sharma@host.in');
    const rajesh = users.find((u) => u.email === 'rajesh.kumar@host.in');
    const ananya = users.find((u) => u.email === 'ananya.deshmukh@host.in');
    const vikram = users.find((u) => u.email === 'vikram.reddy@host.in');
    const suresh = users.find((u) => u.email === 'suresh.patel@host.in');
    const arjun = users.find((u) => u.email === 'arjun.mehta@techcorp.in');
    const meera = users.find((u) => u.email === 'meera.nair@swiggy.in');
    const aditya = users.find((u) => u.email === 'aditya.verma@razorpay.in');

    console.log(`Seeded ${users.length} users.`);

    // 3. Seed 32 Realistic Listings
    console.log('Seeding 32 realistic property listings...');

    const listingsData = [
      // 1. Urban Luxe Studio (Priya - Koramangala)
      {
        owner: priya._id,
        title: 'Urban Luxe Private Studio',
        subtitle: 'Private Studio with Balcony',
        description: 'Bright, designer studio apartment located on 80 Feet Road Koramangala. Equipped with workstation, smart TV, 300 Mbps Wi-Fi, 100% power backup, and kitchenette. Steps away from the finest cafes and tech hubs.',
        propertyType: 'studio',
        roomType: 'studio',
        status: 'published',
        isVerified: true,
        isFeatured: true,
        views: 1250,
        availableFrom: new Date(),
        details: { floorNumber: 3, totalFloors: 4, areaSqFt: 280, totalOccupants: 1, furnishing: 'furnished', bedType: 'Queen Bed', facing: 'East' },
        location: {
          address: '4th Block, 80 Feet Rd, Koramangala',
          area: 'Koramangala',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560034',
          landmark: 'Sony World Signal',
          distanceText: '400m from Sony World Signal',
          geo: { type: 'Point', coordinates: [77.6271, 12.9352] }
        },
        pricing: {
          monthlyRent: 16500,
          securityDeposit: 16500,
          brokerage: 0,
          maintenanceCharges: 0,
          electricity: 'metered',
          electricityRate: 9,
          offerTag: 'Zero Deposit Offer'
        },
        roomFeatures: { wardrobe: true, studyTable: true, ac: true, fan: true, attachedBathroom: true, geyser: true, balcony: true, window: true, tv: true, fridge: true, mattressIncluded: true },
        buildingFacilities: { wifi: true, powerBackup: true, lift: true, water24x7: true, bikeParking: true, carParking: true, cctv: true, securityGuard: true, laundry: true, terraceAccess: true, housekeeping: true },
        foodServices: { mealsIncluded: 'none', cookingAllowed: true, tiffinService: true, cleaningFrequency: 'daily' },
        rules: { genderPreference: 'any', bachelorsAllowed: true, couplesAllowed: true, petsAllowed: true, gateClosingTime: 'No curfew', noticePeriodDays: 30, minimumStayMonths: 3 },
        nearby: [
          { type: 'metro', name: 'Koramangala Metro', distanceKm: 0.35 },
          { type: 'market', name: 'Forum Mall', distanceKm: 1.2 },
          { type: 'office', name: 'Embassy GolfLinks', distanceKm: 3.5 }
        ],
        images: IMAGES.studio1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 4.9,
        walkScore: 92
      },
      // 2. Serene Heights 2-Sharing (Rajesh - HSR Layout)
      {
        owner: rajesh._id,
        title: 'Serene Heights Premium 2-Sharing',
        subtitle: 'Spacious Twin Sharing Room',
        description: 'Well-ventilated twin sharing room with ergonomic study tables, individual wardrobes, and attached bath. Daily housekeeping and wholesome breakfast/dinner included.',
        propertyType: 'pg',
        roomType: 'double-sharing',
        status: 'published',
        isVerified: true,
        isFeatured: true,
        views: 890,
        availableFrom: new Date(),
        details: { floorNumber: 2, totalFloors: 5, areaSqFt: 220, totalOccupants: 2, furnishing: 'furnished', bedType: 'Single Bed', facing: 'North' },
        location: {
          address: 'Sector 2, 27th Main Rd, HSR Layout',
          area: 'HSR Layout',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560102',
          landmark: 'Near NIFT',
          distanceText: '200m from NIFT Campus',
          geo: { type: 'Point', coordinates: [77.6534, 12.9121] }
        },
        pricing: {
          monthlyRent: 9500,
          securityDeposit: 9500,
          brokerage: 0,
          maintenanceCharges: 0,
          electricity: 'included',
          offerTag: 'Meals Included'
        },
        roomFeatures: { wardrobe: true, studyTable: true, ac: false, cooler: true, fan: true, attachedBathroom: true, geyser: true, balcony: false, window: true, mattressIncluded: true },
        buildingFacilities: { wifi: true, powerBackup: true, lift: true, water24x7: true, roDrinkingWater: true, bikeParking: true, cctv: true, securityGuard: true, laundry: true, housekeeping: true },
        foodServices: { mealsIncluded: 'veg', tiffinService: true, cookingAllowed: false, cleaningFrequency: 'daily' },
        rules: { genderPreference: 'boys', bachelorsAllowed: true, couplesAllowed: false, petsAllowed: false, gateClosingTime: '11:00 PM', noticePeriodDays: 30, minimumStayMonths: 1 },
        nearby: [
          { type: 'bus', name: 'HSR 27th Main Bus Stop', distanceKm: 0.1 },
          { type: 'college', name: 'NIFT Bengaluru', distanceKm: 0.2 },
          { type: 'gym', name: 'Cult.fit HSR', distanceKm: 0.4 }
        ],
        images: IMAGES.pg1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 4.8,
        walkScore: 88
      },
      // 3. Indiranagar Boutique 1BHK (Ananya - Indiranagar)
      {
        owner: ananya._id,
        title: 'Indiranagar Boutique 1BHK Apartment',
        subtitle: 'Architect Designed 1BHK',
        description: 'Stunning modern 1BHK flat off 100ft road. Hardwood accents, floor-to-ceiling glass balcony, modular kitchen with chimney, microwave, induction stove, and reserved car parking.',
        propertyType: 'flat',
        roomType: '1BHK',
        status: 'published',
        isVerified: true,
        isFeatured: true,
        views: 2100,
        availableFrom: new Date(),
        details: { floorNumber: 2, totalFloors: 3, areaSqFt: 550, totalOccupants: 2, furnishing: 'furnished', bedType: 'King Bed', facing: 'East' },
        location: {
          address: '12th Main, HAL 2nd Stage, Indiranagar',
          area: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          landmark: 'Opposite Corner House',
          distanceText: '300m from 100ft Road',
          geo: { type: 'Point', coordinates: [77.6412, 12.9719] }
        },
        pricing: {
          monthlyRent: 28000,
          securityDeposit: 50000,
          brokerage: 0,
          maintenanceCharges: 2000,
          electricity: 'metered',
          isNegotiable: true
        },
        roomFeatures: { wardrobe: true, studyTable: true, ac: true, fan: true, attachedBathroom: true, geyser: true, balcony: true, window: true, naturalLight: true, tv: true, fridge: true, mattressIncluded: true },
        buildingFacilities: { wifi: true, powerBackup: true, lift: true, water24x7: true, carParking: true, bikeParking: true, cctv: true, securityGuard: true, terraceAccess: true },
        foodServices: { mealsIncluded: 'none', cookingAllowed: true, cleaningFrequency: 'none' },
        rules: { genderPreference: 'any', bachelorsAllowed: true, couplesAllowed: true, petsAllowed: true, gateClosingTime: 'No curfew', noticePeriodDays: 30, minimumStayMonths: 6 },
        nearby: [
          { type: 'metro', name: 'Indiranagar Metro Station', distanceKm: 0.6 },
          { type: 'market', name: '100ft Road Cafes', distanceKm: 0.3 }
        ],
        images: IMAGES.flat1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 5.0,
        walkScore: 96
      },
      // 4. Whitefield Techie Single Room (Priya - Whitefield)
      {
        owner: priya._id,
        title: 'Whitefield Techie Single Private Room',
        subtitle: 'Fully Furnished Private Room',
        description: 'Cozy private room in a premium villa community near ITPL. AC, attached bath with geyser, high speed fiber optic Wi-Fi, and access to a shared clubhouse and gym.',
        propertyType: 'room',
        roomType: 'single',
        status: 'published',
        isVerified: true,
        isFeatured: false,
        views: 640,
        availableFrom: new Date(),
        details: { floorNumber: 1, totalFloors: 2, areaSqFt: 180, totalOccupants: 1, furnishing: 'furnished', bedType: 'Single Bed', facing: 'North' },
        location: {
          address: 'Pattandur Agrahara, Near ITPL Main Gate, Whitefield',
          area: 'Whitefield',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560066',
          landmark: 'Opp ITPL Gate 2',
          distanceText: '500m to ITPL',
          geo: { type: 'Point', coordinates: [77.7499, 12.9863] }
        },
        pricing: {
          monthlyRent: 11000,
          securityDeposit: 15000,
          brokerage: 0,
          maintenanceCharges: 500,
          electricity: 'metered'
        },
        roomFeatures: { wardrobe: true, studyTable: true, ac: true, fan: true, attachedBathroom: true, geyser: true, balcony: false, window: true, mattressIncluded: true },
        buildingFacilities: { wifi: true, powerBackup: true, water24x7: true, roDrinkingWater: true, bikeParking: true, cctv: true, gym: true, commonKitchen: true, laundry: true },
        foodServices: { mealsIncluded: 'none', cookingAllowed: true, tiffinService: true },
        rules: { genderPreference: 'any', bachelorsAllowed: true, couplesAllowed: false, petsAllowed: false, gateClosingTime: '11:30 PM' },
        nearby: [
          { type: 'metro', name: 'ITPL Metro Station', distanceKm: 0.4 },
          { type: 'office', name: 'International Tech Park (ITPL)', distanceKm: 0.5 }
        ],
        images: IMAGES.room1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 4.7,
        walkScore: 82
      },
      // 5. Bellandur Executive Girls PG (Rajesh - Bellandur)
      {
        owner: rajesh._id,
        title: 'Bellandur Executive Luxury Girls PG',
        subtitle: 'Twin Sharing & Single Rooms',
        description: 'Safe and secure women coliving residence located 5 mins from Ecospace. Features biometric entry, 24/7 CCTV, North and South Indian food, and daily housekeeping.',
        propertyType: 'pg',
        roomType: 'double-sharing',
        status: 'published',
        isVerified: true,
        isFeatured: true,
        views: 1420,
        availableFrom: new Date(),
        details: { floorNumber: 4, totalFloors: 5, areaSqFt: 210, totalOccupants: 2, furnishing: 'furnished', bedType: 'Single Bed', facing: 'South' },
        location: {
          address: 'Green Glen Layout, Bellandur',
          area: 'Bellandur',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          landmark: 'Behind Ecospace Tech Park',
          distanceText: '600m to Ecospace',
          geo: { type: 'Point', coordinates: [77.6784, 12.926] }
        },
        pricing: {
          monthlyRent: 12500,
          securityDeposit: 12500,
          brokerage: 0,
          maintenanceCharges: 0,
          electricity: 'included',
          offerTag: 'Free High Speed Wi-Fi'
        },
        roomFeatures: { wardrobe: true, studyTable: true, ac: true, fan: true, attachedBathroom: true, geyser: true, balcony: true, window: true, mattressIncluded: true },
        buildingFacilities: { wifi: true, powerBackup: true, lift: true, water24x7: true, roDrinkingWater: true, cctv: true, securityGuard: true, laundry: true, housekeeping: true, diningArea: true },
        foodServices: { mealsIncluded: 'both', cookingAllowed: false, cleaningFrequency: 'daily' },
        rules: { genderPreference: 'girls', bachelorsAllowed: true, couplesAllowed: false, petsAllowed: false, visitorsAllowed: true, gateClosingTime: '10:30 PM' },
        nearby: [
          { type: 'office', name: 'RMZ Ecospace', distanceKm: 0.6 },
          { type: 'market', name: 'Central Mall Bellandur', distanceKm: 1.1 }
        ],
        images: IMAGES.pg1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 5.0,
        walkScore: 90
      },
      // 6. Marathahalli Budget PG Triple Sharing (Rajesh)
      {
        owner: rajesh._id,
        title: 'Marathahalli Comfort 3-Sharing PG',
        subtitle: 'Budget Triple Sharing PG',
        description: 'Affordable triple sharing accommodation with 3 meals everyday, Wi-Fi, washing machine, and 24-hr water supply. Ideal for students and entry-level professionals.',
        propertyType: 'pg',
        roomType: 'triple-sharing',
        status: 'published',
        isVerified: true,
        isFeatured: false,
        views: 450,
        availableFrom: new Date(),
        details: { floorNumber: 1, totalFloors: 4, areaSqFt: 260, totalOccupants: 3, furnishing: 'furnished', bedType: 'Single Bed' },
        location: {
          address: 'Kalamandir Junction, Outer Ring Rd, Marathahalli',
          area: 'Marathahalli',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560037',
          landmark: 'Near Kalamandir',
          distanceText: '250m to Bus Terminus',
          geo: { type: 'Point', coordinates: [77.7011, 12.9569] }
        },
        pricing: {
          monthlyRent: 7500,
          securityDeposit: 7500,
          brokerage: 0,
          maintenanceCharges: 0,
          electricity: 'included'
        },
        roomFeatures: { wardrobe: true, fan: true, attachedBathroom: true, geyser: true, window: true, mattressIncluded: true },
        buildingFacilities: { wifi: true, powerBackup: true, water24x7: true, roDrinkingWater: true, bikeParking: true, cctv: true, laundry: true, diningArea: true },
        foodServices: { mealsIncluded: 'both', cleaningFrequency: 'daily' },
        rules: { genderPreference: 'boys', bachelorsAllowed: true, petsAllowed: false, gateClosingTime: '11:00 PM' },
        nearby: [
          { type: 'bus', name: 'Marathahalli Bridge Bus Stop', distanceKm: 0.3 }
        ],
        images: IMAGES.hostel1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 4.3,
        walkScore: 84
      },
      // 7. BTM Layout 1RK Studio Flat (Ananya)
      {
        owner: ananya._id,
        title: 'BTM 2nd Stage Compact 1RK Studio',
        subtitle: 'Fully Independent 1RK Flat',
        description: 'Independent 1RK studio unit with private balcony, separate kitchen slab, bathroom, and dedicated 2-wheeler parking. Walking distance to Udupi Garden.',
        propertyType: 'room',
        roomType: '1RK',
        status: 'published',
        isVerified: true,
        isFeatured: false,
        views: 710,
        availableFrom: new Date(),
        details: { floorNumber: 3, totalFloors: 4, areaSqFt: 220, totalOccupants: 1, furnishing: 'semi-furnished', bedType: 'Single Bed' },
        location: {
          address: '7th Main, BTM Layout 2nd Stage',
          area: 'BTM Layout',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560076',
          landmark: 'Near Udupi Garden Signal',
          distanceText: '300m to Udupi Garden',
          geo: { type: 'Point', coordinates: [77.6101, 12.9166] }
        },
        pricing: {
          monthlyRent: 10500,
          securityDeposit: 25000,
          brokerage: 0,
          maintenanceCharges: 500,
          electricity: 'metered'
        },
        roomFeatures: { wardrobe: true, fan: true, attachedBathroom: true, geyser: true, balcony: true, window: true },
        buildingFacilities: { water24x7: true, bikeParking: true, cctv: true, terraceAccess: true },
        foodServices: { mealsIncluded: 'none', cookingAllowed: true },
        rules: { genderPreference: 'any', bachelorsAllowed: true, couplesAllowed: true, petsAllowed: false, gateClosingTime: 'No curfew' },
        nearby: [
          { type: 'metro', name: 'Jayadeva Metro Station', distanceKm: 1.2 },
          { type: 'market', name: 'BTM Lake Park', distanceKm: 0.5 }
        ],
        images: IMAGES.room1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 4.6,
        walkScore: 89
      },
      // 8. Electronic City Phase 1 Coliving Studio (Priya)
      {
        owner: priya._id,
        title: 'Electronic City Phase 1 Modern Coliving',
        subtitle: 'Fully Managed Private Room',
        description: 'Ultra-modern room in a gated coliving community. High-speed 200 Mbps Wi-Fi, gym, gaming lounge, open terrace cinema, and cafeteria. 5 min walk to Infosys & Wipro gates.',
        propertyType: 'studio',
        roomType: 'studio',
        status: 'published',
        isVerified: true,
        isFeatured: true,
        views: 1680,
        availableFrom: new Date(),
        details: { floorNumber: 4, totalFloors: 6, areaSqFt: 240, totalOccupants: 1, furnishing: 'furnished', bedType: 'Queen Bed' },
        location: {
          address: 'Neeladri Rd, Electronic City Phase 1',
          area: 'Electronic City',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560100',
          landmark: 'Near Wipro Gate 5',
          distanceText: '500m to Infosys Campus',
          geo: { type: 'Point', coordinates: [77.6712, 12.8452] }
        },
        pricing: {
          monthlyRent: 14000,
          securityDeposit: 14000,
          brokerage: 0,
          maintenanceCharges: 0,
          electricity: 'included',
          offerTag: 'Zero Deposit'
        },
        roomFeatures: { wardrobe: true, studyTable: true, ac: true, fan: true, attachedBathroom: true, geyser: true, tv: true, fridge: true, mattressIncluded: true },
        buildingFacilities: { wifi: true, powerBackup: true, lift: true, water24x7: true, bikeParking: true, carParking: true, cctv: true, securityGuard: true, gym: true, commonLounge: true, laundry: true, housekeeping: true },
        foodServices: { mealsIncluded: 'veg', tiffinService: true, cookingAllowed: false, cleaningFrequency: 'daily' },
        rules: { genderPreference: 'any', bachelorsAllowed: true, couplesAllowed: true, petsAllowed: false, gateClosingTime: 'No curfew' },
        nearby: [
          { type: 'office', name: 'Infosys Main Campus', distanceKm: 0.5 },
          { type: 'office', name: 'Wipro Campus', distanceKm: 0.7 }
        ],
        images: IMAGES.studio1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 4.8,
        walkScore: 86
      },
      // 9. Koramangala 2BHK Luxury Flat (Ananya)
      {
        owner: ananya._id,
        title: 'Koramangala 5th Block Premium 2BHK',
        subtitle: 'Fully Furnished 2BHK Flat',
        description: 'Sunlit 2BHK with twin balconies overlooking green trees in 5th Block Koramangala. Master bedroom with ensuite bath, Italian modular kitchen, and smart lock security.',
        propertyType: 'flat',
        roomType: '2BHK',
        status: 'published',
        isVerified: true,
        isFeatured: true,
        views: 2900,
        availableFrom: new Date(),
        details: { floorNumber: 2, totalFloors: 4, areaSqFt: 1100, totalOccupants: 4, furnishing: 'furnished', bedType: 'Queen Bed' },
        location: {
          address: '5th Block, Near Jyoti Nivas College, Koramangala',
          area: 'Koramangala',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560095',
          landmark: 'Behind JNC',
          distanceText: '100m to Jyoti Nivas College',
          geo: { type: 'Point', coordinates: [77.6174, 12.9345] }
        },
        pricing: {
          monthlyRent: 42000,
          securityDeposit: 80000,
          brokerage: 0,
          maintenanceCharges: 3000,
          electricity: 'metered',
          isNegotiable: true
        },
        roomFeatures: { wardrobe: true, studyTable: true, ac: true, fan: true, attachedBathroom: true, geyser: true, balcony: true, window: true, tv: true, fridge: true, mattressIncluded: true },
        buildingFacilities: { wifi: true, powerBackup: true, lift: true, water24x7: true, carParking: true, bikeParking: true, cctv: true, securityGuard: true, terraceAccess: true },
        foodServices: { mealsIncluded: 'none', cookingAllowed: true, maidService: true },
        rules: { genderPreference: 'any', bachelorsAllowed: true, couplesAllowed: true, petsAllowed: true, gateClosingTime: 'No curfew' },
        nearby: [
          { type: 'college', name: 'Jyoti Nivas College', distanceKm: 0.1 },
          { type: 'market', name: 'Koramangala 5th Block Eateries', distanceKm: 0.2 }
        ],
        images: IMAGES.flat1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 5.0,
        walkScore: 98
      },
      // 10. Hyderabad Gachibowli Studio (Vikram)
      {
        owner: vikram._id,
        title: 'Gachibowli Executive Studio Suites',
        subtitle: 'Luxury Tech Studio',
        description: 'Contemporary studio apartment in the heart of Gachibowli Financial District. Features king size bed, dedicated desk, 500 Mbps connection, rooftop swimming pool, and gym.',
        propertyType: 'studio',
        roomType: 'studio',
        status: 'published',
        isVerified: true,
        isFeatured: true,
        views: 1540,
        availableFrom: new Date(),
        details: { floorNumber: 7, totalFloors: 12, areaSqFt: 350, totalOccupants: 2, furnishing: 'furnished', bedType: 'King Bed' },
        location: {
          address: 'Financial District, Gachibowli',
          area: 'Gachibowli',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500032',
          landmark: 'Near WaveRock SEZ',
          distanceText: '1 km from WaveRock',
          geo: { type: 'Point', coordinates: [78.3489, 17.44] }
        },
        pricing: {
          monthlyRent: 22000,
          securityDeposit: 22000,
          brokerage: 0,
          maintenanceCharges: 1500,
          electricity: 'metered',
          offerTag: 'Pool & Gym Access'
        },
        roomFeatures: { wardrobe: true, studyTable: true, ac: true, fan: true, attachedBathroom: true, geyser: true, balcony: true, window: true, tv: true, fridge: true, mattressIncluded: true },
        buildingFacilities: { wifi: true, powerBackup: true, lift: true, water24x7: true, carParking: true, bikeParking: true, cctv: true, securityGuard: true, gym: true, commonLounge: true, laundry: true, housekeeping: true },
        foodServices: { mealsIncluded: 'none', cookingAllowed: true, tiffinService: true },
        rules: { genderPreference: 'any', bachelorsAllowed: true, couplesAllowed: true, petsAllowed: false, gateClosingTime: 'No curfew' },
        nearby: [
          { type: 'office', name: 'WaveRock SEZ', distanceKm: 1.0 },
          { type: 'office', name: 'Amazon Hyderabad Campus', distanceKm: 1.8 }
        ],
        images: IMAGES.studio1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 4.9,
        walkScore: 85
      },
      // 11. Mumbai Powai Lake View Studio (Suresh)
      {
        owner: suresh._id,
        title: 'Powai Lakeview Designer Studio',
        subtitle: 'Boutique Studio near Hiranandani',
        description: 'Charming studio flat overlooking Powai lake. Fully equipped kitchen, silent inverter AC, plush mattress, and round the clock building security.',
        propertyType: 'studio',
        roomType: 'studio',
        status: 'published',
        isVerified: true,
        isFeatured: true,
        views: 2200,
        availableFrom: new Date(),
        details: { floorNumber: 9, totalFloors: 18, areaSqFt: 320, totalOccupants: 1, furnishing: 'furnished', bedType: 'Queen Bed' },
        location: {
          address: 'Central Ave, Hiranandani Gardens, Powai',
          area: 'Powai',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400076',
          landmark: 'Opp Galleria Shopping Mall',
          distanceText: '200m from Galleria',
          geo: { type: 'Point', coordinates: [72.9056, 19.1176] }
        },
        pricing: {
          monthlyRent: 34000,
          securityDeposit: 50000,
          brokerage: 0,
          maintenanceCharges: 2500,
          electricity: 'metered'
        },
        roomFeatures: { wardrobe: true, studyTable: true, ac: true, fan: true, attachedBathroom: true, geyser: true, balcony: true, window: true, tv: true, fridge: true, mattressIncluded: true },
        buildingFacilities: { wifi: true, powerBackup: true, lift: true, water24x7: true, carParking: true, bikeParking: true, cctv: true, securityGuard: true, gym: true },
        foodServices: { mealsIncluded: 'none', cookingAllowed: true },
        rules: { genderPreference: 'any', bachelorsAllowed: true, couplesAllowed: true, petsAllowed: false, gateClosingTime: 'No curfew' },
        nearby: [
          { type: 'college', name: 'IIT Bombay', distanceKm: 1.5 },
          { type: 'market', name: 'Galleria Mall', distanceKm: 0.2 }
        ],
        images: IMAGES.studio1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 5.0,
        walkScore: 94
      },
      // 12. Andheri East 1BHK Flat (Suresh)
      {
        owner: suresh._id,
        title: 'Andheri East Metro Connect 1BHK',
        subtitle: 'Modern 1BHK near WEH Metro',
        description: 'Convenient 1BHK flat 3 mins from Western Express Highway Metro. Fully furnished with modular kitchen, piped gas, washing machine, and sofa cum bed in living room.',
        propertyType: 'flat',
        roomType: '1BHK',
        status: 'published',
        isVerified: true,
        isFeatured: false,
        views: 1120,
        availableFrom: new Date(),
        details: { floorNumber: 5, totalFloors: 14, areaSqFt: 480, totalOccupants: 2, furnishing: 'furnished', bedType: 'Queen Bed' },
        location: {
          address: 'JB Nagar, Andheri Kurla Rd, Andheri East',
          area: 'Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400059',
          landmark: 'Near Chakala Metro Station',
          distanceText: '300m from Chakala Metro',
          geo: { type: 'Point', coordinates: [72.8697, 19.1136] }
        },
        pricing: {
          monthlyRent: 38000,
          securityDeposit: 75000,
          brokerage: 0,
          maintenanceCharges: 2000,
          electricity: 'metered'
        },
        roomFeatures: { wardrobe: true, studyTable: true, ac: true, fan: true, attachedBathroom: true, geyser: true, window: true, tv: true, fridge: true, mattressIncluded: true },
        buildingFacilities: { powerBackup: true, lift: true, water24x7: true, carParking: true, cctv: true, securityGuard: true },
        foodServices: { mealsIncluded: 'none', cookingAllowed: true },
        rules: { genderPreference: 'any', bachelorsAllowed: true, couplesAllowed: true, petsAllowed: false },
        nearby: [
          { type: 'metro', name: 'Chakala (J.B. Nagar) Metro', distanceKm: 0.3 },
          { type: 'office', name: 'MIDC Andheri', distanceKm: 1.2 }
        ],
        images: IMAGES.flat1.map((url, i) => ({ url, order: i, isCover: i === 0 })),
        safetyRating: 4.8,
        walkScore: 92
      }
    ];

    // Generate 20 additional realistic listings programmatically across diverse cities and localities
    const additionalLocalities = [
      { area: 'Koramangala', city: 'Bengaluru', lng: 77.62, lat: 12.93, state: 'Karnataka' },
      { area: 'Indiranagar', city: 'Bengaluru', lng: 77.64, lat: 12.97, state: 'Karnataka' },
      { area: 'HSR Layout', city: 'Bengaluru', lng: 77.65, lat: 12.91, state: 'Karnataka' },
      { area: 'Whitefield', city: 'Bengaluru', lng: 77.74, lat: 12.98, state: 'Karnataka' },
      { area: 'Bellandur', city: 'Bengaluru', lng: 77.67, lat: 12.92, state: 'Karnataka' },
      { area: 'Electronic City', city: 'Bengaluru', lng: 77.67, lat: 12.84, state: 'Karnataka' },
      { area: 'Hinjawadi', city: 'Pune', lng: 73.72, lat: 18.59, state: 'Maharashtra' },
      { area: 'Viman Nagar', city: 'Pune', lng: 73.91, lat: 18.56, state: 'Maharashtra' },
      { area: 'Kothrud', city: 'Pune', lng: 73.81, lat: 18.50, state: 'Maharashtra' },
      { area: 'Banjara Hills', city: 'Hyderabad', lng: 78.44, lat: 17.41, state: 'Telangana' },
      { area: 'Hitec City', city: 'Hyderabad', lng: 78.37, lat: 17.44, state: 'Telangana' },
      { area: 'Kondapur', city: 'Hyderabad', lng: 78.35, lat: 17.46, state: 'Telangana' },
      { area: 'Cyber City', city: 'Gurgaon', lng: 77.08, lat: 28.49, state: 'Haryana' },
      { area: 'Sector 56', city: 'Gurgaon', lng: 77.10, lat: 28.42, state: 'Haryana' },
      { area: 'Koramangala', city: 'Bengaluru', lng: 77.63, lat: 12.93, state: 'Karnataka' },
      { area: 'HSR Layout', city: 'Bengaluru', lng: 77.64, lat: 12.90, state: 'Karnataka' },
      { area: 'Powai', city: 'Mumbai', lng: 72.90, lat: 19.12, state: 'Maharashtra' },
      { area: 'Bandra West', city: 'Mumbai', lng: 72.83, lat: 19.05, state: 'Maharashtra' },
      { area: 'Indiranagar', city: 'Bengaluru', lng: 77.63, lat: 12.96, state: 'Karnataka' },
      { area: 'Whitefield', city: 'Bengaluru', lng: 77.72, lat: 12.97, state: 'Karnataka' }
    ];

    const propTypes = ['room', 'pg', 'flat', 'hostel', 'studio'];
    const roomTypes = ['single', 'double-sharing', 'triple-sharing', '1RK', '1BHK', '2BHK', 'studio'];
    const ownersList = [priya, rajesh, ananya, vikram, suresh];

    for (let i = 0; i < 20; i++) {
      const loc = additionalLocalities[i];
      const pType = propTypes[i % propTypes.length];
      const rType = roomTypes[i % roomTypes.length];
      const owner = ownersList[i % ownersList.length];
      const rent = 8000 + (i * 1500);

      listingsData.push({
        owner: owner._id,
        title: `${loc.area} Deluxe ${rType.toUpperCase()} ${pType.toUpperCase()}`,
        subtitle: `Furnished ${rType} in prime ${loc.area}`,
        description: `Premium ${pType} offering comfortable living, modern furnishings, 24x7 power backup, high speed internet, and excellent connectivity to major business parks.`,
        propertyType: pType,
        roomType: rType,
        status: 'published',
        isVerified: i % 2 === 0,
        isFeatured: i % 4 === 0,
        views: 200 + i * 45,
        availableFrom: new Date(),
        details: {
          floorNumber: (i % 5) + 1,
          totalFloors: 5,
          areaSqFt: 180 + i * 20,
          totalOccupants: rType.includes('double') ? 2 : rType.includes('triple') ? 3 : 1,
          furnishing: i % 3 === 0 ? 'semi-furnished' : 'furnished',
          bedType: 'Single Bed'
        },
        location: {
          address: `Road No. ${(i % 10) + 1}, ${loc.area}`,
          area: loc.area,
          city: loc.city,
          state: loc.state,
          pincode: '560001',
          landmark: `Near ${loc.area} Bus Stop`,
          distanceText: `450m from main junction`,
          geo: { type: 'Point', coordinates: [loc.lng + (Math.random() - 0.5) * 0.02, loc.lat + (Math.random() - 0.5) * 0.02] }
        },
        pricing: {
          monthlyRent: rent,
          securityDeposit: rent,
          brokerage: 0,
          maintenanceCharges: 500,
          electricity: i % 2 === 0 ? 'included' : 'metered',
          offerTag: i % 3 === 0 ? 'Zero Brokerage' : ''
        },
        roomFeatures: {
          wardrobe: true,
          studyTable: i % 2 === 0,
          ac: i % 2 === 0,
          cooler: i % 2 !== 0,
          fan: true,
          attachedBathroom: true,
          geyser: true,
          balcony: i % 3 === 0,
          window: true,
          tv: i % 3 === 0,
          mattressIncluded: true
        },
        buildingFacilities: {
          wifi: true,
          powerBackup: true,
          lift: i % 2 === 0,
          water24x7: true,
          bikeParking: true,
          carParking: i % 3 === 0,
          cctv: true,
          securityGuard: true,
          laundry: true,
          housekeeping: true
        },
        foodServices: {
          mealsIncluded: pType === 'pg' || pType === 'hostel' ? 'veg' : 'none',
          cookingAllowed: pType !== 'pg',
          tiffinService: true
        },
        rules: {
          genderPreference: i % 4 === 1 ? 'girls' : i % 4 === 2 ? 'boys' : 'any',
          bachelorsAllowed: true,
          couplesAllowed: pType !== 'pg' && pType !== 'hostel',
          petsAllowed: i % 5 === 0,
          gateClosingTime: pType === 'pg' ? '11:00 PM' : 'No curfew'
        },
        nearby: [
          { type: 'bus', name: `${loc.area} Bus Depot`, distanceKm: 0.3 },
          { type: 'market', name: 'Supermarket', distanceKm: 0.2 }
        ],
        images: (i % 2 === 0 ? IMAGES.room1 : IMAGES.pg1).map((url, idx) => ({ url, order: idx, isCover: idx === 0 })),
        safetyRating: 4.5,
        walkScore: 85
      });
    }

    listingsData.forEach((item) => {
      const baseSlug = slugify(item.title, { lower: true, strict: true, trim: true });
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      item.slug = `${baseSlug}-${randomSuffix}`;
    });

    const createdListings = await Listing.insertMany(listingsData);
    console.log(`Created ${createdListings.length} listings in MongoDB.`);

    // 4. Seed Reviews & Compute Aggregates
    console.log('Seeding reviews...');
    const reviewsData = [
      {
        listing: createdListings[0]._id, // Urban Luxe Studio
        user: aditya._id,
        rating: 5,
        cleanliness: 5,
        safety: 5,
        valueForMoney: 5,
        ownerBehaviour: 5,
        comment: 'Lived here for 6 months. High speed Wi-Fi never dropped during heavy meetings, power backup is instant. Super convenient location right near 80ft road cafes!',
        helpfulCount: 14
      },
      {
        listing: createdListings[0]._id,
        user: meera._id,
        rating: 5,
        cleanliness: 5,
        safety: 5,
        valueForMoney: 4,
        ownerBehaviour: 5,
        comment: 'Priya is an incredible superhost! Clean, safe studio with an amazing balcony and daily housekeeping. Highly recommended for working professionals.',
        helpfulCount: 8
      },
      {
        listing: createdListings[1]._id, // Serene Heights PG
        user: arjun._id,
        rating: 4,
        cleanliness: 4,
        safety: 5,
        valueForMoney: 5,
        ownerBehaviour: 4,
        comment: 'Great value for money twin sharing room in HSR. The food is hygienic and home-cooked, Wi-Fi speed is reliable, and no electricity hassles.',
        helpfulCount: 5
      },
      {
        listing: createdListings[2]._id, // Indiranagar 1BHK
        user: aditya._id,
        rating: 5,
        cleanliness: 5,
        safety: 5,
        valueForMoney: 5,
        ownerBehaviour: 5,
        comment: 'One of the best apartments in Indiranagar! Beautifully designed, modern amenities, peaceful neighborhood yet 5 mins from all top dining spots.',
        helpfulCount: 12
      }
    ];

    for (const rev of reviewsData) {
      await Review.create(rev);
    }
    console.log('Reviews seeded and listing aggregates recalculated.');

    // 5. Seed Enquiries matching frontend mock data
    console.log('Seeding enquiries...');
    await Enquiry.insertMany([
      {
        listing: createdListings[0]._id,
        tenant: arjun._id,
        owner: priya._id,
        message: 'Hi Priya, I saw the Urban Luxe Studio listing. Is it available for immediate move-in from this weekend?',
        phone: '+91 98123 45678',
        preferredContact: 'whatsapp',
        status: 'contacted'
      },
      {
        listing: createdListings[1]._id,
        tenant: arjun._id,
        owner: rajesh._id,
        message: 'Hello Rajesh, what are the food timings on weekdays? Also is there a cot available near the balcony?',
        phone: '+91 98123 45678',
        preferredContact: 'call',
        status: 'new'
      }
    ]);

    // 6. Seed Scheduled Visits
    console.log('Seeding visits...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(16, 0, 0, 0);

    await Visit.insertMany([
      {
        listing: createdListings[0]._id,
        tenant: arjun._id,
        owner: priya._id,
        scheduledAt: tomorrow,
        status: 'confirmed',
        note: 'Meeting at Sony World Signal building gate.'
      }
    ]);

    // 7. Seed Wishlist
    console.log('Seeding wishlists...');
    await Wishlist.insertMany([
      { user: arjun._id, listing: createdListings[0]._id },
      { user: arjun._id, listing: createdListings[1]._id },
      { user: arjun._id, listing: createdListings[2]._id }
    ]);
    await Listing.findByIdAndUpdate(createdListings[0]._id, { $inc: { wishlistCount: 1 } });
    await Listing.findByIdAndUpdate(createdListings[1]._id, { $inc: { wishlistCount: 1 } });
    await Listing.findByIdAndUpdate(createdListings[2]._id, { $inc: { wishlistCount: 1 } });

    // 8. Seed Popular Location documents
    console.log('Seeding popular location nodes...');
    await Location.insertMany([
      { city: 'Bengaluru', area: 'Koramangala', state: 'Karnataka', coordinates: [77.6271, 12.9352], isPopular: true, listingCount: 8 },
      { city: 'Bengaluru', area: 'Indiranagar', state: 'Karnataka', coordinates: [77.6412, 12.9719], isPopular: true, listingCount: 6 },
      { city: 'Bengaluru', area: 'HSR Layout', state: 'Karnataka', coordinates: [77.6534, 12.9121], isPopular: true, listingCount: 7 },
      { city: 'Bengaluru', area: 'Whitefield', state: 'Karnataka', coordinates: [77.7499, 12.9863], isPopular: true, listingCount: 5 },
      { city: 'Hyderabad', area: 'Gachibowli', state: 'Telangana', coordinates: [78.3489, 17.44], isPopular: true, listingCount: 4 },
      { city: 'Mumbai', area: 'Powai', state: 'Maharashtra', coordinates: [72.9056, 19.1176], isPopular: true, listingCount: 3 }
    ]);

    console.log('=======================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(` Created 10 Users`);
    console.log(` Created ${createdListings.length} Realistic Listings`);
    console.log(` Created Reviews, Enquiries, Visits & Wishlists`);
    console.log(' Default Login Credentials:');
    console.log(' Tenant: arjun.mehta@techcorp.in / Password123!');
    console.log(' Owner : priya.sharma@host.in     / Password123!');
    console.log(' Admin : admin@roomrento.in       / Password123!');
    console.log('=======================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error);
    process.exit(1);
  }
};

seedDatabase();
