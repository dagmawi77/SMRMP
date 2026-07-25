/**
 * Exact Telebirr H5 Web Paygate clone (sandbox demo).
 * Mirrors Ethio telecom paygate screens: Confirm → PIN → Success.
 * Route: /tickets/telebirr/paygate
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TELEBIRR_RESULT_KEY,
  TELEBIRR_SESSION_KEY,
} from '../../utils/telebirrCheckout';

function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('251')) {
    return `+251 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.length === 10 && digits.startsWith('09')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

function TelebirrLogo({ className = 'h-10' }) {
  return (
    <img
      src="/telebirr-logo.svg"
      alt="telebirr"
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        const fallback = e.currentTarget.nextElementSibling;
        if (fallback) {
          fallback.classList.remove('hidden');
          fallback.classList.add('flex');
        }
      }}
    />
  );
}

function TelebirrLogoFallback() {
  return (
    <div className="hidden items-center gap-2" data-telebirr-fallback>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8DC63F] text-sm font-black text-white">
        t
      </span>
      <span className="text-2xl font-bold tracking-tight text-[#8DC63F]">telebirr</span>
    </div>
  );
}

function StatusBar({ title, onBack, showBack }) {
  return (
    <div className="flex h-12 items-center border-b border-[#E8E8E8] bg-white px-3">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mr-2 flex h-8 w-8 items-center justify-center rounded-full text-[#333] hover:bg-[#F5F5F5]"
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <span className="w-8" />
      )}
      <h1 className="flex-1 text-center text-[15px] font-semibold text-[#222]">{title}</h1>
      <span className="w-8" />
    </div>
  );
}

function ConfirmScreen({ checkout, phone, setPhone, onConfirm, onCancel }) {
  return (
    <div className="flex min-h-full flex-col bg-[#F7F7F7]">
      <StatusBar title="Confirm Payment" showBack onBack={onCancel} />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-col items-center bg-white px-6 pb-6 pt-8">
          <TelebirrLogo className="h-12 w-auto object-contain" />
          <TelebirrLogoFallback />
          <p className="mt-3 text-center text-xs text-[#888]">Secure payment by ethio telecom</p>
        </div>

        <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-[#F0F0F0] px-4 py-3.5">
            <p className="text-[11px] text-[#999]">Merchant</p>
            <p className="mt-0.5 text-sm font-semibold text-[#222]">{checkout.merchantName}</p>
          </div>
          <div className="border-b border-[#F0F0F0] px-4 py-3.5">
            <p className="text-[11px] text-[#999]">Payment for</p>
            <p className="mt-0.5 text-sm font-medium text-[#222]">{checkout.subject}</p>
          </div>
          <div className="border-b border-[#F0F0F0] px-4 py-3.5">
            <p className="text-[11px] text-[#999]">Order No.</p>
            <p className="mt-0.5 font-mono text-xs text-[#555]">{checkout.outTradeNo}</p>
          </div>
          <div className="px-4 py-4 text-center">
            <p className="text-[11px] uppercase tracking-wider text-[#999]">Amount</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-[#222]">
              {Number(checkout.amount).toFixed(2)}
              <span className="ml-1 text-base font-semibold text-[#666]">ETB</span>
            </p>
          </div>
        </div>

        <div className="mx-4 mt-4 rounded-xl bg-white px-4 py-3 shadow-sm">
          <label htmlFor="telebirr-phone" className="text-[11px] text-[#999]">
            telebirr account (phone number)
          </label>
          <input
            id="telebirr-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09XXXXXXXX"
            className="mt-1 w-full border-0 bg-transparent text-base font-semibold text-[#222] outline-none placeholder:font-normal placeholder:text-[#CCC]"
          />
        </div>

        <div className="mx-4 mt-3 rounded-lg border border-[#F5C518]/50 bg-[#FFF8E1] px-3 py-2">
          <p className="text-[11px] font-semibold text-[#8A6D00]">DEMO SANDBOX — No real money will be charged</p>
        </div>

        <div className="flex-1" />

        <div className="sticky bottom-0 border-t border-[#EDEDED] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!phone || phone.replace(/\D/g, '').length < 9}
            className="w-full rounded-full bg-[#8DC63F] py-3.5 text-[15px] font-bold text-white shadow-sm transition active:scale-[0.99] disabled:bg-[#C8E0A8]"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="mt-2 w-full py-2 text-sm font-medium text-[#888]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function PinScreen({ amount, phone, onBack, onSubmitPin }) {
  const [pin, setPin] = useState('');

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  const press = (key) => {
    if (key === '') return;
    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= 6) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 6) {
      setTimeout(() => onSubmitPin(next), 180);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-white">
      <StatusBar title="Payment Password" showBack onBack={onBack} />

      <div className="flex flex-1 flex-col px-6 pt-8">
        <p className="text-center text-sm text-[#666]">Please enter payment password</p>
        <p className="mt-2 text-center text-lg font-bold tabular-nums text-[#222]">
          {Number(amount).toFixed(2)} ETB
        </p>
        <p className="mt-1 text-center text-xs text-[#999]">{formatPhone(phone)}</p>

        <div className="mt-8 flex justify-center gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                i < pin.length ? 'border-[#8DC63F] bg-[#8DC63F]' : 'border-[#CCC] bg-transparent'
              }`}
            />
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-[#AAA]">
          Any 6-digit PIN works in demo mode
        </p>

        <div className="flex-1" />

        <div className="grid grid-cols-3 gap-px bg-[#E8E8E8] pb-[env(safe-area-inset-bottom)]">
          {keys.map((key, idx) => (
            <button
              key={`${key}-${idx}`}
              type="button"
              disabled={key === ''}
              onClick={() => press(key)}
              className={`flex h-14 items-center justify-center bg-white text-2xl font-medium text-[#222] active:bg-[#F0F0F0] disabled:bg-[#FAFAFA] ${
                key === 'del' ? 'text-base font-semibold text-[#666]' : ''
              }`}
            >
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcessingScreen() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-white px-6">
      <TelebirrLogo className="mb-8 h-10 w-auto object-contain" />
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#8DC63F] border-t-transparent" />
      <p className="mt-5 text-sm font-medium text-[#444]">Processing payment…</p>
      <p className="mt-1 text-xs text-[#999]">Please wait</p>
    </div>
  );
}

function SuccessScreen({ checkout, reference, onDone }) {
  return (
    <div className="flex min-h-full flex-col bg-[#F7F7F7]">
      <StatusBar title="Payment Result" showBack={false} />

      <div className="mx-4 mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex flex-col items-center px-6 pb-6 pt-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8DC63F]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-4 text-lg font-bold text-[#222]">Payment Successful</p>
          <p className="mt-1 text-xs text-[#999]">DEMO MODE — Simulated transaction</p>
          <p className="mt-5 text-3xl font-bold tabular-nums text-[#222]">
            {Number(checkout.amount).toFixed(2)}
            <span className="ml-1 text-base font-semibold text-[#666]">ETB</span>
          </p>
        </div>

        <div className="border-t border-[#F0F0F0] px-4 py-3">
          <div className="flex justify-between py-2 text-xs">
            <span className="text-[#999]">Merchant</span>
            <span className="max-w-[60%] truncate text-right font-medium text-[#333]">
              {checkout.merchantName}
            </span>
          </div>
          <div className="flex justify-between py-2 text-xs">
            <span className="text-[#999]">Payment for</span>
            <span className="max-w-[60%] truncate text-right font-medium text-[#333]">
              {checkout.subject}
            </span>
          </div>
          <div className="flex justify-between py-2 text-xs">
            <span className="text-[#999]">Reference</span>
            <span className="font-mono text-[10px] text-[#555]">{reference}</span>
          </div>
          <div className="flex justify-between py-2 text-xs">
            <span className="text-[#999]">Status</span>
            <span className="font-semibold text-[#8DC63F]">Completed</span>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onDone}
          className="w-full rounded-full bg-[#8DC63F] py-3.5 text-[15px] font-bold text-white shadow-sm active:scale-[0.99]"
        >
          Return to Merchant
        </button>
      </div>
    </div>
  );
}

export default function TelebirrPaygatePage() {
  const navigate = useNavigate();
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
  const [reference, setReference] = useState('');

  const returnPath = checkout?.returnPath || '/tickets';

  useEffect(() => {
    if (!checkout) {
      navigate('/tickets', { replace: true });
    }
  }, [checkout, navigate]);

  if (!checkout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-[#666]">
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
          ticket_type: checkout.ticket_type,
          quantity: checkout.quantity,
          visit_date: checkout.visit_date,
          visitor_name: checkout.visitor_name,
          visitor_phone: checkout.phone,
        },
      },
    });
  };

  const handlePinSubmit = async () => {
    setStep('processing');
    await new Promise((r) => setTimeout(r, 2200));
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
      ticket_type: checkout.ticket_type,
      quantity: checkout.quantity,
      visit_date: checkout.visit_date,
      label: 'DEMO MODE — No real payment processed',
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem(TELEBIRR_RESULT_KEY, JSON.stringify(result));
    sessionStorage.removeItem(TELEBIRR_SESSION_KEY);
    navigate(returnPath, { replace: true, state: { telebirrPaid: true } });
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#F7F7F7] font-sans antialiased">
      {/* Mobile paygate frame — matches Telebirr H5 viewport */}
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-[#F7F7F7] shadow-xl sm:my-0 sm:min-h-screen">
        {step === 'confirm' && (
          <ConfirmScreen
            checkout={checkout}
            phone={phone}
            setPhone={setPhone}
            onConfirm={() => setStep('pin')}
            onCancel={handleCancel}
          />
        )}
        {step === 'pin' && (
          <PinScreen
            amount={checkout.amount}
            phone={phone}
            onBack={() => setStep('confirm')}
            onSubmitPin={handlePinSubmit}
          />
        )}
        {step === 'processing' && <ProcessingScreen />}
        {step === 'success' && (
          <SuccessScreen checkout={checkout} reference={reference} onDone={handleDone} />
        )}
      </div>
    </div>
  );
}
