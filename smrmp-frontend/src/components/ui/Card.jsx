export default function Card({
  children,
  className = '',
  padding = true,
  variant = 'default',
  hover = false,
  title,
  subtitle,
  action,
}) {
  const variants = {
    default: 'bg-[#FAF6F0] border-[#E2D6C5] text-[#2B1B12] shadow-2xs',
    glass: 'bg-[#FAF6F0]/90 backdrop-blur-md border-[#E2D6C5] text-[#2B1B12] shadow-2xs',
    gradient: 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F3EBE0] border-smrmp-gold/20 shadow-2xs',
    flat: 'bg-[#F3EDE2] border-[#E2D6C5]',
    dark: 'bg-[#241711] border-smrmp-gold/30 text-smrmp-parchment shadow-md',
  };

  const hasHeader = Boolean(title || subtitle || action);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${variants[variant] || variants.default} ${
        hover ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-smrmp-gold/50' : ''
      } ${padding ? 'p-6' : ''} ${className}`}
    >
      {hasHeader && (
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2D6C5] pb-3.5">
          <div>
            {title && <h3 className="font-display text-base font-bold text-[#2B1B12]">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-[#6E5445]">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
