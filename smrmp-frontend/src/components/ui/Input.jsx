import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    id,
    className = '',
    icon: Icon,
    required = false,
    variant = 'default',
    ...props
  },
  ref
) {
  const inputId = id || props.name;
  const isGlass = variant === 'glass';

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] ${
            isGlass ? 'text-smrmp-parchment/80' : 'text-[#5C4233]'
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className={`pointer-events-none absolute left-3.5 ${isGlass ? 'text-slate-600' : 'text-[#7C4A2D]'}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-12 rounded-xl border ${
            Icon ? 'pl-10' : 'px-4'
          } py-2.5 text-sm outline-none transition-all ${
            isGlass
              ? `bg-white text-[#121212] placeholder:text-stone-400 [color-scheme:light] ${
                  error
                    ? 'border-rose-400 bg-rose-50/90 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25'
                    : 'border-white/20 hover:border-smrmp-gold/50 focus:border-smrmp-gold focus:ring-2 focus:ring-smrmp-gold/25'
                }`
              : `text-[#2B1B12] placeholder:text-[#A08878] focus:ring-2 ${
                  error
                    ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-[#E2D6C5] bg-[#FFFDF9] hover:border-smrmp-gold/50 focus:border-smrmp-green focus:ring-smrmp-green/20'
                }`
          }`}
          {...props}
        />
      </div>
      {error && <p className={`mt-1.5 text-xs font-semibold ${isGlass ? 'text-rose-400' : 'text-rose-600'}`}>{error}</p>}
      {hint && !error && <p className={`mt-1 text-xs ${isGlass ? 'text-smrmp-parchment/60' : 'text-[#6E5445]'}`}>{hint}</p>}
    </div>
  );
});

export default Input;
