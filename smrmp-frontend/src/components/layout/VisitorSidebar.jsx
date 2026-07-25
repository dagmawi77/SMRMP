import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BuildingLibraryIcon,
  CalendarDaysIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  IdentificationIcon,
  Squares2X2Icon,
  TicketIcon,
  UserCircleIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { MUSEUM_NAME, VISITOR_NAV_SECTIONS } from '../../utils/constants';
import useUiStore from '../../store/uiStore';

const iconMap = {
  dashboard: Squares2X2Icon,
  tickets: TicketIcon,
  membership: IdentificationIcon,
  visits: CalendarDaysIcon,
  bookings: UserGroupIcon,
  group: UserGroupIcon,
  feedback: ChatBubbleLeftEllipsisIcon,
  profile: UserCircleIcon,
};

function isPathActive(pathname, path) {
  if (path === '/portal') return pathname === '/portal' || pathname === '/portal/';
  if (path === '/portal/tickets') {
    return pathname === '/portal/tickets' || pathname.startsWith('/portal/tickets/pass/');
  }
  if (path === '/portal/bookings') {
    return pathname === '/portal/bookings';
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function VisitorSidebar() {
  const location = useLocation();
  const {
    visitorMobileOpen,
    visitorCollapsed,
    closeVisitorMobile,
    toggleVisitorCollapsed,
  } = useUiStore();

  const [openMenus, setOpenMenus] = useState(() => {
    const initial = {};
    if (location.pathname.startsWith('/portal/tickets')) initial['/portal/tickets'] = true;
    if (location.pathname.startsWith('/portal/bookings')) initial['/portal/bookings'] = true;
    return initial;
  });

  useEffect(() => {
    if (location.pathname.startsWith('/portal/tickets')) {
      setOpenMenus((prev) => ({ ...prev, '/portal/tickets': true }));
    }
    if (location.pathname.startsWith('/portal/bookings')) {
      setOpenMenus((prev) => ({ ...prev, '/portal/bookings': true }));
    }
  }, [location.pathname]);

  useEffect(() => {
    closeVisitorMobile();
  }, [location.pathname, closeVisitorMobile]);

  const showLabels = !visitorCollapsed || visitorMobileOpen;

  return (
    <>
      {visitorMobileOpen ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close navigation"
          onClick={closeVisitorMobile}
          onKeyDown={(event) => event.key === 'Escape' && closeVisitorMobile()}
          className="fixed inset-0 z-40 bg-[#1C120B]/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh flex-col border-r border-[#E2D6C5] bg-[#FFFDF9] text-[#2B1B12] transition-all duration-300 lg:relative lg:z-40 lg:shrink-0 ${
          visitorMobileOpen ? 'w-72 translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
        } ${visitorCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="relative flex items-center justify-between border-b border-[#E2D6C5] bg-[#FAF6F0] px-5 py-5">
          <Link
            to="/portal"
            onClick={closeVisitorMobile}
            className="group flex min-w-0 items-center gap-3"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#D4A017]/40 bg-[#FAF0D8] text-[#7C4A2D] transition-transform group-hover:scale-105">
              <BuildingLibraryIcon className="h-5 w-5" aria-hidden="true" />
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#374B07] ring-2 ring-[#FAF6F0]" />
            </div>
            {showLabels ? (
              <div className="min-w-0 truncate">
                <p className="truncate font-display text-base font-bold tracking-tight text-[#2B1B12] transition-colors group-hover:text-[#7C4A2D]">
                  {MUSEUM_NAME}
                </p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">
                  Visitor Portal
                </p>
              </div>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={closeVisitorMobile}
            aria-label="Close navigation"
            className="rounded-xl p-1.5 text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12] lg:hidden"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={toggleVisitorCollapsed}
            title={visitorCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={visitorCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute -right-3 top-6 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-[#D4A017]/50 bg-[#FAF0D8] text-[#7C4A2D] shadow-xs transition-transform hover:scale-110 hover:bg-smrmp-gold hover:text-black lg:flex"
          >
            {visitorCollapsed ? (
              <ChevronRightIcon className="h-3.5 w-3.5 stroke-[3]" />
            ) : (
              <ChevronLeftIcon className="h-3.5 w-3.5 stroke-[3]" />
            )}
          </button>
        </div>

        <nav aria-label="Visitor portal" className="flex-1 space-y-5 overflow-y-auto px-3 py-6">
          {VISITOR_NAV_SECTIONS.map((section) => (
            <div key={section.id}>
              <p
                className={`px-3.5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B7668] ${
                  showLabels ? '' : 'sr-only'
                }`}
              >
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon] || Squares2X2Icon;
                  const active = isPathActive(location.pathname, item.path);
                  const hasChildren = item.children?.length > 0;

                  if (!hasChildren) {
                    return (
                      <Link
                        key={`${section.id}-${item.path}-${item.label}`}
                        to={item.path}
                        onClick={closeVisitorMobile}
                        title={!showLabels ? item.label : undefined}
                        aria-current={active ? 'page' : undefined}
                        className={`group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-[#E4EEDC] text-[#243205]'
                            : 'text-[#5C4233] hover:bg-[#FAF0E4] hover:text-[#2B1B12]'
                        } ${showLabels ? '' : 'justify-center px-2'}`}
                      >
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            active ? 'text-[#374B07]' : 'text-[#7C4A2D] group-hover:text-[#2B1B12]'
                          }`}
                        />
                        {showLabels ? <span className="truncate">{item.label}</span> : null}
                      </Link>
                    );
                  }

                  const childActive = item.children.some((child) =>
                    isPathActive(location.pathname, child.path),
                  );
                  const menuOpen = Boolean(openMenus[item.path]);

                  return (
                    <div key={item.path} className="relative">
                      <div
                        className={`flex items-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                          active || childActive
                            ? 'bg-[#E4EEDC] text-[#243205]'
                            : 'text-[#5C4233] hover:bg-[#FAF0E4] hover:text-[#2B1B12]'
                        }`}
                      >
                        <Link
                          to={item.path}
                          onClick={closeVisitorMobile}
                          title={!showLabels ? item.label : undefined}
                          className={`flex min-w-0 flex-1 items-center gap-3.5 px-3.5 py-2.5 ${
                            showLabels ? '' : 'justify-center px-2'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              active || childActive ? 'text-[#374B07]' : 'text-[#7C4A2D]'
                            }`}
                          />
                          {showLabels ? <span className="truncate">{item.label}</span> : null}
                        </Link>
                        {showLabels ? (
                          <button
                            type="button"
                            aria-label={`${menuOpen ? 'Collapse' : 'Expand'} ${item.label}`}
                            aria-expanded={menuOpen}
                            onClick={() =>
                              setOpenMenus((prev) => ({ ...prev, [item.path]: !prev[item.path] }))
                            }
                            className="mr-2 rounded-lg p-1.5 text-[#7C4A2D] transition hover:bg-[#FAF0E4] focus:outline-none focus:ring-2 focus:ring-smrmp-gold/60"
                          >
                            <ChevronDownIcon
                              className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        ) : null}
                      </div>

                      {showLabels && menuOpen ? (
                        <div className="ml-5 mt-1 space-y-0.5 border-l border-[#D8C8B8] pl-3">
                          {item.children.map((child) => {
                            const childIsActive = isPathActive(location.pathname, child.path);
                            return (
                              <Link
                                key={child.path + child.label}
                                to={child.path}
                                onClick={closeVisitorMobile}
                                aria-current={childIsActive ? 'page' : undefined}
                                className={`block border-l-2 px-2.5 py-2 text-[11px] leading-tight transition ${
                                  childIsActive
                                    ? 'border-smrmp-gold bg-[#F7F1E9] font-bold text-smrmp-green'
                                    : 'border-transparent text-[#7C6657] hover:bg-[#FAF0E4] hover:text-[#2B1B12]'
                                }`}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {showLabels ? (
          <div className="mx-3 mb-4 rounded-xl border border-[#D4A017]/40 bg-[#FAF0D8] p-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#7C4A2D]">
              <BuildingLibraryIcon className="h-4 w-4 text-[#D4A017]" />
              <span>Adwa Museum</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#5C4233]">
              Tickets, membership, and visit history in one place.
            </p>
          </div>
        ) : null}
      </aside>
    </>
  );
}
