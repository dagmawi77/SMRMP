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

  test('POST /api/auth/register creates a visitor account', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Abebe',
      lastName: 'Kebede',
      gender: 'male',
      dateOfBirth: '1995-06-15',
      nationality: 'ethiopian',
      nationalId: 'ET1234567',
      email: 'abebe.visitor@example.com',
      mobilePhone: '+251911000111',
      password: 'Visitor@2026!',
      confirmPassword: 'Visitor@2026!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('visitor');
    expect(res.body.data.user.email).toBe('abebe.visitor@example.com');

    const login = await request(app).post('/api/auth/login').send({
      email: 'abebe.visitor@example.com',
      password: 'Visitor@2026!',
    });
    expect(login.status).toBe(200);
    expect(login.body.data.user.role).toBe('visitor');
  });

  test('POST /api/auth/register rejects duplicate email', async () => {
    const payload = {
      firstName: 'Sara',
      lastName: 'Tesfaye',
      gender: 'female',
      dateOfBirth: '1998-01-20',
      nationality: 'ethiopian',
      nationalId: 'ET7654321',
      email: TEST_EMAIL,
      mobilePhone: '+251922000222',
      password: 'Visitor@2026!',
      confirmPassword: 'Visitor@2026!',
    };

    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(409);
    expect(res.body.errors?.code).toBe('DUPLICATE_EMAIL');
  });

  test('POST /api/auth/register rejects weak passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Weak',
      lastName: 'Pass',
      gender: 'other',
      dateOfBirth: '2000-01-01',
      nationality: 'other',
      nationalId: 'ID99999',
      email: 'weak@example.com',
      mobilePhone: '+251933000333',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
