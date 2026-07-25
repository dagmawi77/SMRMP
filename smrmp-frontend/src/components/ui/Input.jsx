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
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 text-[#7C4A2D]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border ${
            Icon ? 'pl-10' : 'px-4'
          } py-2.5 text-sm text-[#2B1B12] outline-none transition-all placeholder:text-[#A08878] focus:ring-2 ${
            error
              ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-[#E2D6C5] bg-[#FFFDF9] hover:border-smrmp-gold/50 focus:border-smrmp-green focus:ring-smrmp-green/20'
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[#6E5445]">{hint}</p>}
    </div>
  );
});

export default Input;
