jest.mock('../src/config/supabase');

const request = require('supertest');
const {
  registerAuthUser,
  resetAuthMock,
} = require('../src/config/supabase');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
const TEST_EMAIL = 'admin@smrmp.dev';
const TEST_PASSWORD = 'Demo@2026!';

describe('Auth API (Supabase Auth)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await User.create({
      id: TEST_USER_ID,
      name: 'Test Admin',
      email: TEST_EMAIL,
      password: null,
      role: 'admin',
    });
  });

  beforeEach(() => {
    resetAuthMock();
    registerAuthUser({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
  });

  test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe(`tok-${TEST_USER_ID}`);
    expect(res.body.data.user.role).toBe('admin');
  });

  test('POST /api/auth/login rejects invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: 'wrongpass',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me requires authentication', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me returns user with Supabase token', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
  });

  test('GET /api/auth/me rejects invalid Supabase token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });
});
