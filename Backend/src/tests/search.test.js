const request = require('supertest');
const app = require('../app');
const Listing = require('../models/Listing');
const User = require('../models/User');
require('./setup');

describe('Listing Public Search & Dynamic Filters Tests', () => {
  beforeEach(async () => {
    // Create an owner
    const owner = await User.create({
      name: 'Host Priya',
      email: 'host@searchtest.in',
      passwordHash: 'hashed123',
      role: 'owner'
    });

    // Create 3 listings with distinct properties
    await Listing.create([
      {
        owner: owner._id,
        title: 'Modern Koramangala Studio',
        description: 'Cozy and spacious studio in central Koramangala with AC, Wi-Fi, and private attached washroom.',
        propertyType: 'studio',
        roomType: 'studio',
        status: 'published',
        location: {
          address: 'Koramangala 4th Block',
          area: 'Koramangala',
          city: 'Bengaluru',
          geo: { type: 'Point', coordinates: [77.6271, 12.9352] }
        },
        pricing: { monthlyRent: 16000, securityDeposit: 16000 },
        roomFeatures: { ac: true, attachedBathroom: true, wardrobe: true },
        buildingFacilities: { wifi: true, lift: true, powerBackup: true },
        rules: { genderPreference: 'any' }
      },
      {
        owner: owner._id,
        title: 'HSR Budget Twin Sharing PG',
        description: 'Clean double sharing room with food included in HSR Layout Sector 2.',
        propertyType: 'pg',
        roomType: 'double-sharing',
        status: 'published',
        location: {
          address: 'HSR Layout Sector 2',
          area: 'HSR Layout',
          city: 'Bengaluru',
          geo: { type: 'Point', coordinates: [77.6534, 12.9121] }
        },
        pricing: { monthlyRent: 9000, securityDeposit: 9000 },
        roomFeatures: { ac: false, attachedBathroom: true, wardrobe: true },
        buildingFacilities: { wifi: true, lift: false, powerBackup: true },
        foodServices: { mealsIncluded: 'veg' },
        rules: { genderPreference: 'boys' }
      },
      {
        owner: owner._id,
        title: 'Indiranagar Luxury 2BHK Apartment',
        description: 'Luxury 2BHK flat near 100ft road with lift, car parking, modular kitchen.',
        propertyType: 'flat',
        roomType: '2BHK',
        status: 'published',
        location: {
          address: '100ft Road, Indiranagar',
          area: 'Indiranagar',
          city: 'Bengaluru',
          geo: { type: 'Point', coordinates: [77.6412, 12.9719] }
        },
        pricing: { monthlyRent: 35000, securityDeposit: 70000 },
        roomFeatures: { ac: true, attachedBathroom: true, balcony: true },
        buildingFacilities: { wifi: true, lift: true, carParking: true, powerBackup: true },
        rules: { genderPreference: 'any' }
      }
    ]);
  });

  it('should search all published listings with pagination meta', async () => {
    const res = await request(app).get('/api/v1/listings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(3);
    expect(res.body.meta.total).toBe(3);
    expect(res.body.meta.totalPages).toBe(1);
  });

  it('should filter listings by area (Koramangala)', async () => {
    const res = await request(app).get('/api/v1/listings?area=Koramangala');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toContain('Koramangala');
  });

  it('should filter listings by price range (minPrice & maxPrice)', async () => {
    const res = await request(app).get('/api/v1/listings?minPrice=8000&maxPrice=12000');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].pricing.monthlyRent).toBe(9000);
  });

  it('should filter dynamically by multiple amenities (ac,lift)', async () => {
    const res = await request(app).get('/api/v1/listings?amenities=ac,lift');

    expect(res.status).toBe(200);
    // Both Studio and 2BHK have ac and lift; PG does not have AC or lift
    expect(res.body.data.length).toBe(2);
  });

  it('should filter by roomType (double-sharing)', async () => {
    const res = await request(app).get('/api/v1/listings?roomType=double-sharing');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].roomType).toBe('double-sharing');
  });
});
