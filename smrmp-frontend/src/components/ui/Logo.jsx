export const LOGO_SRC = '/adwa-logo.svg';
export const LOGO_ALT = 'Adwa Victory Memorial Museum';

export default function Logo({ className = 'h-10 w-auto', alt = LOGO_ALT, decorative = false }) {
  return (
    <img
      src={LOGO_SRC}
      alt={decorative ? '' : alt}
      aria-hidden={decorative || undefined}
      className={`shrink-0 select-none object-contain ${className}`}
      draggable="false"
    />
  );
}

// The mark is gold at 58% opacity, so it needs a dark backdrop to stay legible
// on the parchment surfaces used across the curator and visitor screens.
export function LogoMark({ className = 'h-10 w-10', imgClassName = 'h-7 w-auto', decorative = false }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl border border-smrmp-gold/40 bg-gradient-to-br from-[#1C120B] via-[#241710] to-[#120D08] ${className}`}
    >
      <Logo className={imgClassName} decorative={decorative} />
    </span>
  );
}
