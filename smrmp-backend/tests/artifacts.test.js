jest.mock('../src/config/supabase');

const request = require('supertest');
const {
  registerAuthUser,
  resetAuthMock,
} = require('../src/config/supabase');
const app = require('../src/app');
const { User, Artifact } = require('../src/models');
const { resetDbWithRbac } = require('./helpers/db');

describe('Artifacts API', () => {
  let curatorToken;
  let adminToken;

  beforeAll(async () => {
    const roles = await resetDbWithRbac();
    resetAuthMock();

    const curator = await User.create({
      name: 'Curator',
      email: 'curator@smrmp.dev',
      password: null,
      role: 'curator',
      role_id: roles.curator.id,
    });
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@smrmp.dev',
      password: null,
      role: 'admin',
      role_id: roles.admin.id,
    });

    registerAuthUser({
      id: curator.id,
      email: curator.email,
      password: 'Demo@2026!',
    });
    registerAuthUser({
      id: admin.id,
      email: admin.email,
      password: 'Demo@2026!',
    });

    const curatorLogin = await request(app).post('/api/auth/login').send({
      email: 'curator@smrmp.dev',
      password: 'Demo@2026!',
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@smrmp.dev',
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

  test('public QR lookup returns visitor details without staff-only fields', async () => {
    const create = await request(app)
      .post('/api/artifacts')
      .set('Authorization', `Bearer ${curatorToken}`)
      .field('name', 'Emperor Menelik War Drum')
      .field('category', 'ceremonial')
      .field('location', 'Gallery 2')
      .field('historical_period', '19th Century')
      .field('origin', 'Shewa, Ethiopia')
      .field('materials', 'Wood, hide')
      .field('description', 'A ceremonial drum carried at Adwa.')
      .field('amharic_description', 'በአድዋ ጦርነት የተያዘ ከበሮ።')
      .field('video_url', 'https://www.youtube.com/watch?v=abc123')
      .field('staff_notes', 'Stored in vault B, handle with gloves.')
      .field('keywords', 'adwa,ceremonial');

    expect(create.status).toBe(201);
    const { qr_code: qrCode } = create.body.data.artifact;

    // No Authorization header — this must work for an anonymous visitor.
    const res = await request(app).get(`/api/artifacts/qr/${qrCode}`);

    expect(res.status).toBe(200);
    const { artifact } = res.body.data;

    expect(artifact).toMatchObject({
      name: 'Emperor Menelik War Drum',
      category: 'ceremonial',
      historical_period: '19th Century',
      origin: 'Shewa, Ethiopia',
      materials: 'Wood, hide',
      description: 'A ceremonial drum carried at Adwa.',
      amharic_description: 'በአድዋ ጦርነት የተያዘ ከበሮ።',
      video_url: 'https://www.youtube.com/watch?v=abc123',
      location: 'Gallery 2',
      qr_code: qrCode,
    });
    expect(artifact.keywords).toEqual(['adwa', 'ceremonial']);
    expect(Array.isArray(artifact.images)).toBe(true);
    expect(Array.isArray(artifact.exhibitions)).toBe(true);
    expect(res.body.data.qr_data_url).toMatch(/^data:image\/png;base64,/);

    for (const internalField of [
      'staff_notes',
      'ai_description',
      'description_source',
      'created_by',
      'last_edited_by',
      'deleted_at',
    ]) {
      expect(artifact).not.toHaveProperty(internalField);
    }
  });

  test('public QR lookup accepts a lowercase code', async () => {
    const artifact = await Artifact.findOne({ where: { name: 'Emperor Menelik War Drum' } });

    const res = await request(app).get(
      `/api/artifacts/qr/${artifact.qr_code.toLowerCase()}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.artifact.qr_code).toBe(artifact.qr_code);
  });

  test('visitor role cannot list artifacts', async () => {
    const visitor = await User.create({
      name: 'Visitor',
      email: 'visitor@test.com',
      password: null,
      role: 'visitor',
    });
    registerAuthUser({
      id: visitor.id,
      email: visitor.email,
      password: 'Demo@2026!',
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
