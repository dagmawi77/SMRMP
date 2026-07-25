const variants = {
  primary:
    'bg-gradient-to-r from-smrmp-green via-[#2D3F06] to-smrmp-deep-green text-smrmp-parchment hover:brightness-110 border border-smrmp-gold/20 shadow-xs focus:ring-smrmp-green',
  secondary:
    'border border-[#E2D6C5] bg-[#FFFDF9] text-[#2B1B12] hover:bg-[#FAF0E4] hover:border-smrmp-gold/40 shadow-2xs focus:ring-smrmp-earth',
  gold:
    'bg-gradient-to-r from-amber-500 via-smrmp-gold to-amber-600 text-[#1C120B] font-bold hover:brightness-105 border border-white/20 shadow-xs focus:ring-amber-400',
  danger:
    'bg-gradient-to-r from-[#8B1E1E] to-[#6E1212] text-[#F5EFE6] hover:brightness-110 shadow-xs focus:ring-rose-500',
  ghost:
    'text-smrmp-green hover:bg-smrmp-green/10 hover:text-smrmp-deep-green focus:ring-smrmp-green',
  dark:
    'bg-[#241711] text-[#F5EFE6] hover:bg-[#341F17] border border-smrmp-gold/30 shadow-xs focus:ring-amber-700',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
  sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-2',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  type = 'button',
  as: Component = 'button',
  ...props
}) {
  const isNativeButton = Component === 'button';

  return (
    <Component
      type={isNativeButton ? type : undefined}
      disabled={isNativeButton ? disabled || loading : undefined}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Component>
  );
}
