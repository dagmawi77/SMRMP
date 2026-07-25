import { useState } from 'react';
import { RegistrationUiProvider, useRegistrationUi } from '../../context/RegistrationUiContext';
import LandingFooter from '../landing/components/LandingFooter';
import LandingNav from '../landing/components/LandingNav';
import RegistrationForm from '../../components/registration/RegistrationForm';
import RegistrationSuccess from '../../components/registration/RegistrationSuccess';

function RegistrationPageContent() {
  const { t } = useRegistrationUi();
  const [registeredName, setRegisteredName] = useState(null);

  if (registeredName) {
    return <RegistrationSuccess visitorName={registeredName} t={t} />;
  }

  return (
    <div className="site-shell min-h-screen overflow-x-clip bg-smrmp-brown text-smrmp-parchment">
      <div className="border-b border-white/5 bg-black/40 px-6 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-smrmp-parchment/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span>SMRMP / Pilot Edition</span>
          <span className="hidden text-right sm:inline">Reference deployment: Adwa Victory Memorial Museum</span>
        </div>
      </div>

      <LandingNav />

      <main>
        <section
          aria-labelledby="registration-title"
          className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:px-8 min-h-[calc(100vh-140px)] flex items-center justify-center"
        >
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
            className="absolute inset-0 bg-gradient-to-b from-smrmp-brown/95 via-smrmp-brown/90 to-smrmp-brown"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-smrmp-green/15 mix-blend-multiply" />

          <div className="relative z-10 mx-auto w-full max-w-xl">
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="mb-8 border-b border-white/10 pb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-smrmp-gold">Visitor access</p>
                  <h1
                    id="registration-title"
                    className="mt-2 font-display text-3xl font-bold tracking-tight text-smrmp-parchment sm:text-4xl"
                  >
                    {t.pageTitle}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-smrmp-parchment/70">{t.welcome}</p>
                </div>
              </div>

              <RegistrationForm onSuccess={setRegisteredName} />
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default function VisitorRegistrationPage() {
  return (
    <RegistrationUiProvider>
      <RegistrationPageContent />
    </RegistrationUiProvider>
  );
}
