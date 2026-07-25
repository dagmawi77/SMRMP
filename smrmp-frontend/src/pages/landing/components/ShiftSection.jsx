import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { digitalPoints, paperPoints } from '../landingData';

export default function ShiftSection() {
  return (
    <section id="shift" className="overflow-hidden bg-smrmp-brown px-6 py-16 sm:py-20" aria-labelledby="shift-title">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center" data-reveal>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.4em] text-smrmp-gold">Evolution</span>
          <h2 id="shift-title" className="font-display text-3xl sm:text-5xl">From paper to presence</h2>
        </div>

        <div className="relative grid gap-px bg-white/5 md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl" data-reveal>
          <div className="paper-texture relative flex min-h-[380px] flex-col justify-center overflow-hidden p-6 sm:p-10 md:p-14">
            <div className="relative z-10 text-smrmp-brown">
              <h3 className="mb-6 border-b border-smrmp-brown/20 pb-3 font-display text-2xl font-bold">The Inherited Burden</h3>
              <ul className="space-y-4 text-xs tracking-wide text-smrmp-brown/80 font-medium">
                {paperPoints.map((point, index) => (
                  <li key={point} className="flex gap-3">
                    <span className="font-bold text-smrmp-gold">{String(index + 1).padStart(2, '0')}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex min-h-[380px] flex-col justify-center bg-smrmp-green p-6 sm:p-10 md:p-14">
            <h3 className="mb-6 border-b border-white/10 pb-3 font-display text-2xl font-bold">One Living Record of Truth</h3>
            <ul className="space-y-4 text-xs tracking-wide">
              {digitalPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-smrmp-gold" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-white/10 pt-6">
              <a href="#capabilities" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-smrmp-gold transition-colors hover:text-white">
                Explore the transformation
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
