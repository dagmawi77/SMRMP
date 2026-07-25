import { CheckIcon } from '@heroicons/react/24/outline';
import { roadmapSteps } from '../landingData';

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="bg-smrmp-brown px-6 py-16 sm:py-20" aria-labelledby="roadmap-title">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center" data-reveal>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.5em] text-smrmp-gold">Phased Delivery</span>
          <h2 id="roadmap-title" className="font-display text-3xl sm:text-5xl">Ascending Impact</h2>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-3" data-reveal>
          {roadmapSteps.map((step) => {
            const isActive = step.variant === 'active';
            return (
              <article
                key={step.step}
                className={`monument-step relative flex flex-col justify-between overflow-hidden p-6 sm:p-8 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-smrmp-gold text-black shadow-xl ring-2 ring-amber-300'
                    : 'border border-white/10 bg-smrmp-brown/80 text-smrmp-parchment'
                }`}
              >
                <span className={`absolute -right-2 -top-2 select-none font-display text-7xl italic tracking-tighter opacity-10`} aria-hidden="true">
                  {step.step}
                </span>

                {isActive && (
                  <span className="mb-4 inline-block w-fit rounded-full bg-black px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-smrmp-gold">
                    Active Deployment
                  </span>
                )}

                <div className="relative z-10">
                  <h3 className={`mb-3 font-display font-bold leading-tight ${isActive ? 'text-2xl' : 'text-xl'}`}>
                    {step.title}
                  </h3>
                  <p className={`leading-relaxed mb-6 ${isActive ? 'text-xs font-medium text-black/80' : 'text-xs font-light text-smrmp-parchment/70'}`}>
                    {step.description}
                  </p>
                </div>

                <div className={`relative z-10 border-t pt-4 ${isActive ? 'border-black/15' : 'border-white/10'}`}>
                  {Array.isArray(step.footer) ? (
                    <ul className="space-y-2 text-xs font-bold uppercase tracking-wider">
                      {step.footer.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isActive ? 'text-black/80' : 'text-smrmp-parchment/50'}`}>
                      {step.footer}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
