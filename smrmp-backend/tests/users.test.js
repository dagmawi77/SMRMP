jest.mock('../src/config/supabase');

const request = require('supertest');
const {
  registerAuthUser,
  resetAuthMock,
} = require('../src/config/supabase');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

const ADMIN_ID = '11111111-1111-1111-1111-111111111111';
const ADMIN_EMAIL = 'admin@smrmp.dev';
const ADMIN_PASS = 'Demo@2026!';

const CURATOR_ID = '22222222-2222-2222-2222-222222222222';
const CURATOR_EMAIL = 'curator@smrmp.dev';
const CURATOR_PASS = 'Demo@2026!';

describe('User Management API (/api/users)', () => {
  let adminToken = '';
  let curatorToken = '';

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    await User.create({
      id: ADMIN_ID,
      name: 'Super Admin',
      email: ADMIN_EMAIL,
      role: 'admin',
      is_active: true,
    });

    await User.create({
      id: CURATOR_ID,
      name: 'Test Curator',
      email: CURATOR_EMAIL,
      role: 'curator',
      is_active: true,
    });
  });

  beforeEach(async () => {
    resetAuthMock();

    registerAuthUser({
      id: ADMIN_ID,
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
    });

    registerAuthUser({
      id: CURATOR_ID,
      email: CURATOR_EMAIL,
      password: CURATOR_PASS,
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
    });
    adminToken = adminLogin.body.data.token;

    const curatorLogin = await request(app).post('/api/auth/login').send({
      email: CURATOR_EMAIL,
      password: CURATOR_PASS,
    });
    curatorToken = curatorLogin.body.data.token;
  });

  test('GET /api/users requires authentication', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  test('GET /api/users rejects non-admin staff (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${curatorToken}`);
    expect(res.status).toBe(403);
  });

  test('GET /api/users succeeds for admin', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.data.users.length).toBeGreaterThanOrEqual(2);
  });

  test('POST /api/users creates a new staff user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Conservator',
        email: 'conservator@smrmp.dev',
        role: 'conservation',
        password: 'Pass@123456',
        phone: '+251911998877',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('conservation');
    expect(res.body.data.user.email).toBe('conservator@smrmp.dev');
  });

  test('POST /api/users rejects visitor role creation', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Illegal Visitor',
        email: 'visitor.illegal@smrmp.dev',
        role: 'visitor',
        password: 'Pass@123456',
      });

    expect(res.status).toBe(400);
  });

  test('PUT /api/users/:id updates user details', async () => {
    const res = await request(app)
      .put(`/api/users/${CURATOR_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Curator Name',
        phone: '+251922112233',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Updated Curator Name');
  });

  test('PATCH /api/users/:id/status toggles account status', async () => {
    const toggleRes = await request(app)
      .patch(`/api/users/${CURATOR_ID}/status`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.data.user.status).toBe('inactive');
  });

  test('DELETE /api/users/:id removes user account', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Temporary User',
        email: 'temp.user@smrmp.dev',
        role: 'researcher',
        password: 'Pass@123456',
      });

    const tempId = createRes.body.data.user.id;

    const delRes = await request(app)
      .delete(`/api/users/${tempId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });
});
