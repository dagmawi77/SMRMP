jest.mock('../src/config/supabase');

const request = require('supertest');
const {
  registerAuthUser,
  resetAuthMock,
} = require('../src/config/supabase');
const app = require('../src/app');
const { User, Role } = require('../src/models');
const { resetDbWithRbac } = require('./helpers/db');

describe('RBAC — users & roles admin APIs', () => {
  let adminToken;
  let curatorToken;
  let roles;

  beforeAll(async () => {
    roles = await resetDbWithRbac();
    resetAuthMock();

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@rbac.test',
      password: null,
      role: 'admin',
      role_id: roles.admin.id,
    });
    const curator = await User.create({
      name: 'Curator',
      email: 'curator@rbac.test',
      password: null,
      role: 'curator',
      role_id: roles.curator.id,
    });

    registerAuthUser({
      id: admin.id,
      email: admin.email,
      password: 'Demo@2026!',
    });
    registerAuthUser({
      id: curator.id,
      email: curator.email,
      password: 'Demo@2026!',
    });

    adminToken = (
      await request(app).post('/api/auth/login').send({
        email: admin.email,
        password: 'Demo@2026!',
      })
    ).body.data.token;

    curatorToken = (
      await request(app).post('/api/auth/login').send({
        email: curator.email,
        password: 'Demo@2026!',
      })
    ).body.data.token;
  });

  test('curator cannot list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${curatorToken}`);
    expect(res.status).toBe(403);
  });

  test('admin can list roles and permissions', async () => {
    const rolesRes = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(rolesRes.status).toBe(200);
    expect(rolesRes.body.data.roles.length).toBeGreaterThanOrEqual(6);

    const permsRes = await request(app)
      .get('/api/roles/permissions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(permsRes.status).toBe(200);
    expect(permsRes.body.data.permissions.length).toBeGreaterThan(10);
  });

  test('admin can create staff user with temp password', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Staff',
        email: 'newstaff@rbac.test',
        role_id: roles.maintenance.id,
        password: 'TempPass@2026!',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('maintenance');
    expect(res.body.data.must_change_password).toBe(true);
    expect(res.body.data.temporary_password).toBe('TempPass@2026!');

    const created = await User.findOne({ where: { email: 'newstaff@rbac.test' } });
    expect(created.must_change_password).toBe(true);
    expect(created.role_id).toBe(roles.maintenance.id);
  });

  test('admin can create custom role and assign permissions', async () => {
    const create = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Gate Supervisor',
        description: 'Tickets only',
      });

    expect(create.status).toBe(201);
    expect(create.body.data.role.is_system).toBe(false);

    const allPerms = await request(app)
      .get('/api/roles/permissions')
      .set('Authorization', `Bearer ${adminToken}`);
    const ticketPerms = allPerms.body.data.permissions
      .filter((p) => p.module === 'tickets')
      .map((p) => p.id);

    const assign = await request(app)
      .put(`/api/roles/${create.body.data.role.id}/permissions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ permission_ids: ticketPerms });

    expect(assign.status).toBe(200);
    expect(assign.body.data.role.permission_codes).toEqual(
      expect.arrayContaining(['tickets.list', 'tickets.verify'])
    );
  });

  test('cannot strip protected permissions from admin role', async () => {
    const adminRole = await Role.findOne({ where: { slug: 'admin' } });
    const res = await request(app)
      .put(`/api/roles/${adminRole.id}/permissions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ permission_ids: [] });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/protected permissions/i);
  });

  test('cannot delete system role', async () => {
    const res = await request(app)
      .delete(`/api/roles/${roles.visitor.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });
});
