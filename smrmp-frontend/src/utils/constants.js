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
  maintenance: '/maintenance',
  researcher: '/artifacts',
  visitor: '/tickets/buy',
};

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
  { label: 'Dashboard', path: '/dashboard', permissions: ['dashboard.read'], roles: ['admin', 'curator', 'conservation'] },
  { label: 'Artifacts', path: '/artifacts', permissions: ['artifacts.read'], roles: ['admin', 'curator', 'conservation', 'researcher'] },
  { label: 'Exhibitions', path: '/exhibitions', permissions: ['exhibitions.read'], roles: ['curator'] },
  { label: 'Maintenance', path: '/maintenance', roles: ['maintenance'] },
  { label: 'Tickets', path: '/tickets/manage', permissions: ['tickets.list'] },
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
  { value: 'admin', label: 'Administrator', description: 'Full system configuration, security & user management' },
  { value: 'curator', label: 'Curator', description: 'Exhibition management, cataloging & ticketing control' },
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
