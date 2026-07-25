/**
 * Telebirr Web Paygate Checkout (UI matched with Ticket Purchase Page).
 * Route: /tickets/telebirr/paygate
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  TELEBIRR_RESULT_KEY,
  TELEBIRR_SESSION_KEY,
} from '../../utils/telebirrCheckout';
import PublicSiteShell from '../../components/layout/PublicSiteShell';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import usePortalEmbed from '../../hooks/usePortalEmbed';
import { formatCurrency } from '../../utils/formatters';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function TelebirrPaygatePage() {
  const navigate = useNavigate();
  const embedded = usePortalEmbed();

  const checkout = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(TELEBIRR_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [step, setStep] = useState('confirm'); // confirm | pin | processing | success
  const [phone, setPhone] = useState(checkout?.phone || '');
  const [pin, setPin] = useState('');
  const [reference, setReference] = useState('');

  const returnPath = checkout?.returnPath || '/tickets';

  useEffect(() => {
    if (!checkout) {
      navigate('/tickets', { replace: true });
    }
  }, [checkout, navigate]);

  if (!checkout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6F0] text-sm text-[#6E5445]">
        Redirecting…
      </div>
    );
  }

  const handleCancel = () => {
    sessionStorage.removeItem(TELEBIRR_SESSION_KEY);
    navigate(returnPath, {
      replace: true,
      state: {
        telebirrCancelled: true,
        restore: {
          booking_type: checkout.booking_type || 'individual',
          ticket_type: checkout.ticket_type,
          quantity: checkout.quantity,
          visit_date: checkout.visit_date,
          visitor_name: checkout.visitor_name,
          visitor_phone: checkout.phone,
          group_data: checkout.group_data,
        },
      },
    });
  };

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
    await new Promise((r) => setTimeout(r, 1500));
    const ref = `DEMO-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setReference(ref);
    setStep('success');
  };

  const handleDone = () => {
    const result = {
      success: true,
      sandbox_mode: true,
      reference_number: reference,
      status: 'completed',
      amount: checkout.amount,
      phone,
      visitor_name: checkout.visitor_name,
      visitor_phone: phone,
      payment_method: 'telebirr',
      booking_type: checkout.booking_type || 'individual',
      ticket_type: checkout.ticket_type,
      quantity: checkout.quantity,
      visit_date: checkout.visit_date,
      group_data: checkout.group_data,
      label: 'DEMO MODE — Payment processed',
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem(TELEBIRR_RESULT_KEY, JSON.stringify(result));
    sessionStorage.removeItem(TELEBIRR_SESSION_KEY);
    navigate(returnPath, { replace: true, state: { telebirrPaid: true } });
  };

  const wrap = (node, { title, description, maxWidth = 'max-w-2xl' } = {}) => {
    if (embedded) {
      return (
        <div className={maxWidth}>
          <PortalPageHeader
            title={title}
            description={description}
            parentTo="/portal/tickets"
            backLabel="Back to Tickets"
            showBack={true}
          />
          {node}
        </div>
      );
    }
    return (
      <PublicSiteShell
        subtitle="Ticketing & Bookings"
        pageTitle={title}
        pageDescription={description}
        parentTo="/portal/tickets"
        backLabel="Back to Tickets"
        showBack={true}
        contentClassName={maxWidth}
      >
        {node}
      </PublicSiteShell>
    );
  };

  const steps = ['1. Details & Contact', '2. Telebirr Payment', '3. Pass Issued'];

  return wrap(
    <>
      {/* Step Progress Bar — identical to TicketPurchasePage */}
      <div className="mb-8 flex items-center justify-center gap-3 sm:gap-6">
        {steps.map((label, i) => {
          const isDone = step === 'success' ? i <= 2 : i < 1;
          const isCurrent = step === 'success' ? i === 2 : i === 1;
          return (
            <div
              key={label}
              className={`flex items-center gap-2 text-xs font-bold ${
                isDone
                  ? 'text-[#374B07]'
                  : isCurrent
                  ? 'text-[#2B1B12]'
                  : 'text-[#887060]'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isDone || isCurrent
                    ? 'bg-gradient-to-br from-smrmp-green to-smrmp-deep-green text-white shadow-xs'
                    : 'border border-[#D8C8B8] bg-[#EFE5D8] text-[#7C4A2D]'
                }`}
              >
                {isDone ? (
                  <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  i + 1
                )}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Main Card Box — identical container style */}
      <div className="rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-6 shadow-md sm:p-8">
        {step === 'confirm' && (
          <form onSubmit={handleConfirmPhone} className="space-y-5">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Back to ticket selection</span>
            </button>

            <Alert variant="warning" title="SANDBOX DEMO MODE">
              Telebirr H5 paygate checkout simulation. No real money will be charged.
            </Alert>

            {/* Telebirr Banner */}
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

            {/* Order Details Breakdown */}
            <dl className="space-y-2 rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 text-xs divide-y divide-[#E2D6C5]/60">
              <div className="flex justify-between pt-2 first:pt-0">
                <dt className="text-[#6E5445]">Merchant</dt>
                <dd className="font-bold text-[#2B1B12]">{checkout.merchantName}</dd>
              </div>
              <div className="flex justify-between pt-2">
                <dt className="text-[#6E5445]">Payment For</dt>
                <dd className="font-semibold text-[#2B1B12] max-w-[220px] truncate text-right">
                  {checkout.subject}
                </dd>
              </div>
              <div className="flex justify-between pt-2">
                <dt className="font-bold text-[#2B1B12]">Total Payable</dt>
                <dd className="font-display text-lg font-bold text-[#374B07]">
                  {formatCurrency(checkout.amount)}
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

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
            >
              <CreditCardIcon className="h-4 w-4" />
              <span>Continue to PIN Entry — {formatCurrency(checkout.amount)}</span>
            </Button>
          </form>
        )}

        {step === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-5">
            <button
              type="button"
              onClick={() => setStep('confirm')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Back to phone confirmation</span>
            </button>

            <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-5 text-center space-y-2">
              <p className="text-xs font-semibold text-[#6E5445]">Enter Payment Password (PIN)</p>
              <p className="font-display text-2xl font-bold text-[#374B07]">
                {formatCurrency(checkout.amount)}
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

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
            >
              Confirm &amp; Pay {formatCurrency(checkout.amount)}
            </Button>
          </form>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-smrmp-green border-t-transparent" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#2B1B12]">Processing Payment…</p>
              <p className="text-xs text-[#6E5445]">Connecting to Telebirr paygate server</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-4 text-center space-y-5">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-600" />
            <div>
              <h3 className="font-display text-xl font-bold text-[#2B1B12]">Payment Successful!</h3>
              <p className="text-xs text-[#6E5445] mt-1">Confirmed via telebirr sandbox</p>
            </div>

            <dl className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 text-xs text-left space-y-2">
              <div className="flex justify-between border-b border-[#E2D6C5]/40 pb-2">
                <dt className="text-[#6E5445]">Amount Paid</dt>
                <dd className="font-bold text-[#374B07]">{formatCurrency(checkout.amount)}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="text-[#6E5445]">Transaction Reference</dt>
                <dd className="font-mono font-bold text-[#7C4A2D]">{reference}</dd>
              </div>
            </dl>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleDone}
            >
              View Issued Pass / Return to Booking
            </Button>
          </div>
        )}
      </div>
    </>,
    {
      title: 'Telebirr payment checkout',
      description: 'Instant digital pass issuance via telebirr paygate',
    }
  );
}
