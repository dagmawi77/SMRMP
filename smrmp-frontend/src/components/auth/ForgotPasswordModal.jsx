import { useState } from 'react';
import { EnvelopeIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { authApi } from '../../api/authApi';
import getApiErrorMessage from '../../utils/apiError';
import toast from 'react-hot-toast';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid institutional email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const redirectUrl = `${window.location.origin}/set-password`;

      // Trigger Supabase reset password email
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });
        if (error) {
          console.warn('[AUTH] Supabase resetPasswordForEmail error:', error.message);
        }
      } catch (supabaseErr) {
        console.warn('[AUTH] Supabase resetPasswordForEmail exception:', supabaseErr.message);
      }

      // Also trigger backend authApi
      try {
        await authApi.forgotPassword(cleanEmail);
      } catch (backendErr) {
        console.warn('[AUTH] Backend forgotPassword exception:', backendErr.message);
      }

      setIsSent(true);
      toast.success('Password reset link dispatched to your email.');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to request password reset');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsSent(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Recover Access / Reset Password"
      size="md"
    >
      <div className="space-y-4">
        {isSent ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/80 p-6 text-center text-xs text-emerald-900 space-y-3">
            <CheckCircleIcon className="mx-auto h-10 w-10 text-emerald-600" />
            <p className="font-bold text-sm text-[#2B1B12]">Check Your Email Inbox</p>
            <p className="text-[#5C4233] leading-relaxed">
              A secure password reset link has been dispatched to <span className="font-bold">{email}</span>. Click the link in your email to create a new password.
            </p>
            <div className="pt-2">
              <Button variant="secondary" onClick={handleClose}>
                Close Window
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-[#5C4233] leading-relaxed">
              Enter your institutional email address below. We will send you an official link to establish a new password.
            </p>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <ExclamationCircleIcon className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Input
              label="Institutional Email Address"
              type="email"
              placeholder="e.g. name@adwamuseum.gov.et"
              icon={EnvelopeIcon}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2D6C5]">
              <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
