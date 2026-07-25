import { useLocation } from 'react-router-dom';
import BackButton from '../ui/BackButton';
import { getPortalBackTarget } from '../../utils/portalNavigation';

/**
 * Shared page header for Visitor Portal (and portal-linked) screens.
 *
 * Layout:
 *   [←]  Title
 *        description
 *
 * Back navigates to the logical parent (hierarchy only — no history.back).
 */
export default function PortalPageHeader({
  icon: Icon,
  title,
  description,
  actions = null,
  showBack,
  /** When false, title lives in VisitorNavbar — avoid duplicate headings */
  showTitle = true,
  parentTo,
  backLabel,
  className = '',
}) {
  const { pathname } = useLocation();
  const resolved = getPortalBackTarget(pathname);

  const shouldShowBack = showBack ?? resolved.showBack;
  const targetParent = parentTo || resolved.parent;
  const targetLabel = backLabel || resolved.backLabel;
  const showHeading = showTitle && Boolean(title);

  return (
    <header className={`mb-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {shouldShowBack ? (
            <BackButton parentTo={targetParent} label={targetLabel} />
          ) : null}

          <div className="min-w-0 pt-0.5">
            {showHeading ? (
              <div className="flex items-center gap-3">
                {Icon ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF0D8] text-[#7C4A2D] ring-1 ring-[#D4A017]/30 sm:h-11 sm:w-11">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                ) : null}
                <h1 className="font-display text-xl font-bold tracking-tight text-[#2B1B12] sm:text-2xl">
                  {title}
                </h1>
              </div>
            ) : (
              <h1 className="sr-only">{title}</h1>
            )}
            {description ? (
              <p className={`max-w-xl text-sm text-[#6E5445] ${showHeading ? 'mt-1' : ''}`}>
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
