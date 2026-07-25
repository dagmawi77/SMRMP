import { useEffect } from 'react';
import LandingFooter from './components/LandingFooter';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import ExhibitionsSection from './components/ExhibitionsSection';
import TrustSection from './components/TrustSection';

export default function LandingPage() {
  useEffect(() => {
    const revealItems = document.querySelectorAll('[data-reveal]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="site-shell min-h-screen overflow-x-clip bg-smrmp-brown text-smrmp-parchment font-sans">
      <div className="border-b border-white/5 bg-black/40 px-6 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <span>SMRMP / Pilot Edition</span>
          <span className="hidden text-right sm:inline">Reference deployment: Adwa Victory Memorial Museum</span>
        </div>
      </div>
      <LandingNav />
      <main>
        <HeroSection />
        <ExhibitionsSection />
        <TrustSection />
      </main>
      <LandingFooter />
    </div>
  );
}
