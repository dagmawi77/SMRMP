import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PageHeader({
  title,
  description,
  action,
  badge,
  backPath,
  onBack,
  showBack,
  backLabel = 'Back to Catalog',
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mb-6 space-y-3">
      {(showBack || backPath || onBack) && (
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C4A2D] hover:text-[#2B1B12] transition-colors group"
        >
          <ArrowLeftIcon className="h-4 w-4 text-smrmp-gold group-hover:-translate-x-1 transition-transform" />
          <span>{backLabel}</span>
        </button>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2D6C5] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#2B1B12] sm:text-3xl">
              {title}
            </h1>
            {badge && (
              <span className="rounded-full bg-[#FAF0E4] px-2.5 py-0.5 text-xs font-semibold text-[#7C4A2D] border border-[#D4A017]/30">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1.5 text-sm text-[#6E5445] font-normal leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
