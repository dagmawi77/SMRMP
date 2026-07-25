import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';
import getApiErrorMessage from '../../utils/apiError';
import LandingFooter from '../landing/components/LandingFooter';
import LandingNav from '../landing/components/LandingNav';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';

export default function LoginPage() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!credentials.email.trim() || !credentials.password) {
      setErrorMessage('Enter your institutional email and password to continue.');
      return;
    }

    // Mirrors the API's own validation so the form answers before a round trip.
    if (credentials.password.length < 6) {
      setErrorMessage('Passwords are at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login(credentials);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'The email or password entered does not match an active staff account.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstitutionalAccount = () => {
    setErrorMessage('Institutional sign-in is unavailable in this environment.');
  };

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
          aria-labelledby="login-title"
          className="relative flex min-h-[calc(100vh-130px)] items-center justify-center overflow-hidden px-6 py-16 sm:py-24"
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
            className="absolute inset-0 bg-gradient-to-b from-smrmp-brown/95 via-smrmp-brown/85 to-smrmp-brown"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-smrmp-green/15 mix-blend-multiply" />

          <div className="relative z-10 mx-auto w-full max-w-md">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-6 h-px w-16 bg-smrmp-gold opacity-60" aria-hidden="true" />
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-smrmp-gold">
                Staff access
              </p>
              <h1
                id="login-title"
                className="font-display text-4xl tracking-tight sm:text-5xl"
              >
                Enter the <span className="italic">archive</span>
              </h1>
              <p className="mt-4 text-sm font-light leading-relaxed text-smrmp-parchment/70">
                Sign in to steward artifact records, review provenance, and keep the museum archive precise.
              </p>
            </div>

            <div className="glass-panel p-8 sm:p-10">
              <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-smrmp-gold">
                  Conservatory access
                </p>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-smrmp-parchment/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-smrmp-gold" aria-hidden="true" />
                  Internal
                </div>
              </div>

              {errorMessage && (
                <div
                  aria-live="polite"
                  className="mb-6 flex gap-3 border-l-2 border-smrmp-gold bg-black/30 px-4 py-3 text-sm leading-5 text-smrmp-parchment/90"
                  role="alert"
                >
                  <ExclamationCircleIcon
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-smrmp-gold"
                  />
                  <p>
                    <span className="font-semibold">Please review your details.</span>{' '}
                    {errorMessage}
                  </p>
                </div>
              )}

              <form className="space-y-5" noValidate onSubmit={handleSubmit}>
                <div>
                  <label
                    className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/80"
                    htmlFor="email"
                  >
                    Institutional email
                  </label>
                  <input
                    aria-describedby="email-help"
                    aria-invalid={Boolean(errorMessage)}
                    autoComplete="username"
                    className="h-12 w-full border border-white/15 bg-black/30 px-4 text-sm text-smrmp-parchment outline-none placeholder:text-smrmp-parchment/35 focus:border-smrmp-gold/50 focus:ring-2 focus:ring-smrmp-gold/25"
                    id="email"
                    name="email"
                    onChange={handleChange}
                    placeholder="name@institution.org"
                    type="email"
                    value={credentials.email}
                  />
                  <p className="mt-2 text-xs text-smrmp-parchment/50" id="email-help">
                    Use your museum-issued address.
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      className="block text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/80"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <button
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="flex items-center gap-1.5 text-xs font-semibold text-smrmp-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                      {showPassword ? (
                        <EyeSlashIcon aria-hidden="true" className="h-4 w-4" />
                      ) : (
                        <EyeIcon aria-hidden="true" className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <input
                    aria-invalid={Boolean(errorMessage)}
                    autoComplete="current-password"
                    className="h-12 w-full border border-white/15 bg-black/30 px-4 text-sm text-smrmp-parchment outline-none placeholder:text-smrmp-parchment/35 focus:border-smrmp-gold/50 focus:ring-2 focus:ring-smrmp-gold/25"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-smrmp-parchment/70">
                    <input
                      checked={rememberDevice}
                      className="h-4 w-4 accent-smrmp-gold focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                      onChange={(event) => setRememberDevice(event.target.checked)}
                      type="checkbox"
                    />
                    Remember this device
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs font-semibold text-smrmp-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                  >
                    Recover access
                  </button>
                </div>

                <button
                  className="group flex h-12 w-full items-center justify-center gap-3 bg-smrmp-gold px-5 text-xs font-bold uppercase tracking-widest text-black transition-colors duration-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold disabled:cursor-wait disabled:opacity-70"
                  disabled={isSubmitting}
                  type="submit"
                >
                  <span>{isSubmitting ? 'Checking details' : 'Enter conservatory'}</span>
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>

                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/40">
                    or
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <button
                  className="flex h-12 w-full items-center justify-center border border-white/25 px-4 text-xs font-bold uppercase tracking-widest text-smrmp-parchment transition-colors duration-500 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                  onClick={handleInstitutionalAccount}
                  type="button"
                >
                  Continue with institutional account
                </button>
              </form>

              <div className="mt-6 rounded-lg bg-smrmp-green/20 p-4 text-sm text-smrmp-parchment/80">
                <p className="mb-2 font-medium text-smrmp-gold">Demo accounts</p>
                <p>Admin: admin@smrmp.dev</p>
                <p>Curator: curator@smrmp.dev</p>
                <p>Password: Demo@2026!</p>
                <p className="mt-2 text-xs text-smrmp-parchment/60">
                  Requires <code className="text-smrmp-parchment/80">npm run auth:sync</code> (service role key).
                </p>
              </div>

              <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-smrmp-parchment/50">
                <span className="font-semibold text-smrmp-parchment/70">Protected archive access.</span>{' '}
                Your session is encrypted and monitored in accordance with conservatory handling policy.
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-smrmp-parchment/45">
              Not staff?{' '}
              <Link
                className="font-semibold text-smrmp-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                to="/register"
              >
                Create a visitor account
              </Link>
              {' · '}
              <Link
                className="font-semibold text-smrmp-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                to="/"
              >
                Return to the platform overview
              </Link>
            </p>
          </div>
        </section>
      </main>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />

      <LandingFooter />
    </div>
  );
}
