import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

/**
 * Hierarchy Back control — always navigates to the logical parent route.
 * Does not use browser history.
 *
 * @param {object} props
 * @param {string} props.parentTo - Parent route path (required)
 * @param {string} [props.label='Back'] - Accessible label
 * @param {string} [props.className]
 */
export default function BackButton({
  parentTo,
  label = 'Back',
  className = '',
}) {
  const navigate = useNavigate();

  if (!parentTo) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(parentTo)}
      aria-label={label}
      title={label}
      className={`group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] text-[#7C4A2D] shadow-2xs transition-all duration-200 hover:border-smrmp-gold/50 hover:bg-[#FAF0D8] hover:text-[#2B1B12] focus:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-smrmp-parchment active:scale-[0.96] sm:h-11 sm:w-11 ${className}`}
    >
      <ArrowLeftIcon
        className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  );
}
