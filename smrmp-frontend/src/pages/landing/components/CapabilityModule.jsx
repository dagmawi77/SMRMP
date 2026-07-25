import { QrCodeIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

const featureIcons = {
  qr: QrCodeIcon,
  audio: SpeakerWaveIcon,
};

export default function CapabilityModule({ capability }) {
  const isRight = capability.side === 'right';
  const gradientClass = isRight
    ? 'bg-gradient-to-l from-smrmp-brown via-smrmp-brown/80 to-transparent'
    : 'bg-gradient-to-r from-smrmp-brown via-smrmp-brown/80 to-transparent';
  const panelPosition = isRight ? 'md:col-start-2' : '';

  return (
    <div className="group relative flex items-center overflow-hidden py-12 md:py-16" data-reveal>
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={capability.image}
          alt={capability.imageAlt}
          className="h-full w-full object-cover opacity-25 grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
          loading="lazy"
          decoding="async"
        />
        <div className={`absolute inset-0 ${gradientClass}`} />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 px-6 md:grid-cols-2">
        <div className={`glass-panel ${panelPosition} p-6 sm:p-10 md:p-12 rounded-2xl`}>
          <span className="mb-3 block text-xs font-bold uppercase tracking-[0.4em] text-smrmp-gold">
            {capability.module}
          </span>
          <h3 className="mb-5 max-w-md font-display text-2xl leading-snug sm:text-4xl">{capability.title}</h3>
          <p className="mb-6 max-w-xl text-sm font-light leading-relaxed text-smrmp-parchment/80">{capability.description}</p>

          {capability.features && typeof capability.features[0] === 'string' && (
            <div className="space-y-2.5">
              {capability.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-smrmp-gold/80">
                  <span className="h-px w-8 bg-smrmp-gold/40" aria-hidden="true" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {capability.stats && (
            <div className="grid grid-cols-2 gap-3">
              {capability.stats.map((stat) => (
                <div key={stat.label} className="border border-white/10 bg-white/5 p-3 rounded-xl text-center">
                  <span className="mb-0.5 block font-display text-xl text-smrmp-gold font-bold">{stat.value}</span>
                  <span className="text-[10px] uppercase tracking-wider text-smrmp-parchment/60">{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {capability.features && typeof capability.features[0] !== 'string' && (
            <div className="flex flex-wrap gap-6">
              {capability.features.map((feature) => {
                const Icon = featureIcons[feature.icon];
                return (
                  <div key={feature.icon} className="flex items-center gap-2.5">
                    {Icon && <Icon className="h-6 w-6 text-smrmp-gold shrink-0" aria-hidden="true" />}
                    <span className="text-[10px] font-bold uppercase leading-tight tracking-wider">
                      {feature.label.map((line) => (
                        <span key={line} className="block">{line}</span>
                      ))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsStrip() {
  const stats = [
    { value: 'Live', label: 'Visitor Flow' },
    { value: '98%', label: 'Catalog Health' },
    { value: 'Tracked', label: 'Conservation Risk' },
  ];

  return (
    <div className="border-y border-smrmp-gold/20 bg-smrmp-deep-green px-6 py-8 md:py-10" data-reveal>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col">
          <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-smrmp-gold">Heritage Analytics</span>
          <h4 className="font-display text-xl font-bold">Real-time Institutional Pulse</h4>
        </div>
        <div className="no-scrollbar flex max-w-full gap-10 overflow-x-auto pb-1 sm:gap-14">
          {stats.map((stat) => (
            <div key={stat.label} className="shrink-0">
              <span className="block font-display text-3xl font-bold leading-none text-smrmp-gold">{stat.value}</span>
              <span className="block text-[9px] font-bold uppercase leading-none tracking-[0.2em] text-smrmp-parchment/50 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
        <a href="#roadmap" className="w-fit border-b border-smrmp-gold pb-0.5 text-xs font-bold uppercase tracking-widest transition-colors hover:text-smrmp-gold">
          View Roadmap
        </a>
      </div>
    </div>
  );
}
