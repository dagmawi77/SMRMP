import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';
import getApiErrorMessage from '../../utils/apiError';
import LandingFooter from '../landing/components/LandingFooter';
import LandingNav from '../landing/components/LandingNav';
import { supabase } from '../../lib/supabase';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [isForgotMode, setIsForgotMode] = useState(false);

  // Login form state
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password form state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({
      ...current,
      [name]: value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!credentials.email.trim() || !credentials.password) {
      setErrorMessage('Please enter both your email address and password to continue.');
      return;
    }

    if (credentials.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
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
          'The email or password you entered is incorrect.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setResetError('');

    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setResetError('Please enter a valid email address.');
      return;
    }

    setIsResetting(true);

    try {
      const cleanEmail = resetEmail.trim().toLowerCase();
      const redirectUrl = `${window.location.origin}/set-password`;

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });
        if (error) console.warn('[AUTH] Supabase resetPassword error:', error.message);
      } catch (err) {
        console.warn('[AUTH] Supabase resetPassword exception:', err.message);
      }

      try {
        await authApi.forgotPassword(cleanEmail);
      } catch (err) {
        console.warn('[AUTH] Backend forgotPassword exception:', err.message);
      }

      setResetSuccess(true);
      toast.success('Password reset link sent.');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to request password reset');
      setResetError(msg);
    } finally {
      setIsResetting(false);
    }
  };

  const switchToForgot = () => {
    setIsForgotMode(true);
    setErrorMessage('');
    setResetError('');
    setResetSuccess(false);
  };

  const switchToLogin = () => {
    setIsForgotMode(false);
    setErrorMessage('');
    setResetError('');
    setResetSuccess(false);
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
          className="relative flex min-h-[calc(100vh-130px)] items-start justify-center overflow-hidden px-6 pt-6 pb-12 sm:pt-10 sm:pb-16"
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
            {/* Page Header */}
            <div className="mb-6 text-center">
              <h1
                id="login-title"
                className="font-display text-4xl tracking-tight sm:text-5xl"
              >
                {isForgotMode ? (
                  <>Reset your <span className="italic">password</span></>
                ) : (
                  <>Welcome <span className="italic">back</span></>
                )}
              </h1>
              <p className="mt-3 text-sm font-light leading-relaxed text-smrmp-parchment/70">
                {isForgotMode
                  ? 'We will send you a link to reset your password and recover your account.'
                  : 'Sign in to manage museum collections, exhibits, and operations.'}
              </p>
            </div>

            {/* Main Card */}
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-8 sm:p-10">
              <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-smrmp-gold">
                  {isForgotMode ? 'Password Reset' : 'Account Sign In'}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-smrmp-parchment/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-smrmp-gold" aria-hidden="true" />
                  Secure
                </div>
              </div>

              {/* FORGOT PASSWORD FORM */}
              {isForgotMode ? (
                <div>
                  {resetSuccess ? (
                    <div className="space-y-5 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
                        <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                      </div>
                      <h2 className="text-lg font-medium text-smrmp-parchment">Check your email</h2>
                      <p className="text-xs leading-relaxed text-smrmp-parchment/70">
                        We sent a password reset link to <span className="font-semibold text-smrmp-gold">{resetEmail}</span>. Click the link in your email to choose a new password.
                      </p>
                      <button
                        type="button"
                        onClick={switchToLogin}
                        className="mt-4 inline-flex h-11 w-full items-center justify-center bg-smrmp-gold px-5 text-xs font-bold uppercase tracking-widest text-black transition-colors duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  ) : (
                    <form className="space-y-5" noValidate onSubmit={handleResetSubmit}>
                      {resetError && (
                        <div
                          aria-live="polite"
                          className="flex gap-3 border-l-2 border-smrmp-gold bg-black/30 px-4 py-3 text-sm leading-5 text-smrmp-parchment/90"
                          role="alert"
                        >
                          <ExclamationCircleIcon
                            aria-hidden="true"
                            className="mt-0.5 h-5 w-5 shrink-0 text-smrmp-gold"
                          />
                          <p>{resetError}</p>
                        </div>
                      )}

                      <div>
                        <label
                          className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/80"
                          htmlFor="reset-email"
                        >
                          Email address
                        </label>
                        <div className="relative flex items-center">
                          <input
                            id="reset-email"
                            type="email"
                            autoComplete="email"
                            value={resetEmail}
                            onChange={(e) => {
                              setResetEmail(e.target.value);
                              if (resetError) setResetError('');
                            }}
                            placeholder="name@example.com"
                            className="h-12 w-full border border-white/15 bg-black/30 px-4 text-sm text-smrmp-parchment outline-none placeholder:text-smrmp-parchment/35 focus:border-smrmp-gold/50 focus:ring-2 focus:ring-smrmp-gold/25"
                          />
                        </div>
                        <p className="mt-2 text-xs text-smrmp-parchment/50">
                          Enter the email associated with your account.
                        </p>
                      </div>

                      <button
                        className="group flex h-12 w-full items-center justify-center gap-3 bg-smrmp-gold px-5 text-xs font-bold uppercase tracking-widest text-black transition-colors duration-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold disabled:cursor-wait disabled:opacity-70"
                        disabled={isResetting}
                        type="submit"
                      >
                        <span>{isResetting ? 'Sending link...' : 'Send Reset Link'}</span>
                        <ArrowRightIcon
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </button>

                      <div className="pt-2 text-center text-xs text-smrmp-parchment/70">
                        <span>Remembered your password? </span>
                        <button
                          type="button"
                          onClick={switchToLogin}
                          className="font-semibold text-smrmp-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* LOGIN FORM */
                <form className="space-y-5" noValidate onSubmit={handleLoginSubmit}>
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

                  <div>
                    <label
                      className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/80"
                      htmlFor="email"
                    >
                      Email address
                    </label>
                    <input
                      aria-describedby="email-help"
                      aria-invalid={Boolean(errorMessage)}
                      autoComplete="username"
                      className="h-12 w-full border border-white/15 bg-black/30 px-4 text-sm text-smrmp-parchment outline-none placeholder:text-smrmp-parchment/35 focus:border-smrmp-gold/50 focus:ring-2 focus:ring-smrmp-gold/25"
                      id="email"
                      name="email"
                      onChange={handleLoginChange}
                      placeholder="name@example.com"
                      type="email"
                      value={credentials.email}
                    />
                    <p className="mt-2 text-xs text-smrmp-parchment/50" id="email-help">
                      Enter your registered email address.
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
                      onChange={handleLoginChange}
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
                      onClick={switchToForgot}
                      className="text-xs font-semibold text-smrmp-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    className="group flex h-12 w-full items-center justify-center gap-3 bg-smrmp-gold px-5 text-xs font-bold uppercase tracking-widest text-black transition-colors duration-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold disabled:cursor-wait disabled:opacity-70"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                    <ArrowRightIcon
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </button>

                  <div className="pt-2 text-center text-xs text-smrmp-parchment/70">
                    <span>Don&apos;t have an account? </span>
                    <Link
                      className="font-semibold text-smrmp-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                      to="/register"
                    >
                      Create an account
                    </Link>
                  </div>
                </form>
              )}

              {!isForgotMode && (
                <div className="mt-6 rounded-lg bg-smrmp-green/20 p-4 text-sm text-smrmp-parchment/80">
                  <p className="mb-2 font-medium text-smrmp-gold">Demo accounts</p>
                  <p>Admin: admin@smrmp.dev</p>
                  <p>Curator: curator@smrmp.dev</p>
                  <p>Password: Demo@2026!</p>
                  <p className="mt-2 text-xs text-smrmp-parchment/60">
                    Requires <code className="text-smrmp-parchment/80">npm run auth:sync</code> (service role key).
                  </p>
                </div>
              )}

              <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-smrmp-parchment/50">
                <span className="font-semibold text-smrmp-parchment/70">Protected & Secure.</span>{' '}
                Your connection is encrypted and secured with modern authentication protocols.
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-smrmp-parchment/45">
              <Link
                className="font-semibold text-smrmp-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                to="/"
              >
                Back to home
              </Link>
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
