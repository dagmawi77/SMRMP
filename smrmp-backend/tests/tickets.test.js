jest.mock('../src/config/supabase');

const request = require('supertest');
const {
  registerAuthUser,
  resetAuthMock,
} = require('../src/config/supabase');
const app = require('../src/app');
const { sequelize, User, TicketType } = require('../src/models');

describe('Phase 3 — Tickets + Payments (complete)', () => {
  let staffToken;
  let visitorToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    resetAuthMock();

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@adwa.museum',
      password: null,
      role: 'admin',
    });
    const visitor = await User.create({
      name: 'Visitor',
      email: 'visitor@test.com',
      password: null,
      role: 'visitor',
    });

    registerAuthUser({
      id: admin.id,
      email: 'admin@adwa.museum',
      password: 'Demo@2026!',
    });
    registerAuthUser({
      id: visitor.id,
      email: 'visitor@test.com',
      password: 'Demo@2026!',
    });

    await TicketType.bulkCreate([
      {
        type: 'adult',
        label: 'Adult',
        price_etb: 100,
        description: 'Standard adult admission',
        is_active: true,
      },
      {
        type: 'student',
        label: 'Student',
        price_etb: 50,
        description: 'Student admission',
        is_active: true,
      },
      {
        type: 'group',
        label: 'Group',
        price_etb: 80,
        description: 'Per person group rate',
        is_active: true,
      },
    ]);

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@adwa.museum',
      password: 'Demo@2026!',
    });
    const visitorLogin = await request(app).post('/api/auth/login').send({
      email: 'visitor@test.com',
      password: 'Demo@2026!',
    });
    staffToken = adminLogin.body.data.token;
    visitorToken = visitorLogin.body.data.token;
  });

  // BE-TKT-001 list (catalog)
  test('GET /api/tickets/types lists active catalog (public)', async () => {
    const res = await request(app).get('/api/tickets/types');
    expect(res.status).toBe(200);
    expect(res.body.data.ticket_types).toHaveLength(3);
    expect(res.body.data.ticket_types[0]).toEqual(
      expect.objectContaining({
        type: expect.any(String),
        label: expect.any(String),
        price_etb: expect.any(Number),
      })
    );
  });

  // BE-TKT-001 list (purchased tickets — staff)
  test('GET /api/tickets lists purchases for staff', async () => {
    await request(app).post('/api/tickets/purchase').send({
      ticket_type: 'adult',
      visitor_name: 'List User',
      visitor_phone: '+251911111111',
      quantity: 1,
      payment_method: 'telebirr',
      visit_date: '2026-07-26',
    });

    const res = await request(app)
      .get('/api/tickets?page=1&limit=10')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.tickets.length).toBeGreaterThan(0);
    expect(res.body.data.pagination).toBeDefined();
  });

  test('GET /api/tickets rejects visitor role', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${visitorToken}`);
    expect(res.status).toBe(403);
  });

  // BE-TKT-001 purchase + BE-TKT-002 QR + BE-TKT-003 payment sim
  test('POST /api/tickets/purchase returns Section 4 shape + QR image', async () => {
    const res = await request(app)
      .post('/api/tickets/purchase')
      .send({
        ticket_type: 'group',
        visitor_name: 'Abebe Kebede',
        visitor_phone: '+251911000000',
        quantity: 10,
        payment_method: 'telebirr',
        visit_date: '2026-07-26',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.ticket).toMatchObject({
      ticket_type: 'group',
      quantity: 10,
      total_amount: 800,
      visitor_name: 'Abebe Kebede',
      visit_date: '2026-07-26',
      status: 'valid',
    });
    expect(res.body.data.ticket.qr_ticket_code).toMatch(/^TKT-/);
    expect(res.body.data.payment_simulation).toMatchObject({
      status: 'completed',
      sandbox_mode: true,
      sandbox_label: 'DEMO — No real payment processed',
    });
    expect(res.body.data.payment_simulation.reference).toMatch(/^DEMO-/);
    expect(res.body.data.qr_data_url).toMatch(/^data:image\/png;base64,/);
  });

  test('POST /api/tickets/purchase validates body', async () => {
    const res = await request(app).post('/api/tickets/purchase').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/tickets/purchase rejects unknown ticket_type', async () => {
    const res = await request(app)
      .post('/api/tickets/purchase')
      .send({
        ticket_type: 'vip',
        visitor_name: 'X',
        visitor_phone: '+2519',
        quantity: 1,
        payment_method: 'telebirr',
        visit_date: '2026-07-26',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid ticket type');
  });

  // BE-TKT-001 verify
  test('GET /api/tickets/verify/:code Valid → Already Used', async () => {
    const purchase = await request(app).post('/api/tickets/purchase').send({
      ticket_type: 'student',
      visitor_name: 'Student',
      visitor_phone: '+251922222222',
      quantity: 1,
      payment_method: 'cash',
      visit_date: '2026-07-27',
    });
    const code = purchase.body.data.ticket.qr_ticket_code;

    const first = await request(app)
      .get(`/api/tickets/verify/${code}`)
      .set('Authorization', `Bearer ${staffToken}`);
    expect(first.body.data).toMatchObject({ valid: true, message: 'Valid' });

    const second = await request(app)
      .get(`/api/tickets/verify/${code}`)
      .set('Authorization', `Bearer ${staffToken}`);
    expect(second.body.data).toMatchObject({
      valid: false,
      message: 'Already Used',
    });
  });

  test('GET /api/tickets/verify/:code Invalid for unknown code', async () => {
    const res = await request(app)
      .get('/api/tickets/verify/TKT-UNKNOWN1')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.body.data).toMatchObject({
      valid: false,
      ticket: null,
      message: 'Invalid',
    });
  });

  test('GET /api/tickets/verify/:code requires authentication', async () => {
    const res = await request(app).get('/api/tickets/verify/TKT-X');
    expect(res.status).toBe(401);
  });
});
