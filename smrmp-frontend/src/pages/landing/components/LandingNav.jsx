import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import Logo from '../../../components/ui/Logo';

const navItems = [
  { label: 'Exhibitions', href: '/#exhibitions' },
];

export default function LandingNav() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-smrmp-brown/90 px-6 py-4 backdrop-blur-md" aria-label="Primary navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-4" onClick={closeMenu} aria-label="SMRMP home">
            <Logo className="h-10 w-auto" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em]">Digital Custodians</span>
          </Link>

          <div className="hidden items-center gap-8 text-xs font-medium uppercase tracking-widest md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="nav-link" onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <Link to="/login" className="nav-link" onClick={closeMenu}>
              Sign in
            </Link>
            <Link to="/register" className="nav-link" onClick={closeMenu}>
              Visitor register
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tickets/verify"
            className="inline-flex items-center gap-2 border border-smrmp-gold/60 bg-smrmp-gold/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-smrmp-gold shadow-[0_0_15px_rgba(212,160,23,0.15)] transition-all duration-300 hover:bg-smrmp-gold hover:text-black"
            onClick={closeMenu}
            title="Staff gate verification"
          >
            <QrCodeIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Gate verify</span>
          </Link>
          <Link
            to="/login"
            className="hidden border border-white/20 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-smrmp-parchment transition-all duration-500 hover:bg-white hover:text-black sm:inline-flex"
            onClick={closeMenu}
          >
            Get started
          </Link>
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

      {isOpen ? (
        <div id="mobile-navigation" className="mx-auto mt-4 max-w-7xl border-t border-white/10 pt-4 md:hidden">
          <div className="flex flex-col gap-4 text-xs font-medium uppercase tracking-widest">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="nav-link w-fit" onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <Link to="/login" className="nav-link w-fit" onClick={closeMenu}>
              Sign in
            </Link>
            <Link to="/register" className="nav-link w-fit" onClick={closeMenu}>
              Visitor register
            </Link>
            <Link
              to="/tickets/verify"
              className="nav-link flex w-fit items-center gap-1.5 text-smrmp-gold"
              onClick={closeMenu}
            >
              <QrCodeIcon className="h-4 w-4" aria-hidden="true" />
              <span>Gate verify</span>
            </Link>
            <Link to="/login" className="nav-link w-fit text-smrmp-parchment" onClick={closeMenu}>
              Get started
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
