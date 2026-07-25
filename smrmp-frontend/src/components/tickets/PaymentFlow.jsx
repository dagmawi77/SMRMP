import { useState } from 'react';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { PAYMENT_METHODS } from '../../utils/constants';
import { CreditCardIcon } from '@heroicons/react/24/outline';

export default function PaymentFlow({ onSubmit, loading, totalAmount }) {
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
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setProcessing(false);
    onSubmit(form);
  };

  const isProcessing = processing || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Alert variant="warning" title="SANDBOX DEMO MODE">
        No actual financial transactions will be initiated. This simulates the payment checkout process.
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
        placeholder="+251 9XX XXX XXX"
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

      {isProcessing && (
        <div className="rounded-2xl bg-[#FFFDF9] p-6 text-center border border-[#E2D6C5]">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-smrmp-green border-t-transparent" />
          <p className="mt-3 text-xs font-bold text-[#2B1B12]">Connecting to Telebirr gateway...</p>
          <p className="text-[11px] text-[#6E5445] mt-1">Generating digital verification hash</p>
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
        <span>Confirm Payment — {totalAmount ? `${totalAmount} ETB` : ''}</span>
      </Button>
    </form>
  );
}
