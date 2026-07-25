const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Artifact } = require('../src/models');

describe('Artifacts API', () => {
  let curatorToken;
  let adminToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    await User.create({
      name: 'Curator',
      email: 'curator@adwa.museum',
      password: 'Demo@2026!',
      role: 'curator',
    });
    await User.create({
      name: 'Admin',
      email: 'admin@adwa.museum',
      password: 'Demo@2026!',
      role: 'admin',
    });

    const curatorLogin = await request(app).post('/api/auth/login').send({
      email: 'curator@adwa.museum',
      password: 'Demo@2026!',
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@adwa.museum',
      password: 'Demo@2026!',
    });

    curatorToken = curatorLogin.body.data.token;
    adminToken = adminLogin.body.data.token;
  });

  test('public QR lookup returns 404 for unknown code', async () => {
    const res = await request(app).get('/api/artifacts/qr/ART-UNKNOWN');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('curator can create and list artifacts', async () => {
    const create = await request(app)
      .post('/api/artifacts')
      .set('Authorization', `Bearer ${curatorToken}`)
      .field('name', 'Test Shield')
      .field('category', 'weapon')
      .field('location', 'Hall A')
      .field('condition_status', 'good');

    expect(create.status).toBe(201);
    expect(create.body.data.artifact.qr_code).toMatch(/^ART-/);
    expect(create.body.data.qr_data_url).toBeDefined();

    const list = await request(app)
      .get('/api/artifacts')
      .set('Authorization', `Bearer ${curatorToken}`);

    expect(list.status).toBe(200);
    expect(list.body.data.artifacts.length).toBeGreaterThan(0);
  });

  test('visitor role cannot list artifacts', async () => {
    await User.create({
      name: 'Visitor',
      email: 'visitor@test.com',
      password: 'Demo@2026!',
      role: 'visitor',
    });
    const login = await request(app).post('/api/auth/login').send({
      email: 'visitor@test.com',
      password: 'Demo@2026!',
    });

    const res = await request(app)
      .get('/api/artifacts')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(403);
  });

  test('admin can soft-delete artifact', async () => {
    const artifact = await Artifact.findOne();
    const res = await request(app)
      .delete(`/api/artifacts/${artifact.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const qr = await request(app).get(`/api/artifacts/qr/${artifact.qr_code}`);
    expect(qr.status).toBe(404);
  });
});
