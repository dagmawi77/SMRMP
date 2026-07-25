import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  KeyIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';
import useUiStore from '../../store/uiStore';
import { VISITOR_PAGE_META } from '../../utils/constants';
import { getPortalBackTarget } from '../../utils/portalNavigation';

function resolvePageMeta(pathname) {
  if (VISITOR_PAGE_META[pathname]) return VISITOR_PAGE_META[pathname];

  if (pathname.startsWith('/portal/tickets/pass/')) {
    return { title: 'Ticket Pass', crumb: 'Ticket Details', parentCrumb: 'Tickets', parentPath: '/portal/tickets' };
  }

  return { title: 'Visitor Portal', crumb: 'Portal' };
}

export default function VisitorNavbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toggleVisitorMobile } = useUiStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const meta = resolvePageMeta(location.pathname);
  const parent = getPortalBackTarget(location.pathname);
  const showParentCrumb = parent.showBack && parent.parent === '/portal';

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointer = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const initials = (user?.name || 'V')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[#E2D6C5] bg-[#FAF6F0]/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggleVisitorMobile}
          aria-label="Open navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] text-[#2B1B12] transition hover:border-smrmp-gold/40 hover:bg-[#FAF0D8] lg:hidden"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-0.5 hidden items-center gap-1.5 text-[11px] font-semibold text-[#8B7668] sm:flex">
            <Link to="/portal" className="transition hover:text-[#2B1B12]">
              Dashboard
            </Link>
            {location.pathname !== '/portal' ? (
              <>
                <span aria-hidden="true">/</span>
                {meta.parentCrumb ? (
                  <>
                    <Link to={meta.parentPath || parent.parent} className="transition hover:text-[#2B1B12]">
                      {meta.parentCrumb}
                    </Link>
                    <span aria-hidden="true">/</span>
                    <span className="text-[#5C4233]">{meta.crumb}</span>
                  </>
                ) : showParentCrumb ? (
                  <span className="text-[#5C4233]">{meta.crumb}</span>
                ) : (
                  <span className="text-[#5C4233]">{meta.crumb}</span>
                )}
              </>
            ) : null}
          </nav>
          <h1 className="truncate font-display text-base font-bold tracking-tight text-[#2B1B12] sm:text-lg">
            {meta.title}
          </h1>
        </div>
      </div>

      <div className="relative flex items-center gap-2" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="inline-flex items-center gap-2 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] py-1.5 pl-1.5 pr-2.5 transition hover:border-smrmp-gold/40 hover:bg-[#FAF0D8]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1C120B] to-[#3a2418] text-[11px] font-bold text-smrmp-gold">
            {initials}
          </span>
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block truncate text-xs font-bold text-[#2B1B12]">{user?.name || 'Visitor'}</span>
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#8B7668]">Visitor</span>
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 text-[#7C4A2D] transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] py-1 shadow-lg"
          >
            <div className="border-b border-[#E2D6C5] px-3 py-2.5">
              <p className="truncate text-sm font-bold text-[#2B1B12]">{user?.name || 'Visitor'}</p>
              <p className="truncate text-xs text-[#6E5445]">{user?.email}</p>
            </div>
            <Link
              role="menuitem"
              to="/portal/profile"
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-[#5C4233] transition hover:bg-[#FAF0D8] hover:text-[#2B1B12]"
              onClick={() => setMenuOpen(false)}
            >
              <UserCircleIcon className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <Link
              role="menuitem"
              to="/portal/change-password"
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-[#5C4233] transition hover:bg-[#FAF0D8] hover:text-[#2B1B12]"
              onClick={() => setMenuOpen(false)}
            >
              <KeyIcon className="h-4 w-4" />
              <span>Change password</span>
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-[#8B1E1E] transition hover:bg-rose-50"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
