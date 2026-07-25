const variants = {
  info: 'border-[#A8C5E2] bg-[#E2ECF5] text-[#1A4568]',
  success: 'border-[#B8D4A0] bg-[#E4EEDC] text-[#243205]',
  warning: 'border-smrmp-gold/40 bg-[#FAF0D8] text-[#7C4A2D]',
  error: 'border-[#F2A8A8] bg-[#FCE4E4] text-[#8B1E1E]',
  ai: 'border-smrmp-gold/50 bg-[#FAF0D8] text-smrmp-brown',
};

export default function Alert({ children, variant = 'info', title, className = '' }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm transition-all ${variants[variant] || variants.info} ${className}`}>
      {title && <p className="mb-0.5 font-semibold tracking-tight">{title}</p>}
      <div className="leading-relaxed opacity-90">{children}</div>
    </div>
  );
}
