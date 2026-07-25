export default function AudienceCard({ audience }) {
  return (
    <article className="group relative h-[360px] sm:h-[400px] overflow-hidden rounded-2xl border border-white/10 shadow-lg" data-reveal>
      <img
        src={audience.image}
        alt={audience.imageAlt}
        className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
        loading="lazy"
        decoding="async"
      />
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors duration-500 ${audience.overlay}`} aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-smrmp-gold">{audience.eyebrow}</span>
        <h3 className="mb-3 font-display text-2xl font-bold">{audience.title}</h3>
        <p className="mb-4 text-xs font-light leading-relaxed text-smrmp-parchment/80 line-clamp-2">
          {audience.description}
        </p>
        <a
          href="#footer"
          className="inline-flex bg-smrmp-gold px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:bg-white rounded-lg"
        >
          {audience.action}
        </a>
      </div>
    </article>
  );
}
