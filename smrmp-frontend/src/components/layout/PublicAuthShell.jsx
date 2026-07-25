import LandingNav from '../../pages/landing/components/LandingNav';
import LandingFooter from '../../pages/landing/components/LandingFooter';

/**
 * Shared chrome for marketing-auth screens (login, register, set password).
 * One implementation — replaces copy-pasted site-shell wrappers.
 */
export default function PublicAuthShell({ children, showFooter = true }) {
  return (
    <div className="site-shell min-h-screen overflow-x-clip bg-smrmp-brown text-smrmp-parchment">
      <div className="border-b border-white/5 bg-black/40 px-6 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-smrmp-parchment/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span>SMRMP / Pilot Edition</span>
          <span className="hidden text-right sm:inline">
            Reference deployment: Adwa Victory Memorial Museum
          </span>
        </div>
      </div>
      <LandingNav />
      <main>{children}</main>
      {showFooter ? <LandingFooter /> : null}
    </div>
  );
}
