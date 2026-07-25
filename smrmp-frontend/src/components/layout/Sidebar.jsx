import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArchiveBoxIcon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  TicketIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { NAV_ITEMS } from '../../utils/constants';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';

const navIconMap = {
  '/dashboard': Squares2X2Icon,
  '/artifacts': ArchiveBoxIcon,
  '/exhibitions': BuildingLibraryIcon,
  '/tickets': TicketIcon,
  '/users': UserGroupIcon,
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
  const { user, hasRole } = useAuthStore();
  const { isMobileOpen, isCollapsed, closeMobile, toggleCollapsed } = useUiStore();
  const [isExhibitionsOpen, setIsExhibitionsOpen] = useState(location.pathname.startsWith('/exhibitions'));

  useEffect(() => {
    if (location.pathname.startsWith('/exhibitions')) setIsExhibitionsOpen(true);
  }, [location.pathname]);

  const portalTitle = getPortalTitle(user?.role);
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((role) => hasRole(role)),
  );

  const isPathActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(`${path}/`));

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
          <Link to="/dashboard" onClick={closeMobile} className="group flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#D4A017]/40 bg-[#FAF0D8] text-lg transition-transform group-hover:scale-105">
              <span aria-hidden="true">🏛️</span>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#374B07] ring-2 ring-[#FAF6F0]" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 truncate">
                <p className="truncate font-display text-base font-bold tracking-tight text-[#2B1B12] transition-colors group-hover:text-[#7C4A2D]">SMRMP</p>
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
          <p className={`px-3.5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B7668] ${isCollapsed && !isMobileOpen ? 'sr-only' : ''}`}>Museum operations</p>
          {visibleItems.map((item) => {
            const Icon = navIconMap[item.path] || Squares2X2Icon;
            const active = isPathActive(item.path);
            const hasChildren = item.children?.length;

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

            const childActive = item.children.some((child) => isPathActive(child.path));
            return (
              <div key={item.path}>
                <div className={`group flex items-center rounded-xl text-sm font-semibold transition-all duration-200 ${active ? 'bg-[#E4EEDC] text-[#243205]' : 'text-[#5C4233] hover:bg-[#FAF0E4] hover:text-[#2B1B12]'}`}>
                  <Link
                    to={item.path}
                    onClick={closeMobile}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                    className={`flex min-w-0 flex-1 items-center gap-3.5 px-3.5 py-2.5 ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[#374B07]' : 'text-[#7C4A2D] group-hover:text-[#2B1B12]'}`} />
                    {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                  </Link>
                  {(!isCollapsed || isMobileOpen) && (
                    <button
                      type="button"
                      aria-label={`${isExhibitionsOpen ? 'Collapse' : 'Expand'} ${item.label} menu`}
                      aria-expanded={isExhibitionsOpen}
                      onClick={() => setIsExhibitionsOpen((open) => !open)}
                      className="mr-2 rounded-lg p-1.5 text-[#7C4A2D] transition hover:bg-[#FAF0E4] focus:outline-none focus:ring-2 focus:ring-smrmp-gold/60"
                    >
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExhibitionsOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {(!isCollapsed || isMobileOpen) && isExhibitionsOpen && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-[#D8C8B8] pl-3">
                    {item.children.map((child) => {
                      const childIsActive = isPathActive(child.path);
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
