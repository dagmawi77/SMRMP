const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Artifact, Exhibition, Ticket } = require('../src/models');

describe('Dashboard API — Phase 2', () => {
  let curatorToken;
  let visitorToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    await User.create({
      name: 'Curator',
      email: 'curator@adwa.museum',
      password: 'Demo@2026!',
      role: 'curator',
    });
    await User.create({
      name: 'Visitor',
      email: 'visitor@test.com',
      password: 'Demo@2026!',
      role: 'visitor',
    });

    await Artifact.bulkCreate([
      {
        name: 'Shield',
        category: 'weapon',
        location: 'Hall A',
        qr_code: 'ART-DASH001',
        condition_status: 'good',
      },
      {
        name: 'Cloth',
        category: 'textile',
        location: 'Hall B',
        qr_code: 'ART-DASH002',
        condition_status: 'critical',
      },
    ]);

    await Exhibition.create({
      name: 'Voices of Adwa',
      status: 'active',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
    });

    await Ticket.create({
      qr_ticket_code: 'TKT-DASH001',
      ticket_type: 'adult',
      quantity: 1,
      unit_price: 100,
      total_amount: 100,
      visitor_name: 'Test Visitor',
      visitor_phone: '+251911000000',
      visit_date: new Date().toISOString().slice(0, 10),
      payment_method: 'telebirr',
      payment_status: 'completed',
      status: 'valid',
    });

    const curatorLogin = await request(app).post('/api/auth/login').send({
      email: 'curator@adwa.museum',
      password: 'Demo@2026!',
    });
    const visitorLogin = await request(app).post('/api/auth/login').send({
      email: 'visitor@test.com',
      password: 'Demo@2026!',
    });

    curatorToken = curatorLogin.body.data.token;
    visitorToken = visitorLogin.body.data.token;
  });

  test('GET /api/dashboard/stats returns Section 4 stats shape', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${curatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats).toMatchObject({
      total_artifacts: 2,
      active_exhibitions: 1,
      conservation_alerts: 1,
      visitors_today: 1,
      tickets_sold_this_month: 1,
    });
    expect(res.body.data.recent_artifacts.length).toBeLessThanOrEqual(5);
  });

  test('GET /api/dashboard/charts returns categories, conservation, visitor_trend', async () => {
    const res = await request(app)
      .get('/api/dashboard/charts')
      .set('Authorization', `Bearer ${curatorToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
    expect(Array.isArray(res.body.data.conservation_status)).toBe(true);
    expect(Array.isArray(res.body.data.visitor_trend)).toBe(true);
    expect(typeof res.body.data.categories[0].count).toBe('number');
  });

  test('dashboard rejects visitor role (Curator+ only)', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${visitorToken}`);
    expect(res.status).toBe(403);
  });

  test('dashboard requires authentication', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(401);
  });
});
