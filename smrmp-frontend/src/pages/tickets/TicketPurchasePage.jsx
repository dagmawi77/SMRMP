import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import TicketSelector from '../../components/tickets/TicketSelector';
import PaymentFlow from '../../components/tickets/PaymentFlow';
import DigitalTicket from '../../components/tickets/DigitalTicket';
import Button from '../../components/ui/Button';
import { ticketApi } from '../../api/ticketApi';
import { MUSEUM_NAME } from '../../utils/constants';
import { ArrowLeftIcon, BuildingLibraryIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function TicketPurchasePage() {
  const [step, setStep] = useState(1);
  const [ticketType, setTicketType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [visitDate, setVisitDate] = useState('');
  const [purchasedTicket, setPurchasedTicket] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: types } = useQuery({
    queryKey: ['ticket-types'],
    queryFn: () => ticketApi.getTypes(),
    select: (res) => res.data.data.ticket_types,
  });

  const selectedType = types?.find((t) => t.type === ticketType);
  const totalAmount = selectedType ? selectedType.price_etb * quantity : 0;

  const handlePurchase = async (visitorInfo) => {
    setLoading(true);
    try {
      const res = await ticketApi.purchase({
        ticket_type: ticketType,
        quantity,
        visit_date: visitDate,
        ...visitorInfo,
      });
      setPurchasedTicket(res.data.data.ticket);
      setPaymentInfo(res.data.data.payment_simulation);
      setStep(3);
      toast.success('Ticket purchased successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  if (purchasedTicket) {
    return (
      <div className="visitor-shell min-h-screen bg-smrmp-parchment py-10 font-sans text-[#2B1B12]">
        <div className="mx-auto max-w-lg px-4">
          <DigitalTicket ticket={purchasedTicket} paymentInfo={paymentInfo} />
          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#374B07] hover:underline">
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Return to Museum Portal Overview</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="visitor-shell min-h-screen bg-smrmp-parchment font-sans text-[#2B1B12]">
      <header className="bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] px-6 py-8 text-smrmp-parchment shadow-md border-b border-smrmp-gold/30">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 text-smrmp-gold text-xs font-bold uppercase tracking-widest mb-1">
            <BuildingLibraryIcon className="h-4 w-4" />
            <span>{MUSEUM_NAME}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Purchase Museum Entry Passes
          </h1>
          <p className="mt-1 text-xs text-smrmp-parchment/75">Instant digital pass issuance & QR validation</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Step Indicators */}
        <div className="mb-8 flex justify-center items-center gap-3 sm:gap-6">
          {['1. Select Pass', '2. Payment', '3. Pass Issued'].map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-2 text-xs font-bold ${
                step > i + 1 ? 'text-[#374B07]' : step === i + 1 ? 'text-[#2B1B12]' : 'text-[#887060]'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step >= i + 1
                    ? 'bg-gradient-to-br from-smrmp-green to-smrmp-deep-green text-white shadow-xs'
                    : 'bg-[#EFE5D8] text-[#7C4A2D] border border-[#D8C8B8]'
                }`}
              >
                {step > i + 1 ? <CheckCircleIcon className="h-4 w-4" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-[#E2D6C5] bg-[#FAF6F0] p-6 sm:p-8 shadow-xl">
          {step === 1 && (
            <>
              <TicketSelector
                selected={ticketType}
                quantity={quantity}
                onSelect={setTicketType}
                onQuantityChange={setQuantity}
                visitDate={visitDate}
                onDateChange={setVisitDate}
              />
              <Button
                variant="primary"
                size="lg"
                disabled={!ticketType || !visitDate}
                onClick={() => setStep(2)}
                className="mt-6 w-full"
              >
                Continue to Payment Checkout
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                <span>Back to ticket selection</span>
              </button>
              <PaymentFlow
                onSubmit={handlePurchase}
                loading={loading}
                totalAmount={totalAmount}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
