import { Link } from 'react-router-dom';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { MUSEUM_NAME } from '../../utils/constants';
import useAuthStore from '../../store/authStore';
import PortalPageHeader from './PortalPageHeader';

/**
 * Shared shell for visitor-facing ops (tickets, feedback, group booking, etc.).
 * Page titles use the same hierarchy Back arrow as the Visitor Portal.
 */
export default function PublicSiteShell({
  children,
  title = MUSEUM_NAME,
  subtitle = 'Visitor services',
  pageTitle,
  pageDescription,
  contentClassName = 'max-w-7xl',
  /** Override hierarchy parent (default resolved from pathname) */
  parentTo,
  backLabel,
  showBack,
}) {
  const { isAuthenticated, user } = useAuthStore();
  const isVisitor = user?.role === 'visitor';

  return (
    <div className="visitor-shell min-h-screen bg-smrmp-parchment font-sans text-[#2B1B12]">
      <header className="border-b border-smrmp-gold/30 bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] text-smrmp-parchment">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to={isVisitor && isAuthenticated ? '/portal' : '/'} className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-smrmp-gold/20 text-smrmp-gold ring-1 ring-smrmp-gold/40">
              <BuildingLibraryIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 truncate">
              <p className="truncate text-sm font-bold text-white">{title}</p>
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-smrmp-gold/80">
                {subtitle}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-xs font-bold">
            {isVisitor && isAuthenticated ? (
              <Link to="/portal" className="text-smrmp-gold transition-colors hover:underline">
                My portal
              </Link>
            ) : (
              <Link to="/login" className="text-smrmp-parchment/80 transition-colors hover:text-white">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className={`mx-auto w-full px-4 py-8 sm:px-6 sm:py-10 ${contentClassName}`}>
        {pageTitle ? (
          <PortalPageHeader
            title={pageTitle}
            description={pageDescription}
            parentTo={parentTo}
            backLabel={backLabel}
            showBack={showBack}
          />
        ) : null}
        {children}
      </main>
    </div>
  );
}
