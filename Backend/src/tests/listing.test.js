const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Listing CRUD Integration Tests', () => {
  let ownerToken;
  let tenantToken;

  beforeEach(async () => {
    // Create Owner
    const ownerRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Host Priya',
      email: 'host.priya@example.com',
      password: 'Password123!',
      role: 'owner'
    });
    ownerToken = ownerRes.body.data.accessToken;

    // Create Tenant
    const tenantRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Tenant Arjun',
      email: 'tenant.arjun@example.com',
      password: 'Password123!',
      role: 'tenant'
    });
    tenantToken = tenantRes.body.data.accessToken;
  });

  const validListingPayload = {
    title: 'Sunny Studio Koramangala 4th Block',
    description: 'Beautiful modern studio with fast wifi and attached washroom for rent.',
    propertyType: 'studio',
    roomType: 'studio',
    location: {
      address: '80ft Road, 4th Block',
      area: 'Koramangala',
      city: 'Bengaluru',
      geo: {
        type: 'Point',
        coordinates: [77.6271, 12.9352]
      }
    },
    pricing: {
      monthlyRent: 15000,
      securityDeposit: 15000
    },
    roomFeatures: {
      ac: true,
      attachedBathroom: true
    },
    buildingFacilities: {
      wifi: true,
      lift: true
    }
  };

  it('should allow owner to create a new property listing', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(validListingPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(validListingPayload.title);
    expect(res.body.data.slug).toBeDefined();
  });

  it('should prevent tenant from creating a listing (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send(validListingPayload);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow owner to autosave a partial draft', async () => {
    const draftPayload = {
      title: 'In-progress draft property',
      propertyType: 'pg',
      location: {
        area: 'HSR Layout',
        city: 'Bengaluru'
      }
    };

    const res = await request(app)
      .post('/api/v1/listings/draft')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(draftPayload);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('draft');
  });

  it('should update listing details and soft delete', async () => {
    const createRes = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(validListingPayload);

    const listingId = createRes.body.data._id;

    // Update
    const updateRes = await request(app)
      .put(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Updated Title Koramangala Studio' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('Updated Title Koramangala Studio');

    // Delete (Soft)
    const deleteRes = await request(app)
      .delete(`/api/v1/listings/${listingId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(deleteRes.status).toBe(200);

    // Verify it is not returned in public search
    const searchRes = await request(app).get('/api/v1/listings');
    expect(searchRes.body.data.length).toBe(0);
  });
});
