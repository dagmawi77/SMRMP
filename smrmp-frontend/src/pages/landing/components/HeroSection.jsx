import { ArrowDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function HeroSection() {
  return (
    <section id="top" className="relative flex min-h-[520px] items-center justify-center overflow-hidden py-16 sm:py-24" aria-labelledby="hero-title">
      <video
        aria-label="Slow pan across a beautifully lit ancient artifact at Adwa Victory Memorial Museum. Video by The Instagrapher."
        autoPlay
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70"
        loop
        muted
        playsInline
        poster="https://images.pexels.com/videos/7492696/pexels-photo-7492696.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200"
        preload="metadata"
      >
        <source src="https://videos.pexels.com/video-files/7492696/7492696-sd_960_540_24fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-smrmp-brown/90 via-smrmp-brown/25 to-smrmp-brown" aria-hidden="true" />
      <div className="absolute inset-0 bg-smrmp-green/20 mix-blend-multiply" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 text-center" data-reveal>
        <div className="mx-auto mb-6 h-px w-16 bg-smrmp-gold opacity-60" aria-hidden="true" />
        <h1 id="hero-title" className="mx-auto mb-6 max-w-4xl font-display text-4xl leading-[1.05] tracking-tight text-smrmp-parchment drop-shadow-xl sm:text-6xl md:text-7xl">
          The digital <span className="font-normal italic">custodians</span> of Ethiopia’s legacy.
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base font-light leading-relaxed tracking-wide text-smrmp-parchment/80 sm:text-lg">
          Transforming heritage stewardship from paper ledgers to structured artifact intelligence. Grounded, operational, and built for collective memory.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <a href="#shift" className="inline-flex items-center justify-center gap-2.5 bg-smrmp-gold px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-colors duration-300 hover:bg-white focus-visible:bg-white">
            Explore the Adwa Pilot
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="#capabilities" className="inline-flex items-center justify-center gap-2.5 border border-white/25 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-smrmp-parchment transition-colors duration-300 hover:bg-white/10 focus-visible:bg-white/10">
            View Platform Architecture
            <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 text-right text-[10px] uppercase tracking-widest text-smrmp-parchment/50">
        <p>Adwa Victory Memorial Museum · Ethiopia</p>
        <p>Ref #AVM-2026</p>
      </div>
    </section>
  );
}
