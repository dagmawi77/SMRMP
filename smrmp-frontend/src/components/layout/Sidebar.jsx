import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArchiveBoxIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  Squares2X2Icon,
  StarIcon,
  TicketIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { NAV_ITEMS, ROLE_REDIRECTS } from '../../utils/constants';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import { LogoMark } from '../ui/Logo';

const navIconMap = {
  '/dashboard': Squares2X2Icon,
  '/maintenance/tasks': ClipboardDocumentCheckIcon,
  '/artifacts': ArchiveBoxIcon,
  '/exhibitions': BuildingLibraryIcon,
  '/tickets': TicketIcon,
  '/tickets/manage': TicketIcon,
  '/admin': ShieldCheckIcon,
  '/admin/users': ShieldCheckIcon,
  '/settings': Cog6ToothIcon,
  '/visitors': UserGroupIcon,
  '/memberships': IdentificationIcon,
  '/group-bookings': CalendarDaysIcon,
  '/feedback/dashboard': StarIcon,
};

const PORTAL_TITLE_MAP = {
  admin: 'Admin Portal',
  curator: 'Curator Portal',
  conservation: 'Conservation Portal',
  maintenance: 'Maintenance Portal',
  researcher: 'Research Portal',
  visitor: 'Visitor Portal',
};

const getPortalTitle = (role) => {
  if (!role) return 'Staff Portal';
  const normalized = String(role).toLowerCase();
  return PORTAL_TITLE_MAP[normalized] || `${normalized.charAt(0).toUpperCase() + normalized.slice(1)} Portal`;
};

export default function Sidebar() {
  const location = useLocation();
  const { user, hasRole, canAny } = useAuthStore();
  const { isMobileOpen, isCollapsed, closeMobile, toggleCollapsed } = useUiStore();
  const isVisitorsSection = (pathname) =>
    ['/visitors', '/memberships', '/group-bookings', '/feedback/dashboard'].some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

  const [openMenus, setOpenMenus] = useState(() => {
    const initial = {};
    if (location.pathname.startsWith('/exhibitions')) initial['/exhibitions'] = true;
    if (location.pathname.startsWith('/admin')) initial['/admin/users'] = true;
    if (isVisitorsSection(location.pathname)) initial['/visitors'] = true;
    return initial;
  });

  useEffect(() => {
    if (location.pathname.startsWith('/exhibitions')) {
      setOpenMenus((prev) => ({ ...prev, '/exhibitions': true }));
    }
    if (location.pathname.startsWith('/admin')) {
      setOpenMenus((prev) => ({ ...prev, '/admin/users': true }));
    }
    if (isVisitorsSection(location.pathname)) {
      setOpenMenus((prev) => ({ ...prev, '/visitors': true }));
    }
  }, [location.pathname]);

  const toggleMenu = (path) => {
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const portalTitle = getPortalTitle(user?.role);

  const isNavVisible = (item) => {
    if (item.excludeRoles?.length && item.excludeRoles.some((role) => hasRole(role))) {
      return false;
    }
    if (item.roles?.length && !item.roles.some((role) => hasRole(role))) {
      return false;
    }
    if (item.permissions?.length) {
      return canAny(...item.permissions);
    }
    return true;
  };

  const visibleItems = NAV_ITEMS.filter(isNavVisible);

  const isPathActive = (path, siblings = []) => {
    if (location.pathname === path) return true;
    if (path === '/dashboard') return false;
    // Prefer more-specific sibling (e.g. /visitors/analytics over /visitors)
    const siblingOwnsPath = siblings.some(
      (sibling) =>
        sibling.path !== path
        && (sibling.path === location.pathname
          || (sibling.path.length > path.length
            && sibling.path.startsWith(`${path}/`)
            && (location.pathname === sibling.path
              || location.pathname.startsWith(`${sibling.path}/`)))),
    );
    if (siblingOwnsPath) return false;
    return location.pathname.startsWith(`${path}/`);
  };

  const homePath = ROLE_REDIRECTS[user?.role] || '/dashboard';

  return (
    <>
      {isMobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close mobile navigation"
          onClick={closeMobile}
          onKeyDown={(event) => event.key === 'Escape' && closeMobile()}
          className="fixed inset-0 z-40 bg-[#1C120B]/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh flex-col bg-[#FFFDF9] text-[#2B1B12] shadow-none transition-all duration-300 border-r border-[#E2D6C5] lg:relative lg:z-40 lg:shrink-0 ${
          isMobileOpen ? 'translate-x-0 w-72 shadow-xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="relative flex items-center justify-between border-b border-[#E2D6C5] bg-[#FAF6F0] px-5 py-5">
          <Link to={homePath} onClick={closeMobile} className="group flex min-w-0 items-center gap-3">
            <div className="relative shrink-0 transition-transform group-hover:scale-105">
              <LogoMark className="h-10 w-10" imgClassName="h-6 w-auto" decorative />
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#374B07] ring-2 ring-[#FAF6F0]" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 truncate">
                <p className="truncate font-display text-xs font-bold tracking-tight text-[#2B1B12] transition-colors group-hover:text-[#7C4A2D]" title="Adwa Victory Memorial">Adwa Victory Memorial</p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">{portalTitle}</p>
              </div>
            )}
          </Link>

          <button type="button" onClick={closeMobile} aria-label="Close navigation" className="rounded-xl p-1.5 text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12] lg:hidden">
            <XMarkIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={toggleCollapsed}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex absolute -right-3 top-6 z-10 h-6 w-6 items-center justify-center rounded-full bg-[#FAF0D8] text-[#7C4A2D] hover:bg-smrmp-gold hover:text-black transition-transform hover:scale-110 border border-[#D4A017]/50 shadow-xs"
          >
            {isCollapsed ? <ChevronRightIcon className="h-3.5 w-3.5 stroke-[3]" /> : <ChevronLeftIcon className="h-3.5 w-3.5 stroke-[3]" />}
          </button>
        </div>

        <nav aria-label="Primary navigation" className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
          {visibleItems.map((item) => {
            const Icon = navIconMap[item.path] || Squares2X2Icon;
            const active = isPathActive(item.path);
            const visibleChildren = item.children?.filter(isNavVisible);
            const hasChildren = visibleChildren?.length > 0;

            if (!hasChildren) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  title={isCollapsed && !isMobileOpen ? item.label : undefined}
                  className={`group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    active ? 'bg-[#E4EEDC] text-[#243205]' : 'text-[#5C4233] hover:bg-[#FAF0E4] hover:text-[#2B1B12]'
                  } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
                >
                  <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[#374B07]' : 'text-[#7C4A2D] group-hover:text-[#2B1B12]'}`} />
                  {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                </Link>
              );
            }

            const childActive = visibleChildren.some((child) => isPathActive(child.path, visibleChildren));
            const sectionActive = childActive || active;
            const isMenuOpen = Boolean(openMenus[item.path]);
            return (
              <div key={item.path}>
                <div className={`group flex items-center rounded-xl text-sm font-semibold transition-all duration-200 ${sectionActive ? 'bg-[#E4EEDC] text-[#243205]' : 'text-[#5C4233] hover:bg-[#FAF0E4] hover:text-[#2B1B12]'}`}>
                  <Link
                    to={item.path}
                    onClick={closeMobile}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                    className={`flex min-w-0 flex-1 items-center gap-3.5 px-3.5 py-2.5 ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${sectionActive ? 'text-[#374B07]' : 'text-[#7C4A2D] group-hover:text-[#2B1B12]'}`} />
                    {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                  </Link>
                  {(!isCollapsed || isMobileOpen) && (
                    <button
                      type="button"
                      aria-label={`${isMenuOpen ? 'Collapse' : 'Expand'} ${item.label} menu`}
                      aria-expanded={isMenuOpen}
                      onClick={() => toggleMenu(item.path)}
                      className="mr-2 rounded-lg p-1.5 text-[#7C4A2D] transition hover:bg-[#FAF0E4] focus:outline-none focus:ring-2 focus:ring-smrmp-gold/60"
                    >
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {(!isCollapsed || isMobileOpen) && isMenuOpen && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-[#D8C8B8] pl-3">
                    {visibleChildren.map((child) => {
                      const childIsActive = isPathActive(child.path, visibleChildren);
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={closeMobile}
                          className={`block border-l-2 px-2.5 py-2 text-[11px] leading-tight transition ${
                            childIsActive ? 'border-smrmp-gold bg-[#F7F1E9] font-bold text-smrmp-green' : 'border-transparent text-[#7C6657] hover:bg-[#FAF0E4] hover:text-[#2B1B12]'
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
                {childActive && isCollapsed && !isMobileOpen && <span className="absolute left-0 h-5 w-0.5 bg-smrmp-gold" aria-hidden="true" />}
              </div>
            );
          })}
        </nav>

        {(!isCollapsed || isMobileOpen) && (
          <div className="mx-3 mb-4 rounded-xl border border-[#D4A017]/40 bg-[#FAF0D8] p-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#7C4A2D]"><BuildingLibraryIcon className="h-4 w-4 text-[#D4A017]" /><span>Adwa Museum</span></div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#5C4233]">Curator &amp; Archive System Active</p>
          </div>
        )}
      </aside>
    </>
  );
}
