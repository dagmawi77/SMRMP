import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import TicketSelector from '../../components/tickets/TicketSelector';
import PaymentFlow from '../../components/tickets/PaymentFlow';
import DigitalTicket from '../../components/tickets/DigitalTicket';
import Button from '../../components/ui/Button';
import PublicSiteShell from '../../components/layout/PublicSiteShell';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import { ticketApi } from '../../api/ticketApi';
import { TELEBIRR_RESULT_KEY } from '../../utils/telebirrCheckout';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import usePortalEmbed from '../../hooks/usePortalEmbed';

export default function TicketPurchasePage() {
  const location = useLocation();
  const embedded = usePortalEmbed();
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

    handlePurchase({
      ticket_type: result.ticket_type,
      quantity: result.quantity,
      visit_date: result.visit_date,
      visitor_name: result.visitor_name,
      visitor_phone: result.visitor_phone || result.phone,
      payment_method: 'telebirr',
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

  const wrap = (node, { title, description, maxWidth = 'max-w-2xl' } = {}) => {
    if (embedded) {
      return (
        <div className={maxWidth}>
          {title ? (
            <PortalPageHeader
              showTitle={false}
              title={title}
              description={description}
            />
          ) : null}
          {node}
        </div>
      );
    }
    return (
      <PublicSiteShell
        subtitle="Ticketing"
        pageTitle={title}
        pageDescription={description}
        contentClassName={maxWidth}
      >
        {node}
      </PublicSiteShell>
    );
  };

  if (purchasedTicket) {
    return wrap(
      <DigitalTicket ticket={purchasedTicket} paymentInfo={paymentInfo} />,
      {
        title: 'Your digital pass',
        description: 'Save or screenshot this pass for museum entry.',
        maxWidth: 'max-w-lg',
      },
    );
  }

  if (issuingFromTelebirr) {
    return wrap(
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-smrmp-green border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-[#2B1B12]">Issuing your digital museum pass…</p>
        <p className="mt-1 text-xs text-[#6E5445]">Payment confirmed via telebirr</p>
      </div>,
      { maxWidth: 'max-w-lg' },
    );
  }

  return wrap(
    <>
      <div className="mb-8 flex items-center justify-center gap-3 sm:gap-6">
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
                  : 'border border-[#D8C8B8] bg-[#EFE5D8] text-[#7C4A2D]'
              }`}
            >
              {step > i + 1 ? <CheckCircleIcon className="h-4 w-4" aria-hidden="true" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-6 shadow-md sm:p-8">
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
              <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
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
    </>,
    {
      title: 'Purchase museum entry passes',
      description: 'Instant digital pass issuance and QR validation',
    },
  );
}
