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
  visitor: '/tickets',
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
  { label: 'Dashboard', path: '/dashboard', permissions: ['dashboard.read'] },
  { label: 'Artifacts', path: '/artifacts', permissions: ['artifacts.read'] },
  { label: 'Tickets', path: '/tickets', roles: ['admin', 'visitor'] },
  {
    label: 'Access control',
    path: '/admin',
    permissions: ['users.read', 'roles.read'],
  },
];
