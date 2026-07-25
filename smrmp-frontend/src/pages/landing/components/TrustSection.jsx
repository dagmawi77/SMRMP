export default function TrustSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-smrmp-brown px-6 py-16 sm:py-20" aria-labelledby="trust-title">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center" data-reveal>
        <div className="relative mb-12">
          <div className="trust-ring absolute -inset-10 hidden items-center justify-center sm:flex" aria-hidden="true">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" role="presentation">
              <defs>
                <path id="trust-circle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
              </defs>
              <text className="fill-smrmp-gold text-[3.5px] font-bold uppercase tracking-[0.4em] opacity-50">
                <textPath href="#trust-circle">Human Review Required • Stewardship • Authenticity • Provenance •</textPath>
              </text>
            </svg>
          </div>
          <div className="absolute inset-0 scale-105 rounded-full border border-smrmp-gold/20" aria-hidden="true" />
          <img
            src="https://images.pexels.com/photos/7506433/pexels-photo-7506433.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Glowing artifact detail. Photo by The Instagrapher."
            className="relative z-10 h-44 w-44 rounded-full border border-smrmp-gold/30 object-cover p-2 grayscale brightness-110 sm:h-56 sm:w-56"
            loading="lazy"
            decoding="async"
          />
          <span className="absolute -bottom-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap border border-smrmp-gold/30 bg-smrmp-brown px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-smrmp-gold">
            Curatorial Review
          </span>
        </div>

        <h2 id="trust-title" className="mb-10 max-w-3xl text-center font-display text-2xl leading-snug text-smrmp-gold sm:text-4xl">
          “AI surfaces the signal. Curators write the history.”
        </h2>

        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
          <p className="border-l-2 border-smrmp-gold/40 pl-6 font-display text-base italic leading-relaxed text-smrmp-parchment/90">
            At SMRMP, we believe in assistive intelligence, not autonomous judgment. AI is a partner in discovery, never the final authority.
          </p>
          <div className="space-y-4 pt-1 text-xs leading-relaxed text-smrmp-parchment/70">
            <p>
              Every description, risk assessment, and institutional report is clearly watermarked as an <strong className="text-smrmp-parchment">AI Draft</strong>. These suggestions serve as a foundation for experts, significantly reducing administrative load while preserving scholarly review.
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-smrmp-gold">Human agency is non-negotiable.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
