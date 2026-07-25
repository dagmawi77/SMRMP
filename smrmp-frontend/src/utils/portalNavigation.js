/**
 * Visitor Portal parent → child hierarchy (logical Back targets).
 * All authenticated visitor features live under /portal/*.
 */

export const PORTAL_HOME = '/portal';

const EXACT_PARENTS = {
  '/portal/profile': {
    parent: PORTAL_HOME,
    backLabel: 'Back to Dashboard',
  },
  '/portal/membership': {
    parent: PORTAL_HOME,
    backLabel: 'Back to Dashboard',
  },
  '/portal/tickets': {
    parent: PORTAL_HOME,
    backLabel: 'Back to Dashboard',
  },
  '/portal/tickets/buy': {
    parent: PORTAL_HOME,
    backLabel: 'Back to Dashboard',
  },
  '/portal/visits': {
    parent: PORTAL_HOME,
    backLabel: 'Back to Dashboard',
  },
  '/portal/bookings': {
    parent: PORTAL_HOME,
    backLabel: 'Back to Dashboard',
  },
  '/portal/bookings/new': {
    parent: '/portal/bookings',
    backLabel: 'Back to Bookings',
  },
  '/portal/feedback': {
    parent: PORTAL_HOME,
    backLabel: 'Back to Dashboard',
  },
  '/portal/change-password': {
    parent: '/portal/profile',
    backLabel: 'Back to Profile',
  },
};

const PREFIX_PARENTS = [
  {
    test: (pathname) => pathname.startsWith('/portal/tickets/pass/'),
    parent: '/portal/tickets',
    backLabel: 'Back to Tickets',
  },
  {
    test: (pathname) => pathname.startsWith('/portal/profile/'),
    parent: '/portal/profile',
    backLabel: 'Back to Profile',
  },
  {
    test: (pathname) => pathname.startsWith('/portal/membership/'),
    parent: '/portal/membership',
    backLabel: 'Back to Membership',
  },
  {
    test: (pathname) => pathname.startsWith('/portal/visits/'),
    parent: '/portal/visits',
    backLabel: 'Back to Visit History',
  },
  {
    test: (pathname) => pathname.startsWith('/portal/bookings/') && pathname !== '/portal/bookings/new',
    parent: '/portal/bookings',
    backLabel: 'Back to Bookings',
  },
];

/**
 * @param {string} pathname
 * @returns {{ parent: string, backLabel: string, showBack: boolean }}
 */
export function getPortalBackTarget(pathname) {
  if (!pathname || pathname === PORTAL_HOME || pathname === `${PORTAL_HOME}/`) {
    return { parent: PORTAL_HOME, backLabel: 'Back', showBack: false };
  }

  const exact = EXACT_PARENTS[pathname];
  if (exact) return { ...exact, showBack: true };

  for (const rule of PREFIX_PARENTS) {
    if (rule.test(pathname)) {
      return { parent: rule.parent, backLabel: rule.backLabel, showBack: true };
    }
  }

  return { parent: PORTAL_HOME, backLabel: 'Back to Dashboard', showBack: true };
}

export function isPortalPath(path) {
  return typeof path === 'string' && (path === PORTAL_HOME || path.startsWith(`${PORTAL_HOME}/`));
}
