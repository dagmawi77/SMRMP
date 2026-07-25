import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import {
  TELEBIRR_SESSION_KEY,
  buildTelebirrCheckoutSession,
} from '../../utils/telebirrCheckout';
import { PAYMENT_METHODS, MUSEUM_NAME } from '../../utils/constants';
import { CreditCardIcon } from '@heroicons/react/24/outline';

export default function PaymentFlow({
  onSubmit,
  loading,
  totalAmount,
  ticketType,
  quantity,
  visitDate,
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    visitor_name: '',
    visitor_phone: '',
    payment_method: 'telebirr',
  });
  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Exact Telebirr H5 paygate redirect (sandbox clone)
    if (form.payment_method === 'telebirr') {
      const session = buildTelebirrCheckoutSession({
        amount: totalAmount,
        phone: form.visitor_phone,
        visitor_name: form.visitor_name,
        ticket_type: ticketType,
        quantity,
        visit_date: visitDate,
        merchantName: MUSEUM_NAME,
      });
      sessionStorage.setItem(TELEBIRR_SESSION_KEY, JSON.stringify(session));
      navigate('/tickets/telebirr/paygate');
      return;
    }

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setProcessing(false);
    onSubmit(form);
  };

  const isProcessing = processing || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Alert variant="warning" title="SANDBOX DEMO MODE">
        Telebirr opens the exact H5 paygate checkout pages (Confirm → PIN → Success). No real
        money is charged.
      </Alert>

      <Input
        label="Full Name *"
        name="visitor_name"
        value={form.visitor_name}
        onChange={handleChange}
        placeholder="e.g. Abebe Bikila"
        required
      />
      <Input
        label="Phone Number *"
        name="visitor_phone"
        type="tel"
        placeholder="09XXXXXXXX"
        value={form.visitor_phone}
        onChange={handleChange}
        required
      />
      <Select
        label="Payment Provider"
        name="payment_method"
        options={PAYMENT_METHODS}
        value={form.payment_method}
        onChange={handleChange}
      />

      {form.payment_method === 'telebirr' && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#8DC63F]/40 bg-[#F3F9EB] px-4 py-3">
          <img src="/telebirr-logo.svg" alt="" className="mt-0.5 h-7 w-auto object-contain" />
          <div>
            <p className="text-xs font-bold text-[#5A7A20]">Redirect to telebirr paygate</p>
            <p className="mt-0.5 text-[11px] text-[#3D4F28]">
              You will leave this page and open the Telebirr Confirm Payment → PIN → Result screens.
            </p>
          </div>
        </div>
      )}

      {isProcessing && form.payment_method !== 'telebirr' && (
        <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-6 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-smrmp-green border-t-transparent" />
          <p className="mt-3 text-xs font-bold text-[#2B1B12]">Processing payment…</p>
        </div>
      )}

      <Button
        type="submit"
        variant="gold"
        size="lg"
        className="w-full"
        loading={isProcessing}
        disabled={!form.visitor_name || !form.visitor_phone}
      >
        <CreditCardIcon className="h-4 w-4" />
        <span>
          {form.payment_method === 'telebirr'
            ? `Pay with telebirr — ${totalAmount ? `${totalAmount} ETB` : ''}`
            : `Confirm Payment — ${totalAmount ? `${totalAmount} ETB` : ''}`}
        </span>
      </Button>
    </form>
  );
}
