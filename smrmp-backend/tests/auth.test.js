const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

describe('Auth API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await User.create({
      name: 'Test Admin',
      email: 'admin@adwa.museum',
      password: 'Demo@2026!',
      role: 'admin',
    });
  });

  test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@adwa.museum',
      password: 'Demo@2026!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
  });

  test('POST /api/auth/login rejects invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@adwa.museum',
      password: 'wrongpass',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me requires authentication', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me returns user with token', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: 'admin@adwa.museum',
      password: 'Demo@2026!',
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('admin@adwa.museum');
  });
});
