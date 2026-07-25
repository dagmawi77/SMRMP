import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PASSWORD_RULES } from '../../utils/registrationValidation';

const STRENGTH_COLORS = {
  empty: 'bg-white/20',
  weak: 'bg-rose-500',
  fair: 'bg-amber-500',
  good: 'bg-emerald-500',
  strong: 'bg-smrmp-gold',
};

export default function PasswordStrengthMeter({ password = '', t }) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password));
  const score = password
    ? passed.length <= 2
      ? 25
      : passed.length === 3
        ? 50
        : passed.length === 4
          ? 75
          : 100
    : 0;
  const label = !password ? 'empty' : passed.length <= 2 ? 'weak' : passed.length === 3 ? 'fair' : passed.length === 4 ? 'good' : 'strong';

  return (
    <div className="space-y-3" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/40 border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-300 ${STRENGTH_COLORS[label]}`}
            style={{ width: `${score}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Password strength"
          />
        </div>
        {password && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-smrmp-gold capitalize">
            {label}
          </span>
        )}
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li
              key={rule.key}
              className={`flex items-center gap-1.5 text-xs ${ok ? 'text-smrmp-gold font-medium' : 'text-smrmp-parchment/50'}`}
            >
              {ok ? (
                <CheckIcon className="h-3.5 w-3.5 shrink-0 text-smrmp-gold" aria-hidden="true" />
              ) : (
                <XMarkIcon className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden="true" />
              )}
              {t.passwordRequirements[rule.key]}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
