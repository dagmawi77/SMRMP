import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import TicketSelector from '../../components/tickets/TicketSelector';
import PaymentFlow from '../../components/tickets/PaymentFlow';
import DigitalTicket from '../../components/tickets/DigitalTicket';
import Button from '../../components/ui/Button';
import { ticketApi } from '../../api/ticketApi';
import { MUSEUM_NAME } from '../../utils/constants';
import { TELEBIRR_RESULT_KEY } from '../../utils/telebirrCheckout';
import { ArrowLeftIcon, BuildingLibraryIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function TicketPurchasePage() {
  const location = useLocation();
  const telebirrHandled = useRef(false);
  const [step, setStep] = useState(1);
  const [ticketType, setTicketType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [visitDate, setVisitDate] = useState('');
  const [purchasedTicket, setPurchasedTicket] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [issuingFromTelebirr, setIssuingFromTelebirr] = useState(
    Boolean(location.state?.telebirrPaid)
  );

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
        ticket_type: visitorInfo.ticket_type || ticketType,
        quantity: visitorInfo.quantity || quantity,
        visit_date: visitorInfo.visit_date || visitDate,
        visitor_name: visitorInfo.visitor_name,
        visitor_phone: visitorInfo.visitor_phone,
        payment_method: visitorInfo.payment_method || 'telebirr',
      });
      setPurchasedTicket(res.data.data.ticket);
      setPaymentInfo(res.data.data.payment_simulation);
      setStep(3);
      toast.success('Ticket purchased successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
      setStep(2);
    } finally {
      setLoading(false);
      setIssuingFromTelebirr(false);
    }
  };

  // Return from Telebirr H5 paygate → complete ticket purchase
  useEffect(() => {
    if (!location.state?.telebirrPaid || telebirrHandled.current) return;
    telebirrHandled.current = true;

    let result;
    try {
      result = JSON.parse(sessionStorage.getItem(TELEBIRR_RESULT_KEY) || 'null');
    } catch {
      result = null;
    }
    sessionStorage.removeItem(TELEBIRR_RESULT_KEY);

    if (!result?.success) {
      toast.error('Telebirr payment was not completed');
      setIssuingFromTelebirr(false);
      setStep(2);
      return;
    }

    setTicketType(result.ticket_type || '');
    setQuantity(result.quantity || 1);
    setVisitDate(result.visit_date || '');
    setIssuingFromTelebirr(true);

    handlePurchase({
      visitor_name: result.visitor_name,
      visitor_phone: result.visitor_phone,
      payment_method: 'telebirr',
      ticket_type: result.ticket_type,
      quantity: result.quantity,
      visit_date: result.visit_date,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.telebirrPaid]);

  useEffect(() => {
    if (!location.state?.telebirrCancelled) return;
    const restore = location.state.restore;
    if (restore) {
      setTicketType(restore.ticket_type || '');
      setQuantity(restore.quantity || 1);
      setVisitDate(restore.visit_date || '');
    }
    setStep(2);
    toast('Telebirr payment cancelled', { icon: 'ℹ️' });
  }, [location.state?.telebirrCancelled, location.state?.restore]);

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

  if (issuingFromTelebirr) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-smrmp-parchment px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-smrmp-green border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#2B1B12]">Issuing your digital museum pass…</p>
        <p className="mt-1 text-xs text-[#6E5445]">Payment confirmed via telebirr</p>
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
        <div className="mb-8 flex justify-center items-center gap-3 sm:gap-6">
          {['1. Select Pass', '2. Telebirr Checkout', '3. Pass Issued'].map((label, i) => (
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
                ticketType={ticketType}
                quantity={quantity}
                visitDate={visitDate}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
