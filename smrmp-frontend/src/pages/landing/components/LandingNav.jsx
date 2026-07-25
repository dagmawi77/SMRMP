import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, QrCodeIcon } from '@heroicons/react/24/outline';

const navItems = [
  { label: 'The shift', href: '/#shift' },
  { label: 'Capabilities', href: '/#capabilities' },
  { label: 'Roadmap', href: '/#roadmap' },
];

export default function LandingNav() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-smrmp-brown/90 px-6 py-4 backdrop-blur-md" aria-label="Primary navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-4" onClick={closeMenu} aria-label="SMRMP home">
          <span className="font-display text-2xl font-bold tracking-tighter text-smrmp-gold">S.</span>
          <span className="text-xs font-semibold uppercase tracking-[0.3em]">Digital Custodians</span>
        </Link>

        <div className="hidden items-center gap-8 text-xs font-medium uppercase tracking-widest md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="nav-link" onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <Link to="/tickets/verify" className="nav-link text-smrmp-gold font-bold" onClick={closeMenu}>
            Verify Ticket
          </Link>
          <Link to="/login" className="nav-link" onClick={closeMenu}>
            Staff login
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tickets/verify"
            className="inline-flex items-center gap-2 border border-smrmp-gold/60 bg-smrmp-gold/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-smrmp-gold shadow-[0_0_15px_rgba(212,160,23,0.15)] transition-all duration-300 hover:bg-smrmp-gold hover:text-black"
            onClick={closeMenu}
          >
            <QrCodeIcon className="h-3.5 w-3.5" />
            <span>Verify Ticket</span>
          </Link>
          <a
            href="/#footer"
            className="hidden border border-white/20 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-smrmp-parchment transition-all duration-500 hover:bg-white hover:text-black lg:inline-flex"
          >
            Begin a pilot conversation
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-smrmp-parchment transition-colors hover:border-smrmp-gold hover:text-smrmp-gold md:hidden"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isOpen ? <XMarkIcon className="h-5 w-5" aria-hidden="true" /> : <Bars3Icon className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-navigation" className="mx-auto mt-4 max-w-7xl border-t border-white/10 pt-4 md:hidden">
          <div className="flex flex-col gap-4 text-xs font-medium uppercase tracking-widest">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="nav-link w-fit" onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <Link to="/tickets/verify" className="nav-link w-fit text-smrmp-gold font-bold flex items-center gap-1.5" onClick={closeMenu}>
              <QrCodeIcon className="h-4 w-4" />
              <span>Verify Ticket</span>
            </Link>
            <Link to="/login" className="nav-link w-fit text-smrmp-parchment" onClick={closeMenu}>
              Staff login
            </Link>
            <a href="/#footer" className="mt-2 w-fit text-smrmp-gold" onClick={closeMenu}>
              Begin a pilot conversation
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
