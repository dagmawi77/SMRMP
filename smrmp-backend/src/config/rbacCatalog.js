'use strict';

const { randomUUID } = require('crypto');

const SYSTEM_ROLES = [
  { slug: 'admin', name: 'Administrator', description: 'Full system access' },
  { slug: 'curator', name: 'Curator', description: 'Catalog and exhibition management' },
  { slug: 'conservation', name: 'Conservation', description: 'Conservation and condition logs' },
  { slug: 'maintenance', name: 'Maintenance', description: 'Facilities and gate operations' },
  { slug: 'researcher', name: 'Researcher', description: 'Read-only catalog access' },
  { slug: 'visitor', name: 'Visitor', description: 'Public visitor account' },
];

const PERMISSIONS = [
  { code: 'users.read', module: 'users', description: 'List and view user accounts' },
  { code: 'users.create', module: 'users', description: 'Create staff accounts' },
  { code: 'users.update', module: 'users', description: 'Update user profiles' },
  { code: 'users.deactivate', module: 'users', description: 'Activate or deactivate users' },
  { code: 'users.assign_role', module: 'users', description: 'Change a user role' },
  { code: 'roles.read', module: 'roles', description: 'List roles and permissions' },
  { code: 'roles.create', module: 'roles', description: 'Create custom roles' },
  { code: 'roles.update', module: 'roles', description: 'Update role metadata' },
  { code: 'roles.delete', module: 'roles', description: 'Delete custom roles' },
  { code: 'roles.assign_permissions', module: 'roles', description: 'Edit role permission matrix' },
  { code: 'artifacts.read', module: 'artifacts', description: 'View artifact catalog' },
  { code: 'artifacts.create', module: 'artifacts', description: 'Create artifacts' },
  { code: 'artifacts.update', module: 'artifacts', description: 'Update artifacts' },
  { code: 'artifacts.delete', module: 'artifacts', description: 'Delete artifacts' },
  { code: 'exhibitions.read', module: 'exhibitions', description: 'View exhibitions' },
  { code: 'exhibitions.create', module: 'exhibitions', description: 'Create exhibitions' },
  { code: 'exhibitions.update', module: 'exhibitions', description: 'Update exhibitions' },
  { code: 'exhibitions.delete', module: 'exhibitions', description: 'Delete exhibitions' },
  { code: 'conservation.read', module: 'conservation', description: 'View conservation logs' },
  { code: 'conservation.create', module: 'conservation', description: 'Create conservation logs' },
  { code: 'conservation.update', module: 'conservation', description: 'Update conservation logs' },
  { code: 'conservation.delete', module: 'conservation', description: 'Delete conservation logs' },
  { code: 'tickets.list', module: 'tickets', description: 'List purchased tickets' },
  { code: 'tickets.verify', module: 'tickets', description: 'Verify tickets at gate' },
  { code: 'tickets.purchase', module: 'tickets', description: 'Purchase tickets (staff override)' },
  { code: 'dashboard.read', module: 'dashboard', description: 'View dashboard stats' },
  { code: 'ai.describe', module: 'ai', description: 'AI artifact description' },
  { code: 'ai.search', module: 'ai', description: 'AI smart search' },
  { code: 'ai.report', module: 'ai', description: 'AI report generation' },
  { code: 'ai.ask', module: 'ai', description: 'AI assistant ask' },
  { code: 'visitors.read', module: 'visitors', description: 'View visitor records' },
  { code: 'visitors.create', module: 'visitors', description: 'Register new visitors' },
  { code: 'visitors.update', module: 'visitors', description: 'Update visitor records' },
  { code: 'visitors.delete', module: 'visitors', description: 'Delete visitor records' },
  { code: 'visitors.checkin', module: 'visitors', description: 'Check in visitors at the gate' },
  { code: 'members.read', module: 'members', description: 'View membership records' },
  { code: 'members.create', module: 'members', description: 'Create memberships' },
  { code: 'members.update', module: 'members', description: 'Update membership records' },
  { code: 'members.manage', module: 'members', description: 'Manage membership tiers and configuration' },
  { code: 'members.verify', module: 'members', description: 'Verify membership cards at the gate' },
  { code: 'bookings.read', module: 'bookings', description: 'View group bookings' },
  { code: 'bookings.update', module: 'bookings', description: 'Update group bookings' },
  { code: 'bookings.manage', module: 'bookings', description: 'Manage group booking lifecycle' },
  { code: 'feedback.read', module: 'feedback', description: 'View visitor feedback' },
  { code: 'feedback.update', module: 'feedback', description: 'Respond to visitor feedback' },
  { code: 'feedback.manage', module: 'feedback', description: 'Publish and manage visitor feedback' },
  // Visitor Portal (self-service — never grants staff CRM access)
  { code: 'portal.read', module: 'portal', description: 'Access visitor portal dashboard' },
  { code: 'portal.profile', module: 'portal', description: 'View and update own visitor profile' },
  { code: 'portal.memberships', module: 'portal', description: 'View own memberships and digital card' },
  { code: 'portal.tickets', module: 'portal', description: 'View own tickets' },
  { code: 'portal.visits', module: 'portal', description: 'View own visit history' },
  { code: 'portal.bookings', module: 'portal', description: 'View own group booking requests' },
];

/** Critical permissions that the system admin role must always retain. */
const ADMIN_PROTECTED_PERMISSIONS = [
  'users.read',
  'users.create',
  'users.assign_role',
  'roles.read',
  'roles.assign_permissions',
];

/** Visitor self-service portal only — admin keeps full staff ops including Visitor Relations */
const ADMIN_EXCLUDED_PERMISSION_PREFIXES = [
  'portal.',
];

const ROLE_PERMISSION_MAP = {
  // Admin: full staff access (sidebar + ops). Excludes visitor self-service portal.*
  admin: PERMISSIONS.filter(
    (p) => !ADMIN_EXCLUDED_PERMISSION_PREFIXES.some((prefix) => p.code.startsWith(prefix)),
  ).map((p) => p.code),
  curator: [
    'artifacts.read',
    'artifacts.create',
    'artifacts.update',
    'exhibitions.read',
    'exhibitions.create',
    'exhibitions.update',
    'conservation.read',
    'conservation.create',
    'conservation.update',
    'tickets.list',
    'tickets.verify',
    'dashboard.read',
    'ai.describe',
    'ai.search',
    'ai.report',
    'ai.ask',
    // Visitor Relations (Curator Portal) — full CRM ops (not visitor self-service)
    'visitors.read',
    'visitors.create',
    'visitors.update',
    'visitors.delete',
    'visitors.checkin',
    'members.read',
    'members.create',
    'members.update',
    'members.manage',
    'members.verify',
    'bookings.read',
    'bookings.update',
    'bookings.manage',
    'feedback.read',
    'feedback.update',
    'feedback.manage',
  ],
  conservation: [
    'artifacts.read',
    'conservation.read',
    'conservation.create',
    'conservation.update',
    'tickets.list',
    'tickets.verify',
    'dashboard.read',
  ],
  maintenance: [
    'tickets.list',
    'tickets.verify',
    'dashboard.read',
  ],
  researcher: ['artifacts.read'],
  // Visitor Portal self-service only
  visitor: [
    'portal.read',
    'portal.profile',
    'portal.memberships',
    'portal.tickets',
    'portal.visits',
    'portal.bookings',
  ],
};

module.exports = {
  SYSTEM_ROLES,
  PERMISSIONS,
  ROLE_PERMISSION_MAP,
  ADMIN_PROTECTED_PERMISSIONS,
  createIds: () => {
    const roleIds = {};
    const permissionIds = {};
    for (const role of SYSTEM_ROLES) {
      roleIds[role.slug] = randomUUID();
    }
    for (const perm of PERMISSIONS) {
      permissionIds[perm.code] = randomUUID();
    }
    return { roleIds, permissionIds };
  },
};
