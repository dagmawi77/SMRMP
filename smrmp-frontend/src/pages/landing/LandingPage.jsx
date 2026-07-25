import { useEffect } from 'react';
import LandingFooter from './components/LandingFooter';
import LandingNav from './components/LandingNav';
import AudienceCard from './components/AudienceCard';
import CapabilityModule, { AnalyticsStrip } from './components/CapabilityModule';
import HeroSection from './components/HeroSection';
import ExhibitionsSection from './components/ExhibitionsSection';
import RoadmapSection from './components/RoadmapSection';
import ShiftSection from './components/ShiftSection';
import TrustSection from './components/TrustSection';
import { audienceCards, capabilityModules } from './landingData';

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
        <ShiftSection />
        <section id="capabilities" className="bg-smrmp-brown" aria-labelledby="capabilities-title">
          <div className="sr-only" id="capabilities-title">SMRMP platform capabilities</div>
          {capabilityModules.map((capability, index) => (
            <div key={capability.title}>
              <CapabilityModule capability={capability} />
              {index < capabilityModules.length - 1 && <div className="hairline-gold max-w-6xl mx-auto" aria-hidden="true" />}
            </div>
          ))}
          <AnalyticsStrip />
        </section>
        <TrustSection />
        <RoadmapSection />
        <section className="bg-smrmp-deep-green px-6 py-12 sm:py-16" aria-labelledby="audience-title">
          <h2 id="audience-title" className="sr-only">Explore SMRMP by audience</h2>
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
            {audienceCards.map((audience) => <AudienceCard key={audience.title} audience={audience} />)}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
