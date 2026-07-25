import { contactLinks, platformLinks } from '../landingData';
import Logo from '../../../components/ui/Logo';

function FooterLinks({ title, links }) {
  return (
    <div className="space-y-8">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-smrmp-parchment/30">{title}</h3>
      <ul className="space-y-4 text-xs font-medium">
        {links.map((link) => (
          <li key={link}>
            <a href="#top" className="transition-colors hover:text-smrmp-gold">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LandingFooter() {
  return (
    <footer id="footer" className="border-t border-white/5 bg-smrmp-brown px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 grid gap-16 md:mb-24 md:grid-cols-2 md:gap-24">
          <div>
            <div className="mb-10 flex items-center gap-4">
              <Logo className="h-14 w-auto" />
            </div>
            <p className="mb-12 max-w-xl font-display text-2xl italic leading-relaxed text-smrmp-parchment/60 md:text-3xl">
              Built for museums, archives, galleries, and the heritage institutions that protect our collective memory.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] font-bold uppercase tracking-[0.3em] text-smrmp-gold">
              <a href="#exhibitions" className="transition-colors hover:text-white">Exhibitions</a>
              <a href="#trust-title" className="transition-colors hover:text-white">Data Ethics</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:gap-12">
            <FooterLinks title="Platform" links={platformLinks} />
            <FooterLinks title="Contact" links={contactLinks} />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 border-t border-white/5 pt-10 text-[10px] font-medium uppercase tracking-widest text-smrmp-parchment/40 md:flex-row md:items-center">
          <p>© 2026 SMRMP — Digital Stewardship Platform</p>
          <p>Reference Site: Adwa Victory Memorial Museum, Ethiopia</p>
          <div className="flex gap-6">
            <a href="#footer" className="hover:text-smrmp-parchment">Privacy</a>
            <a href="#footer" className="hover:text-smrmp-parchment">Security</a>
            <a href="#footer" className="hover:text-smrmp-parchment">Ethics</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
