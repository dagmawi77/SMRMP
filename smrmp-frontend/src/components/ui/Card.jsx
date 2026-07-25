export default function Card({
  children,
  className = '',
  padding = true,
  variant = 'default',
  hover = false,
}) {
  const variants = {
    default: 'bg-[#FAF6F0] border-[#E2D6C5] text-[#2B1B12] shadow-2xs',
    glass: 'bg-[#FAF6F0]/90 backdrop-blur-md border-[#E2D6C5] text-[#2B1B12] shadow-2xs',
    gradient: 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F3EBE0] border-smrmp-gold/20 shadow-2xs',
    flat: 'bg-[#F3EDE2] border-[#E2D6C5]',
    dark: 'bg-[#241711] border-smrmp-gold/30 text-smrmp-parchment shadow-md',
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${variants[variant] || variants.default} ${
        hover ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-smrmp-gold/50' : ''
      } ${padding ? 'p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
