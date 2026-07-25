export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const MUSEUM_NAME = import.meta.env.VITE_MUSEUM_NAME || 'Adwa Victory Memorial Museum';

export const ROLES = {
  ADMIN: 'admin',
  CURATOR: 'curator',
  CONSERVATION: 'conservation',
  MAINTENANCE: 'maintenance',
  RESEARCHER: 'researcher',
  VISITOR: 'visitor',
};

export const ROLE_REDIRECTS = {
  admin: '/dashboard',
  curator: '/dashboard',
  conservation: '/dashboard',
  maintenance: '/dashboard',
  researcher: '/artifacts',
  visitor: '/portal',
};

export function getHomePath(role) {
  return ROLE_REDIRECTS[role] || '/dashboard';
}

export const ARTIFACT_CATEGORIES = [
  { value: 'weapon', label: 'Weapon' },
  { value: 'textile', label: 'Textile' },
  { value: 'document', label: 'Document' },
  { value: 'ceramic', label: 'Ceramic' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'ceremonial', label: 'Ceremonial' },
  { value: 'photograph', label: 'Photograph' },
  { value: 'coin', label: 'Coin' },
  { value: 'other', label: 'Other' },
];

export const CONDITION_STATUSES = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'critical', label: 'Critical' },
];

export const CONDITION_COLORS = {
  excellent: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  fair: 'bg-yellow-100 text-yellow-800',
  poor: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const REPORT_TYPES = [
  { value: 'daily_operations', label: 'Daily Operations' },
  { value: 'monthly_summary', label: 'Monthly Summary' },
  { value: 'conservation_status', label: 'Conservation Status' },
  { value: 'visitor_analytics', label: 'Visitor Analytics' },
  { value: 'executive_overview', label: 'Executive Overview' },
];

export const PAYMENT_METHODS = [
  { value: 'telebirr', label: 'Telebirr' },
  { value: 'chapa', label: 'Chapa' },
  { value: 'cash', label: 'Cash (Counter)' },
];

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', permissions: ['dashboard.read'], roles: ['admin', 'curator', 'conservation', 'maintenance'] },
  { label: 'Assigned Tasks', path: '/maintenance/tasks', permissions: ['maintenance.read'], roles: ['maintenance', 'admin'] },
  { label: 'Artifacts', path: '/artifacts', permissions: ['artifacts.read'], roles: ['admin', 'curator', 'conservation', 'researcher'] },
  { label: 'Exhibitions', path: '/exhibitions', permissions: ['exhibitions.read'], roles: ['admin', 'curator'] },
  { label: 'Tickets', path: '/tickets/manage', permissions: ['tickets.list'], excludeRoles: ['maintenance'] },
  {
    label: 'Visitor Relations',
    path: '/visitors',
    roles: ['admin', 'curator'],
    permissions: ['visitors.read', 'members.read', 'bookings.read', 'feedback.read'],
    children: [
      { label: 'Visitors', path: '/visitors', roles: ['admin', 'curator'], permissions: ['visitors.read'] },
      { label: 'Analytics', path: '/visitors/analytics', roles: ['admin', 'curator'], permissions: ['visitors.read'] },
      { label: 'Memberships', path: '/memberships', roles: ['admin', 'curator'], permissions: ['members.read'] },
      { label: 'Group Bookings', path: '/group-bookings', roles: ['admin', 'curator'], permissions: ['bookings.read'] },
      { label: 'Feedback', path: '/feedback/dashboard', roles: ['admin', 'curator'], permissions: ['feedback.read'] },
    ],
  },
  {
    label: 'Access control',
    path: '/admin/users',
    permissions: ['users.read', 'roles.read'],
    children: [
      { label: 'User accounts', path: '/admin/users' },
      { label: 'Roles & matrix', path: '/admin/roles' },
      { label: 'Permission catalog', path: '/admin/permissions' },
    ],
  },
  { label: 'Settings', path: '/settings', permissions: [] },
];

export const STAFF_ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator', description: 'Full staff access: system, catalog, visitors, tickets & settings' },
  { value: 'curator', label: 'Curator', description: 'Exhibitions, cataloging, ticketing & Visitor Relations monitoring' },
  { value: 'conservation', label: 'Conservation Specialist', description: 'Artifact condition logging, environmental monitoring & restoration' },
  { value: 'maintenance', label: 'Maintenance Staff', description: 'Facility maintenance, casing security & physical upkeep' },
  { value: 'researcher', label: 'Researcher', description: 'Archival research, historical notes & documentation access' },
];

export const DEPARTMENT_OPTIONS = [
  { value: 'Administration & IT', label: 'Administration & IT' },
  { value: 'Curatorial & Exhibitions', label: 'Curatorial & Exhibitions' },
  { value: 'Conservation & Restoration', label: 'Conservation & Restoration' },
  { value: 'Facilities & Maintenance', label: 'Facilities & Maintenance' },
  { value: 'Research & Archival', label: 'Research & Archival' },
];

export const ROLE_BADGE_VARIANTS = {
  admin: 'gold',
  curator: 'good',
  conservation: 'excellent',
  maintenance: 'poor',
  researcher: 'purple',
  visitor: 'default',
};

// ─── Module 8 — Visitor & Member Management ──────────────────────

export const VISITOR_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'group', label: 'Group' },
  { value: 'student', label: 'Student' },
  { value: 'vip', label: 'VIP' },
  { value: 'member', label: 'Member' },
  { value: 'researcher', label: 'Researcher' },
];

export const VISITOR_TYPE_BADGE = {
  individual: 'default',
  group: 'good',
  student: 'fair',
  vip: 'gold',
  member: 'excellent',
  researcher: 'purple',
};

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'am', label: 'Amharic' },
  { value: 'or', label: 'Oromo' },
  { value: 'ti', label: 'Tigrinya' },
  { value: 'fr', label: 'French' },
];

export const ENTRY_METHODS = [
  { value: 'qr_ticket', label: 'QR Ticket' },
  { value: 'membership_card', label: 'Membership Card' },
  { value: 'group_booking', label: 'Group Booking' },
  { value: 'cash_counter', label: 'Cash Counter' },
  { value: 'comp', label: 'Complimentary' },
  { value: 'staff_assisted', label: 'Staff Assisted' },
];

export const MEMBERSHIP_PAYMENT_METHODS = [
  { value: 'telebirr', label: 'Telebirr' },
  { value: 'chapa', label: 'Chapa' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Transfer' },
];

export const MEMBERSHIP_STATUS_BADGE = {
  pending: 'fair',
  active: 'excellent',
  expired: 'poor',
  cancelled: 'critical',
};

export const GROUP_TYPES = [
  { value: 'school', label: 'School' },
  { value: 'tourist', label: 'Tourist Group' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'family', label: 'Family' },
  { value: 'other', label: 'Other' },
];

export const BOOKING_STATUS_BADGE = {
  pending: 'fair',
  confirmed: 'good',
  completed: 'excellent',
  cancelled: 'critical',
};

export const FEEDBACK_CATEGORIES = [
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'staff', label: 'Staff' },
  { value: 'facility', label: 'Facility' },
  { value: 'ticketing', label: 'Ticketing' },
  { value: 'overall', label: 'Overall Experience' },
  { value: 'other', label: 'Other' },
];

export const FEEDBACK_STATUS_BADGE = {
  new: 'fair',
  reviewed: 'good',
  responded: 'excellent',
  published: 'gold',
  archived: 'default',
};

// ─── Visitor Portal ───────────────────────────────────────────────

/**
 * Visitor Portal sidebar navigation (implemented features only).
 * Sections: main · services · account
 */
export const VISITOR_NAV_SECTIONS = [
  {
    id: 'main',
    label: 'My museum',
    items: [
      { label: 'Dashboard', path: '/portal', icon: 'dashboard' },
      { label: 'My Tickets', path: '/portal/tickets', icon: 'tickets' },
      { label: 'Membership', path: '/portal/membership', icon: 'membership' },
      { label: 'Visit History', path: '/portal/visits', icon: 'visits' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    items: [
      { label: 'Leave Feedback', path: '/portal/feedback', icon: 'feedback' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { label: 'Profile', path: '/portal/profile', icon: 'profile' },
    ],
  },
];

/** Flat list for title/breadcrumb lookups */
export const VISITOR_NAV_ITEMS = VISITOR_NAV_SECTIONS.flatMap((section) =>
  section.items.flatMap((item) => (item.children?.length ? [item, ...item.children] : [item])),
);

export const VISITOR_PAGE_META = {
  '/portal': { title: 'Dashboard', crumb: 'Home' },
  '/portal/profile': { title: 'Profile', crumb: 'Profile' },
  '/portal/membership': { title: 'Membership', crumb: 'Membership' },
  '/portal/tickets': { title: 'My Tickets', crumb: 'Tickets' },
  '/portal/tickets/buy': { title: 'Buy Tickets', crumb: 'Buy Tickets', parentCrumb: 'Tickets', parentPath: '/portal/tickets' },
  '/portal/visits': { title: 'Visit History', crumb: 'Visits' },
  '/portal/bookings': { title: 'Group Bookings', crumb: 'Bookings' },
  '/portal/bookings/new': { title: 'Book a Group Visit', crumb: 'New Booking', parentCrumb: 'Bookings', parentPath: '/portal/bookings' },
  '/portal/feedback': { title: 'Leave Feedback', crumb: 'Feedback' },
  '/portal/change-password': { title: 'Change Password', crumb: 'Security' },
  '/change-password': { title: 'Change Password', crumb: 'Security' },
};
