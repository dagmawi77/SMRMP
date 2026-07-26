import { Link } from 'react-router-dom';
import { ArrowDownIcon, ArrowRightIcon, QrCodeIcon } from '@heroicons/react/24/outline';

export default function HeroSection() {
  return (
    <section id="top" className="relative flex min-h-[750px] sm:min-h-[85vh] items-center justify-center overflow-hidden py-24 sm:py-32" aria-labelledby="hero-title">
      <img
        src="https://mycouture.africa/wp-content/uploads/2024/03/CoutureNews_AdwaVictoryMemorialMuseum_Feat.jpg"
        alt="Adwa Victory Memorial Museum illuminated at night"
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-smrmp-brown/90 via-smrmp-brown/50 to-smrmp-brown" aria-hidden="true" />
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 text-center" data-reveal>
        <div className="mx-auto mb-6 h-px w-20 bg-smrmp-gold opacity-70" aria-hidden="true" />
        <h1 id="hero-title" className="mx-auto mb-6 max-w-4xl font-display text-4xl font-bold leading-snug sm:leading-[1.18] tracking-tight text-smrmp-parchment drop-shadow-2xl sm:text-6xl md:text-7xl">
          The digital <span className="font-normal italic text-smrmp-gold">custodians</span> of Ethiopia’s legacy.
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-base font-light leading-relaxed tracking-wide text-smrmp-parchment/90 sm:text-lg drop-shadow-md">
          Transforming heritage stewardship from paper ledgers to structured artifact intelligence. Grounded, operational, and built for collective memory.
        </p>
        <div className="flex flex-col justify-center gap-3.5 sm:flex-row sm:gap-5">
          <a href="#shift" className="inline-flex items-center justify-center gap-2.5 bg-smrmp-gold px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all duration-300 hover:bg-white hover:scale-105 shadow-lg">
            Explore the Adwa Pilot
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link to="/scan" className="inline-flex items-center justify-center gap-2.5 border border-smrmp-gold/60 bg-black/30 backdrop-blur-sm px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-smrmp-gold transition-all duration-300 hover:bg-smrmp-gold hover:text-black">
            <QrCodeIcon className="h-4 w-4" aria-hidden="true" />
            Scan an Artifact QR
          </Link>
          <a href="#capabilities" className="inline-flex items-center justify-center gap-2.5 border border-white/30 bg-black/30 backdrop-blur-sm px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-smrmp-parchment transition-all duration-300 hover:bg-white/20 hover:border-white">
            View Platform Architecture
            <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 text-right text-[10px] uppercase tracking-widest text-smrmp-parchment/60 font-medium">
        <p>Adwa Victory Memorial Museum · Ethiopia</p>
        <p>Ref #AVM-2026</p>
      </div>
    </section>
  );
}
