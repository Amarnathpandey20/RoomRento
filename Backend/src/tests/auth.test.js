const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Auth API Integration Tests', () => {
  const testUser = {
    name: 'Test Tenant',
    email: 'test.tenant@example.com',
    password: 'Password123!',
    phone: '+91 98765 00000',
    role: 'tenant',
    city: 'Bengaluru'
  };

  it('should register a new user successfully and return tokens', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should prevent duplicate registration with the same email', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate user and return tokens on login', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fetch user profile with GET /auth/me when authenticated', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const token = registerRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(testUser.email);
    expect(res.body.data.savedCount).toBeDefined();
  });
});
