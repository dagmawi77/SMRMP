import { Link, useLocation } from 'react-router-dom';
import {
  Squares2X2Icon,
  ArchiveBoxIcon,
  TicketIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { NAV_ITEMS } from '../../utils/constants';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';

const navIconMap = {
  '/dashboard': Squares2X2Icon,
  '/artifacts': ArchiveBoxIcon,
  '/tickets': TicketIcon,
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

  const portalTitle = getPortalTitle(user?.role);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((role) => hasRole(role)),
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          type="button"
          aria-label="Close mobile navigation"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-[#1C120B]/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#FFFDF9] text-[#2B1B12] shadow-none transition-all duration-300 border-r border-[#E2D6C5] lg:static lg:z-20 ${
          isMobileOpen ? 'translate-x-0 w-72 shadow-xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand / Header */}
        <div className="relative border-b border-[#E2D6C5] px-5 py-5 flex items-center justify-between bg-[#FAF6F0]">
          <Link
            to="/dashboard"
            onClick={closeMobile}
            className="group flex items-center gap-3 min-w-0"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF0D8] text-lg border border-[#D4A017]/40 transition-transform group-hover:scale-105">
              <span>🏛️</span>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#374B07] ring-2 ring-[#FAF6F0]" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 truncate">
                <p className="font-display text-base font-bold tracking-tight text-[#2B1B12] group-hover:text-[#7C4A2D] transition-colors truncate">
                  SMRMP
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445] truncate">
                  {portalTitle}
                </p>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-xl p-1.5 text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12] lg:hidden"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Desktop Expand/Collapse Toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex absolute -right-3 top-6 h-6 w-6 items-center justify-center rounded-full bg-[#FAF0D8] text-[#7C4A2D] hover:bg-smrmp-gold hover:text-black transition-transform hover:scale-110 border border-[#D4A017]/50"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-3.5 w-3.5 stroke-[3]" />
            ) : (
              <ChevronLeftIcon className="h-3.5 w-3.5 stroke-[3]" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = navIconMap[item.path] || Squares2X2Icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={`group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E4EEDC] text-[#243205]'
                    : 'text-[#5C4233] hover:bg-[#FAF0E4] hover:text-[#2B1B12]'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-[#374B07]' : 'text-[#7C4A2D] group-hover:text-[#2B1B12]'
                  }`}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Museum Status Pill */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="mx-3 mb-4 rounded-xl bg-[#FAF0D8] p-3 border border-[#D4A017]/40">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#7C4A2D]">
              <BuildingLibraryIcon className="h-4 w-4 text-[#D4A017]" />
              <span>Adwa Museum</span>
            </div>
            <p className="mt-1 text-[11px] text-[#5C4233] leading-relaxed">
              Curator & Archive System Active
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
