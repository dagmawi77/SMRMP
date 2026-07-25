jest.mock('../src/config/supabase');

const request = require('supertest');
const {
  registerAuthUser,
  resetAuthMock,
} = require('../src/config/supabase');
const app = require('../src/app');
const { User, MembershipTier } = require('../src/models');
const { resetDbWithRbac } = require('./helpers/db');

describe('Module 8 — Visitor & Member Management (smoke)', () => {
  let staffToken;
  let visitorToken;

  beforeAll(async () => {
    const roles = await resetDbWithRbac();
    resetAuthMock();

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@adwa.museum',
      password: null,
      role: 'admin',
      role_id: roles.admin.id,
    });
    const visitorUser = await User.create({
      name: 'Visitor',
      email: 'visitor@test.com',
      password: null,
      role: 'visitor',
      role_id: roles.visitor.id,
    });

    registerAuthUser({ id: admin.id, email: admin.email, password: 'Demo@2026!' });
    registerAuthUser({ id: visitorUser.id, email: visitorUser.email, password: 'Demo@2026!' });

    await MembershipTier.create({
      name: 'Bronze',
      slug: 'bronze',
      description: 'Entry-level membership',
      price_etb: 500,
      duration_months: 12,
      benefits: ['1 free visit per month'],
      is_active: true,
    });

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

  test('GET /api/memberships/tiers lists active tiers (public)', async () => {
    const res = await request(app).get('/api/memberships/tiers');
    expect(res.status).toBe(200);
    expect(res.body.data.tiers).toHaveLength(1);
    expect(res.body.data.tiers[0]).toMatchObject({ name: 'Bronze', slug: 'bronze' });
  });

  test('GET /api/membership-tiers public alias also works', async () => {
    const res = await request(app).get('/api/membership-tiers');
    expect(res.status).toBe(200);
    expect(res.body.data.tiers).toHaveLength(1);
  });

  test('POST /api/visitors requires authentication', async () => {
    const res = await request(app).post('/api/visitors').send({ first_name: 'Test' });
    expect(res.status).toBe(401);
  });

  test('POST /api/visitors rejects visitor role (missing permission)', async () => {
    const res = await request(app)
      .post('/api/visitors')
      .set('Authorization', `Bearer ${visitorToken}`)
      .send({ first_name: 'Test' });
    expect(res.status).toBe(403);
  });

  test('POST /api/visitors creates a visitor for staff (save_only)', async () => {
    const res = await request(app)
      .post('/api/visitors')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        first_name: 'Abebe',
        last_name: 'Kebede',
        email: 'abebe@example.com',
        phone: '+251911000000',
        save_only: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.visitor).toMatchObject({
      first_name: 'Abebe',
      last_name: 'Kebede',
    });
    expect(res.body.data.visit_log).toBeNull();
  });

  test('GET /api/visitors lists visitors for staff', async () => {
    const res = await request(app)
      .get('/api/visitors')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.visitors.length).toBeGreaterThan(0);
    expect(res.body.data.pagination).toBeDefined();
  });

  test('POST /api/group-bookings public submission enforces pricing + lead time', async () => {
    const tooSoon = new Date();
    tooSoon.setDate(tooSoon.getDate() + 1);

    const rejected = await request(app).post('/api/group-bookings').send({
      group_name: 'Test School',
      contact_name: 'Coordinator',
      contact_phone: '+251900000000',
      visitor_count: 15,
      visit_date: tooSoon.toISOString().slice(0, 10),
    });
    expect(rejected.status).toBe(400);

    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 10);

    const res = await request(app).post('/api/group-bookings').send({
      group_name: 'Test School',
      contact_name: 'Coordinator',
      contact_phone: '+251900000000',
      visitor_count: 15,
      visit_date: validDate.toISOString().slice(0, 10),
    });
    expect(res.status).toBe(201);
    expect(res.body.data.booking).toMatchObject({
      price_per_person: '100.00',
      total_amount: '1500.00',
      status: 'pending',
    });
    expect(res.body.data.booking.booking_reference).toMatch(/^GRP-/);
  });

  test('POST /api/feedback public submission validates rating', async () => {
    const invalid = await request(app).post('/api/feedback').send({ rating: 9 });
    expect(invalid.status).toBe(400);

    const res = await request(app).post('/api/feedback').send({
      rating: 5,
      comment: 'Great museum visit!',
      visitor_name: 'Guest',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.feedback).toMatchObject({ rating: 5, status: 'new' });
  });

  test('GET /api/feedback/public returns only public feedback', async () => {
    const res = await request(app).get('/api/feedback/public');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.feedback)).toBe(true);
  });
});
