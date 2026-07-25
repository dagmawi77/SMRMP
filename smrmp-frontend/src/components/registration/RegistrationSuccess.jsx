import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import PublicAuthShell from '../layout/PublicAuthShell';

export default function RegistrationSuccess({ visitorName, t }) {
  return (
    <PublicAuthShell>
      <section className="relative flex min-h-[calc(100vh-130px)] items-center justify-center px-6 py-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1686806372726-388d03ff49c8?auto=format&w=1280&q=80&fit=crop')",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-smrmp-brown/95 via-smrmp-brown/85 to-smrmp-brown"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-smrmp-green/15 mix-blend-multiply" />

        <div className="glass-panel relative z-10 mx-auto w-full max-w-lg p-8 text-center sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-smrmp-green/30">
            <CheckCircleIcon className="h-10 w-10 text-smrmp-gold" aria-hidden="true" />
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-smrmp-gold">{t.success.title}</p>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            {t.success.welcome}
            ,
            {' '}
            <span className="italic text-smrmp-gold">{visitorName}</span>
            !
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-smrmp-parchment/70">{t.success.verify}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              state={{ message: 'Sign in to open your Visitor Portal.' }}
              className="inline-flex h-12 items-center justify-center bg-smrmp-gold px-6 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
            >
              {t.buttons.goLogin}
            </Link>
            <Link
              to="/"
              className="inline-flex h-12 items-center justify-center border border-white/25 px-6 text-xs font-bold uppercase tracking-widest text-smrmp-parchment transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
            >
              {t.buttons.home}
            </Link>
          </div>
        </div>
      </section>
    </PublicAuthShell>
  );
}
