import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { authApi } from '../../api/authApi';
import useAuthStore from '../../store/authStore';
import getApiErrorMessage from '../../utils/apiError';
import LandingNav from '../landing/components/LandingNav';
import LandingFooter from '../landing/components/LandingFooter';
import toast from 'react-hot-toast';

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasValidToken, setHasValidToken] = useState(true);

  // Check if session or URL token is available on mount
  useEffect(() => {
    const checkSession = async () => {
      // Parse hash if present (#access_token=... or type=invite/recovery)
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          if (error) {
            console.warn('[AUTH] Error setting session from hash:', error.message);
          }
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        // If no active session or invite token found
        setHasValidToken(false);
      } else {
        setHasValidToken(true);
      }
    };

    checkSession();
  }, [location]);

  const passwordRules = [
    { key: 'length', label: 'At least 6 characters long', test: (p) => p.length >= 6 },
    { key: 'match', label: 'Passwords match', test: (p) => p && p === confirmPassword },
  ];

  const isValidPassword = passwordRules.every((r) => r.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!password) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Update password in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      // 2. Also call backend authApi update-password
      try {
        await authApi.updatePassword(password);
      } catch (backendErr) {
        console.warn('[AUTH] Backend sync for update-password notice:', backendErr.message);
      }

      // 3. Re-hydrate profile via /auth/me
      try {
        const meRes = await authApi.getMe();
        const userData = meRes.data?.data?.user;
        if (userData && data?.session) {
          setAuth(userData, data.session.access_token);
        }
      } catch (meErr) {
        console.warn('[AUTH] Profile rehydration:', meErr.message);
      }

      setSuccessMessage('Your new password has been set successfully!');
      toast.success('Password updated successfully!');

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to update password');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="site-shell min-h-screen overflow-x-clip bg-smrmp-brown text-smrmp-parchment">
      <div className="border-b border-white/5 bg-black/40 px-6 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-smrmp-parchment/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span>SMRMP / Security Portal</span>
          <span className="hidden text-right sm:inline">Adwa Victory Memorial Museum</span>
        </div>
      </div>

      <LandingNav />

      <main>
        <section
          aria-labelledby="set-password-title"
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

          <div className="relative z-10 mx-auto w-full max-w-md">
            <div className="mb-6 text-center">
              <h1
                id="set-password-title"
                className="font-display text-3xl tracking-tight sm:text-4xl"
              >
                Create <span className="italic">New Password</span>
              </h1>
              <p className="mt-3 text-sm font-light leading-relaxed text-smrmp-parchment/70">
                Establish a secure password for your museum staff account to sign in anytime.
              </p>
            </div>

            <div className="glass-panel p-8 sm:p-10">
              <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-smrmp-gold">
                  <ShieldCheckIcon className="h-4 w-4 text-smrmp-gold" />
                  <span>Account Security</span>
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-smrmp-parchment/50">
                  Staff Portal
                </div>
              </div>

              {!hasValidToken && !successMessage && (
                <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 leading-relaxed">
                  <p className="font-bold text-amber-300">Invite Link or Active Session Required</p>
                  <p className="mt-1">
                    If you received an email invitation, please click the link directly in your email. Alternatively, log in or request a new reset link below.
                  </p>
                </div>
              )}

              {successMessage ? (
                <div className="my-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-sm text-emerald-200 space-y-3 animate-in fade-in duration-300">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-400" />
                  <h3 className="font-bold text-lg text-white">Password Updated!</h3>
                  <p className="text-xs text-emerald-200/80 leading-relaxed">{successMessage}</p>
                  <p className="text-[11px] font-mono text-smrmp-gold pt-2">
                    Redirecting to Dashboard...
                  </p>
                </div>
              ) : (
                <form className="space-y-5" noValidate onSubmit={handleSubmit}>
                  {errorMessage && (
                    <div
                      className="flex gap-3 border-l-2 border-rose-500 bg-rose-950/40 p-4 text-xs text-rose-200"
                      role="alert"
                    >
                      <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                      <p>{errorMessage}</p>
                    </div>
                  )}

                  {/* New Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        className="block text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/80"
                        htmlFor="password"
                      >
                        New Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex items-center gap-1 text-xs font-semibold text-smrmp-gold hover:text-white"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                        {showPassword ? (
                          <EyeSlashIcon className="h-3.5 w-3.5" />
                        ) : (
                          <EyeIcon className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <KeyIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-smrmp-parchment/40" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="h-12 w-full border border-white/15 bg-black/30 pl-10 pr-4 text-sm text-smrmp-parchment outline-none placeholder:text-smrmp-parchment/35 focus:border-smrmp-gold/50 focus:ring-2 focus:ring-smrmp-gold/25"
                      />
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        className="block text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/80"
                        htmlFor="confirmPassword"
                      >
                        Confirm New Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="flex items-center gap-1 text-xs font-semibold text-smrmp-gold hover:text-white"
                      >
                        {showConfirmPassword ? 'Hide' : 'Show'}
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-3.5 w-3.5" />
                        ) : (
                          <EyeIcon className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <KeyIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-smrmp-parchment/40" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="h-12 w-full border border-white/15 bg-black/30 pl-10 pr-4 text-sm text-smrmp-parchment outline-none placeholder:text-smrmp-parchment/35 focus:border-smrmp-gold/50 focus:ring-2 focus:ring-smrmp-gold/25"
                      />
                    </div>
                  </div>

                  {/* Rules Check */}
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-gold">
                      Password Requirements
                    </p>
                    <div className="space-y-1">
                      {passwordRules.map((rule) => {
                        const ok = rule.test(password);
                        return (
                          <div
                            key={rule.key}
                            className={`flex items-center gap-2 text-xs ${
                              ok ? 'text-emerald-400 font-semibold' : 'text-smrmp-parchment/50'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-white/30'}`} />
                            <span>{rule.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !isValidPassword}
                    className="group flex h-12 w-full items-center justify-center gap-3 bg-smrmp-gold px-5 text-xs font-bold uppercase tracking-widest text-black transition-colors duration-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-smrmp-gold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Updating Password...' : 'Set New Password'}</span>
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              )}

              <div className="mt-6 border-t border-white/10 pt-4 text-center">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-smrmp-gold hover:text-white transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
