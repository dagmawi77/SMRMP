const statusStyles = {
  excellent: {
    container: 'bg-[#E4EEDC] text-[#243205] border-[#B8D4A0]',
    dot: 'bg-[#374B07]',
  },
  good: {
    container: 'bg-[#E2ECF5] text-[#1A4568] border-[#A8C5E2]',
    dot: 'bg-[#1A4568]',
  },
  fair: {
    container: 'bg-[#FAF0D8] text-[#7C4A2D] border-[#D4A017]/40',
    dot: 'bg-[#D4A017]',
  },
  poor: {
    container: 'bg-[#FBE8DB] text-[#8C3A10] border-[#E8B490]',
    dot: 'bg-[#8C3A10]',
  },
  critical: {
    container: 'bg-[#FCE4E4] text-[#8B1E1E] border-[#F2A8A8]',
    dot: 'bg-[#8B1E1E] animate-pulse',
  },
  gold: {
    container: 'bg-[#FAF0D8] text-[#7C4A2D] border-[#D4A017]/50',
    dot: 'bg-[#D4A017]',
  },
  purple: {
    container: 'bg-[#F3E8FA] text-[#5B21B6] border-[#D8B4FE]',
    dot: 'bg-[#5B21B6]',
  },
  on_loan: {
    container: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
    dot: 'bg-[#D97706]',
  },
  default: {
    container: 'bg-[#EFE7DA] text-[#5C4233] border-[#D8C8B8]',
    dot: 'bg-[#7C4A2D]',
  },
};

export default function Badge({ children, variant, showDot = true, className = '' }) {
  const style = (variant && statusStyles[variant]) ? statusStyles[variant] : statusStyles.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide ${style.container} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />}
      {children}
    </span>
  );
}
