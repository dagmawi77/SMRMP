/**
 * Telebirr Paygate Inline Component.
 * Renders the Telebirr payment steps (Confirm Phone -> PIN -> Processing) directly in place.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import { formatCurrency } from '../../utils/formatters';
import { MUSEUM_NAME } from '../../utils/constants';
import {
  ArrowLeftIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function TelebirrPaygateInline({
  amount,
  subject,
  initialPhone = '',
  onSuccess,
  onCancel,
}) {
  const [step, setStep] = useState('confirm'); // 'confirm' | 'pin' | 'processing'
  const [phone, setPhone] = useState(initialPhone);
  const [pin, setPin] = useState('');

  const handleConfirmPhone = (e) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      toast.error('Please enter your 4-6 digit PIN');
      return;
    }
    setStep('processing');
    await new Promise((r) => setTimeout(r, 1200));
    const ref = `DEMO-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    onSuccess(ref, phone);
  };

  if (step === 'confirm') {
    return (
      <form onSubmit={handleConfirmPhone} className="space-y-5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline cursor-pointer"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        <Alert variant="warning" title="SANDBOX DEMO MODE">
          Telebirr H5 paygate checkout simulation. No real money will be charged.
        </Alert>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#8DC63F]/40 bg-[#F3F9EB] p-4">
          <div className="flex items-center gap-3">
            <img src="/telebirr-logo.svg" alt="telebirr" className="h-8 w-auto object-contain" />
            <div>
              <p className="text-xs font-bold text-[#5A7A20]">telebirr Web Checkout</p>
              <p className="text-[11px] text-[#3D4F28]">Secure payment by ethio telecom</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5A7A20]">
            <ShieldCheckIcon className="h-4 w-4" /> SSL
          </span>
        </div>

        <dl className="space-y-2 rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 text-xs divide-y divide-[#E2D6C5]/60">
          <div className="flex justify-between pt-2 first:pt-0">
            <dt className="text-[#6E5445]">Merchant</dt>
            <dd className="font-bold text-[#2B1B12]">{MUSEUM_NAME}</dd>
          </div>
          <div className="flex justify-between pt-2">
            <dt className="text-[#6E5445]">Payment For</dt>
            <dd className="font-semibold text-[#2B1B12] max-w-[220px] truncate text-right">
              {subject}
            </dd>
          </div>
          <div className="flex justify-between pt-2">
            <dt className="font-bold text-[#2B1B12]">Total Payable</dt>
            <dd className="font-display text-lg font-bold text-[#374B07]">
              {formatCurrency(amount)}
            </dd>
          </div>
        </dl>

        <Input
          label="Telebirr Mobile Phone Number *"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="09XXXXXXXX"
          required
        />

        <Button type="submit" variant="gold" size="lg" className="w-full">
          <CreditCardIcon className="h-4 w-4" />
          <span>Continue to PIN Entry — {formatCurrency(amount)}</span>
        </Button>
      </form>
    );
  }

  if (step === 'pin') {
    return (
      <form onSubmit={handlePinSubmit} className="space-y-5">
        <button
          type="button"
          onClick={() => setStep('confirm')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline cursor-pointer"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>Back to phone confirmation</span>
        </button>

        <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-5 text-center space-y-2">
          <p className="text-xs font-semibold text-[#6E5445]">Enter Telebirr PIN Password</p>
          <p className="font-display text-2xl font-bold text-[#374B07]">
            {formatCurrency(amount)}
          </p>
          <p className="text-xs font-mono font-bold text-[#7C4A2D]">{phone}</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#5C4233] text-center uppercase tracking-wider">
            Telebirr PIN (4-6 digits)
          </label>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••••"
            autoFocus
            className="w-full text-center tracking-[0.6em] rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-3.5 text-xl font-bold text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20 transition-all"
            required
          />
        </div>

        <p className="text-center text-[11px] text-[#8C7467] flex items-center justify-center gap-1">
          <SparklesIcon className="h-3.5 w-3.5 text-amber-600" /> Any 4-6 digit PIN works in demo mode.
        </p>

        <Button type="submit" variant="gold" size="lg" className="w-full">
          Confirm &amp; Pay {formatCurrency(amount)}
        </Button>
      </form>
    );
  }

  if (step === 'processing') {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-smrmp-green border-t-transparent" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#2B1B12]">Processing Telebirr Payment…</p>
          <p className="text-xs text-[#6E5445]">Connecting to Telebirr paygate server</p>
        </div>
      </div>
    );
  }

  return null;
}
