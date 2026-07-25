import { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TicketSelector from '../../components/tickets/TicketSelector';
import PaymentFlow from '../../components/tickets/PaymentFlow';
import DigitalTicket from '../../components/tickets/DigitalTicket';
import TelebirrPaygateInline from '../../components/tickets/TelebirrPaygateInline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PublicSiteShell from '../../components/layout/PublicSiteShell';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import useAuthStore from '../../store/authStore';
import { ticketApi } from '../../api/ticketApi';
import { useCreateGroupBooking } from '../../hooks/useGroupBookings';
import {
  TELEBIRR_RESULT_KEY,
  TELEBIRR_SESSION_KEY,
  buildTelebirrCheckoutSession,
} from '../../utils/telebirrCheckout';
import { GROUP_TYPES, PAYMENT_METHODS, MUSEUM_NAME } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import getApiErrorMessage from '../../utils/apiError';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  TicketIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import usePortalEmbed from '../../hooks/usePortalEmbed';

const minGroupVisitDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
};

const estimateGroupPrice = (count, guideRequired) => {
  const n = Number(count) || 0;
  let perPerson;
  if (n >= 30) perPerson = 75;
  else if (n >= 10) perPerson = 100;
  else perPerson = 150;
  return { perPerson, total: perPerson * n + (guideRequired ? 500 : 0) };
};

const emptyGroupForm = {
  group_name: '',
  group_type: 'school',
  visitor_count: 10,
  guide_required: false,
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  visit_date: minGroupVisitDate(),
  visit_time: '',
  special_requirements: '',
};

export default function TicketPurchasePage({ defaultBookingType = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const embedded = usePortalEmbed();
  const telebirrHandled = useRef(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Read mode from search params or default prop, default to 'individual'
  const initialMode = useMemo(() => {
    const tabParam = searchParams.get('tab') || searchParams.get('type') || searchParams.get('mode');
    if (tabParam === 'group' || defaultBookingType === 'group') return 'group';
    return 'individual';
  }, [searchParams, defaultBookingType]);

  const [bookingMode, setBookingMode] = useState(initialMode);
  const [step, setStep] = useState(1);

  // Sync mode when URL search parameters change
  useEffect(() => {
    const tabParam = searchParams.get('tab') || searchParams.get('type') || searchParams.get('mode');
    if (tabParam === 'group') {
      setBookingMode('group');
      setStep(1);
    } else if (tabParam === 'individual') {
      setBookingMode('individual');
      setStep(1);
    }
  }, [searchParams]);

  // Individual Ticket State
  const [ticketType, setTicketType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [visitDate, setVisitDate] = useState('');
  const [purchasedTicket, setPurchasedTicket] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [issuingFromTelebirr, setIssuingFromTelebirr] = useState(
    Boolean(location.state?.telebirrPaid)
  );

  // Group Booking State
  const [groupForm, setGroupForm] = useState(emptyGroupForm);
  const [groupPaymentMethod, setGroupPaymentMethod] = useState('telebirr');
  const [groupPhone, setGroupPhone] = useState('');
  const [showGroupTelebirr, setShowGroupTelebirr] = useState(false);
  const [confirmedGroupBooking, setConfirmedGroupBooking] = useState(null);
  const createGroupBooking = useCreateGroupBooking();

  // Prefill logged in user info if available
  useEffect(() => {
    if (user) {
      setGroupForm((prev) => ({
        ...prev,
        contact_name: prev.contact_name || user.name || '',
        contact_phone: prev.contact_phone || user.phone || '',
        contact_email: prev.contact_email || user.email || '',
      }));
    }
  }, [user]);

  const groupEstimate = useMemo(
    () => estimateGroupPrice(groupForm.visitor_count, groupForm.guide_required),
    [groupForm.visitor_count, groupForm.guide_required]
  );

  const { data: types } = useQuery({
    queryKey: ['ticket-types'],
    queryFn: () => ticketApi.getTypes(),
    select: (res) => res.data.data.ticket_types,
  });

  const selectedType = types?.find((t) => t.type === ticketType);
  const totalAmount = selectedType ? selectedType.price_etb * quantity : 0;

  const handleModeChange = (mode) => {
    setBookingMode(mode);
    setStep(1);
    setShowGroupTelebirr(false);
    setPurchasedTicket(null);
    setConfirmedGroupBooking(null);

    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', mode);
    setSearchParams(newParams, { replace: true });
  };

  const handlePurchaseIndividual = async (visitorInfo) => {
    setLoading(true);
    try {
      const res = await ticketApi.purchase({
        ticket_type: visitorInfo.ticket_type || ticketType,
        quantity: visitorInfo.quantity || quantity,
        visit_date: visitorInfo.visit_date || visitDate,
        visitor_name: visitorInfo.visitor_name || user?.name || 'Visitor',
        visitor_phone: visitorInfo.visitor_phone || user?.phone || '',
        payment_method: visitorInfo.payment_method || 'telebirr',
      });
      setPurchasedTicket(res.data.data.ticket);
      setPaymentInfo(res.data.data.payment_simulation);
      setStep(3);
      queryClient.invalidateQueries({ queryKey: ['portal-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['portal-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] });
      toast.success('Ticket purchased successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
      setStep(2);
    } finally {
      setLoading(false);
      setIssuingFromTelebirr(false);
    }
  };

  const updateGroupForm = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setGroupForm((prev) => ({ ...prev, [key]: value }));
  };

  const canContinueGroupStep1 = Boolean(
    groupForm.group_name.trim() && Number(groupForm.visitor_count) >= 2
  );
  const canContinueGroupStep2 = Boolean(
    groupForm.contact_name.trim() && groupForm.contact_phone.trim() && groupForm.visit_date
  );

  const handleGroupSubmit = async (overridePayload = null) => {
    const payload = overridePayload || {
      ...groupForm,
      contact_name: groupForm.contact_name || user?.name || '',
      contact_phone: groupForm.contact_phone || user?.phone || '',
      contact_email: groupForm.contact_email || user?.email || null,
      payment_method: groupPaymentMethod,
      payment_status: 'pending',
    };
    try {
      const res = await createGroupBooking.mutateAsync(payload);
      setConfirmedGroupBooking(res?.data?.data?.booking);
      setStep(4);
      queryClient.invalidateQueries({ queryKey: ['portal-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['portal-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] });
      if (payload.payment_status === 'completed') {
        toast.success('Group booking paid & confirmed via telebirr!');
      } else {
        toast.success('Group booking request submitted!');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to submit booking request'));
    } finally {
      setIssuingFromTelebirr(false);
    }
  };

  const handleGroupTelebirrCheckout = () => {
    const phone = (groupPhone || groupForm.contact_phone || '').trim();
    if (!phone) {
      toast.error('Please enter a phone number for Telebirr payment');
      return;
    }
    setShowGroupTelebirr(true);
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

    if (result.booking_type === 'group' || result.group_data) {
      setBookingMode('group');
      const payload = {
        ...(result.group_data || groupForm),
        payment_status: 'completed',
        payment_reference: result.reference_number,
        payment_method: 'telebirr',
        status: 'confirmed',
      };
      handleGroupSubmit(payload);
    } else {
      setBookingMode('individual');
      handlePurchaseIndividual({
        ticket_type: result.ticket_type,
        quantity: result.quantity,
        visit_date: result.visit_date,
        visitor_name: result.visitor_name,
        visitor_phone: result.visitor_phone || result.phone,
        payment_method: 'telebirr',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.telebirrPaid]);

  useEffect(() => {
    if (!location.state?.telebirrCancelled) return;
    const restore = location.state.restore;
    if (restore?.booking_type === 'group' || restore?.group_data) {
      setBookingMode('group');
      if (restore.group_data) {
        setGroupForm(restore.group_data);
      }
      setStep(3);
      toast('Telebirr payment cancelled', { icon: 'ℹ️' });
    } else {
      setBookingMode('individual');
      if (restore) {
        setTicketType(restore.ticket_type || '');
        setQuantity(restore.quantity || 1);
        setVisitDate(restore.visit_date || '');
      }
      setStep(2);
      toast('Telebirr payment cancelled', { icon: 'ℹ️' });
    }
  }, [location.state?.telebirrCancelled, location.state?.restore]);

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

  const individualSteps = ['1. Select Pass', '2. Telebirr Checkout', '3. Pass Issued'];
  const groupSteps = ['1. Group Info', '2. Contact & Date', '3. Payment Checkout'];

  const pageTitle =
    bookingMode === 'group' ? 'Book a group visit' : 'Purchase museum entry passes';

  const pageDescription =
    bookingMode === 'group'
      ? 'Tiered group pricing for schools, tours, and organizations'
      : 'Instant digital pass issuance and QR validation';

  return wrap(
    <>
      {/* Mode Switcher Tabs */}
      <div className="mb-6 flex max-w-sm mx-auto rounded-xl bg-[#EFE5D8] p-1 border border-[#D8C8B8]">
        <button
          type="button"
          onClick={() => handleModeChange('individual')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-xs font-bold transition-all duration-200 ${
            bookingMode === 'individual'
              ? 'bg-[#FAF6F0] text-[#2B1B12] shadow-2xs ring-1 ring-[#D4A017]/30'
              : 'text-[#7C4A2D] hover:text-[#2B1B12] hover:bg-[#FAF0E4]/60'
          }`}
        >
          <TicketIcon
            className={`h-3.5 w-3.5 ${
              bookingMode === 'individual' ? 'text-smrmp-green' : 'text-[#7C4A2D]'
            }`}
          />
          <span>Individual Pass</span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('group')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-xs font-bold transition-all duration-200 ${
            bookingMode === 'group'
              ? 'bg-[#FAF6F0] text-[#2B1B12] shadow-2xs ring-1 ring-[#D4A017]/30'
              : 'text-[#7C4A2D] hover:text-[#2B1B12] hover:bg-[#FAF0E4]/60'
          }`}
        >
          <UsersIcon
            className={`h-3.5 w-3.5 ${
              bookingMode === 'group' ? 'text-smrmp-green' : 'text-[#7C4A2D]'
            }`}
          />
          <span>Group Booking</span>
        </button>
      </div>

      {/* Step Progress Bar */}
      {((bookingMode === 'individual' && step <= 2) ||
        (bookingMode === 'group' && step <= 3)) && (
        <div className="mb-8 flex items-center justify-center gap-3 sm:gap-6">
          {(bookingMode === 'individual' ? individualSteps : groupSteps).map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-2 text-xs font-bold ${
                step > i + 1
                  ? 'text-[#374B07]'
                  : step === i + 1
                  ? 'text-[#2B1B12]'
                  : 'text-[#887060]'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step >= i + 1
                    ? 'bg-gradient-to-br from-smrmp-green to-smrmp-deep-green text-white shadow-xs'
                    : 'border border-[#D8C8B8] bg-[#EFE5D8] text-[#7C4A2D]'
                }`}
              >
                {step > i + 1 ? (
                  <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  i + 1
                )}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Form Content Box */}
      <div className="rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-6 shadow-md sm:p-8">
        {bookingMode === 'individual' ? (
          <>
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
                  onSubmit={handlePurchaseIndividual}
                  loading={loading}
                  totalAmount={totalAmount}
                  ticketType={ticketType}
                  quantity={quantity}
                  visitDate={visitDate}
                />
              </>
            )}
          </>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-base font-bold text-[#2B1B12] flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-[#7C4A2D]" /> Group Information
                </h2>
                <Input
                  label="Group / Organisation Name"
                  required
                  value={groupForm.group_name}
                  onChange={updateGroupForm('group_name')}
                  placeholder="e.g. Adwa Secondary School"
                />
                <Select
                  label="Group Type"
                  options={GROUP_TYPES}
                  value={groupForm.group_type}
                  onChange={updateGroupForm('group_type')}
                />
                <Input
                  label="Number of Visitors (minimum 2)"
                  type="number"
                  min="2"
                  required
                  value={groupForm.visitor_count}
                  onChange={updateGroupForm('visitor_count')}
                />
                <label className="flex items-center gap-2 text-xs font-semibold text-[#5C4233]">
                  <input
                    type="checkbox"
                    checked={groupForm.guide_required}
                    onChange={updateGroupForm('guide_required')}
                    className="h-4 w-4 rounded border-[#E2D6C5] text-smrmp-green focus:ring-smrmp-green"
                  />
                  <span>Request a dedicated museum guide (+500 ETB flat fee)</span>
                </label>

                <div className="rounded-2xl border border-[#D4A017]/30 bg-[#FAF0D8] p-4 text-xs text-[#7C4A2D]">
                  <p className="font-bold">
                    Estimated Price: {formatCurrency(groupEstimate.total)}
                  </p>
                  <p className="mt-0.5">
                    {formatCurrency(groupEstimate.perPerson)} per person ×{' '}
                    {groupForm.visitor_count || 0} visitors
                    {groupForm.guide_required ? ' + 500 ETB guide fee' : ''}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!canContinueGroupStep1}
                  onClick={() => setStep(2)}
                >
                  Continue to Contact Details
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <h2 className="font-display text-base font-bold text-[#2B1B12] flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5 text-[#7C4A2D]" /> Contact &amp; Visit Date
                </h2>
                <Input
                  label="Organiser Full Name"
                  required
                  value={groupForm.contact_name}
                  onChange={updateGroupForm('contact_name')}
                  placeholder="e.g. Ato Tesfaye Kebede"
                />
                <Input
                  label="Phone Number"
                  required
                  value={groupForm.contact_phone}
                  onChange={updateGroupForm('contact_phone')}
                  placeholder="+251911223344"
                />
                <Input
                  label="Email Address (optional)"
                  type="email"
                  value={groupForm.contact_email}
                  onChange={updateGroupForm('contact_email')}
                  placeholder="organiser@example.com"
                />
                <Input
                  label="Preferred Visit Date"
                  type="date"
                  required
                  min={minGroupVisitDate()}
                  value={groupForm.visit_date}
                  onChange={updateGroupForm('visit_date')}
                  hint="Bookings must be made at least 3 days in advance"
                />
                <Input
                  label="Preferred Time (optional)"
                  type="time"
                  value={groupForm.visit_time}
                  onChange={updateGroupForm('visit_time')}
                />
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">
                    Special Requirements (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={groupForm.special_requirements}
                    onChange={updateGroupForm('special_requirements')}
                    placeholder="Accessibility needs, dietary notes, preferred exhibits..."
                    className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5 text-sm text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!canContinueGroupStep2}
                  onClick={() => setStep(3)}
                >
                  Review Booking Request
                </Button>
              </div>
            )}

            {step === 3 && (
              showGroupTelebirr ? (
                <TelebirrPaygateInline
                  amount={groupEstimate.total}
                  subject={`Group Visit Pass — ${groupForm.group_name || 'Group'} (${groupForm.visitor_count || 0} visitors)`}
                  initialPhone={groupPhone || groupForm.contact_phone}
                  onSuccess={(ref, phone) => {
                    setShowGroupTelebirr(false);
                    handleGroupSubmit({
                      ...groupForm,
                      contact_phone: phone,
                      payment_status: 'completed',
                      payment_reference: ref,
                      payment_method: 'telebirr',
                      status: 'confirmed',
                    });
                  }}
                  onCancel={() => setShowGroupTelebirr(false)}
                />
              ) : (
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline"
                  >
                    <ArrowLeftIcon className="h-3.5 w-3.5" />
                    <span>Back to contact details</span>
                  </button>
                  <h2 className="font-display text-base font-bold text-[#2B1B12] flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-[#7C4A2D]" /> Review &amp; Payment Checkout
                  </h2>

                  <dl className="space-y-2 rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 text-xs divide-y divide-[#E2D6C5]/60">
                    <div className="flex justify-between pt-2 first:pt-0">
                      <dt className="text-[#6E5445]">Group Name</dt>
                      <dd className="font-bold text-[#2B1B12]">{groupForm.group_name}</dd>
                    </div>
                    <div className="flex justify-between pt-2">
                      <dt className="text-[#6E5445]">Group Type</dt>
                      <dd className="capitalize font-semibold">{groupForm.group_type}</dd>
                    </div>
                    <div className="flex justify-between pt-2">
                      <dt className="text-[#6E5445]">Visitors</dt>
                      <dd className="font-semibold">{groupForm.visitor_count}</dd>
                    </div>
                    <div className="flex justify-between pt-2">
                      <dt className="text-[#6E5445]">Guide Requested</dt>
                      <dd className="font-semibold">{groupForm.guide_required ? 'Yes' : 'No'}</dd>
                    </div>
                    <div className="flex justify-between pt-2">
                      <dt className="text-[#6E5445]">Contact Person</dt>
                      <dd className="font-semibold">
                        {groupForm.contact_name} · {groupForm.contact_phone}
                      </dd>
                    </div>
                    <div className="flex justify-between pt-2">
                      <dt className="text-[#6E5445]">Visit Date</dt>
                      <dd className="font-semibold">
                        {formatDate(groupForm.visit_date)} {groupForm.visit_time ? `at ${groupForm.visit_time}` : ''}
                      </dd>
                    </div>
                    <div className="flex justify-between pt-2">
                      <dt className="font-bold text-[#2B1B12]">Estimated Total</dt>
                      <dd className="font-display text-base font-bold text-[#374B07]">
                        {formatCurrency(groupEstimate.total)}
                      </dd>
                    </div>
                  </dl>

                  {/* Payment Gateway Section */}
                  <div className="space-y-4 pt-3 border-t border-[#E2D6C5]/60">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C4233]">Payment Provider</h3>
                    <Select
                      label="Select Payment Method"
                      options={PAYMENT_METHODS}
                      value={groupPaymentMethod}
                      onChange={(e) => setGroupPaymentMethod(e.target.value)}
                    />

                    {groupPaymentMethod === 'telebirr' ? (
                      <div className="space-y-3">
                        <Input
                          label="Telebirr Phone Number *"
                          type="tel"
                          value={groupPhone || groupForm.contact_phone}
                          onChange={(e) => setGroupPhone(e.target.value)}
                          placeholder="09XXXXXXXX"
                          required
                        />
                        <div className="flex items-start gap-3 rounded-2xl border border-[#8DC63F]/40 bg-[#F3F9EB] px-4 py-3">
                          <img src="/telebirr-logo.svg" alt="telebirr" className="mt-0.5 h-7 w-auto object-contain" />
                          <div>
                            <p className="text-xs font-bold text-[#5A7A20]">telebirr paygate checkout</p>
                            <p className="mt-0.5 text-[11px] text-[#3D4F28]">
                              Confirm your phone number and enter your PIN directly here to complete payment.
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="gold"
                          size="lg"
                          className="w-full"
                          onClick={handleGroupTelebirrCheckout}
                        >
                          <CreditCardIcon className="h-4 w-4" />
                          <span>Pay with telebirr — {formatCurrency(groupEstimate.total)}</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-[#8C7467] rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-3">
                          Payment can be settled upon arrival at the museum cash desk or processed via invoice.
                        </p>
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full"
                          onClick={() => handleGroupSubmit()}
                          loading={createGroupBooking.isPending}
                        >
                          Submit Booking Request (Pay at Counter)
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {step === 4 && confirmedGroupBooking && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-600" />
                  <h2 className="font-display text-xl font-bold text-[#2B1B12]">
                    {confirmedGroupBooking.payment_status === 'completed'
                      ? 'Group Booking Paid & Pass Issued!'
                      : 'Booking Request Submitted!'}
                  </h2>
                  <p className="text-xs text-[#6E5445] max-w-sm mx-auto leading-relaxed">
                    {confirmedGroupBooking.payment_status === 'completed'
                      ? `Payment confirmed via telebirr for ${confirmedGroupBooking.group_name}. Save or screenshot your digital group pass with QR code below for museum entry.`
                      : `Our team will contact ${confirmedGroupBooking.contact_name} at ${confirmedGroupBooking.contact_phone} to confirm your group visit on ${formatDate(confirmedGroupBooking.visit_date)}.`}
                  </p>
                </div>

                <DigitalTicket
                  groupBooking={confirmedGroupBooking}
                  paymentInfo={{
                    sandbox_label: confirmedGroupBooking.payment_status === 'completed'
                      ? 'Telebirr payment confirmed — Digital group pass issued'
                      : 'Booking registered — Digital group pass issued',
                  }}
                />

                <div className="text-center pt-2">
                  <Link
                    to={embedded ? '/portal/tickets?tab=group' : '/portal'}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#374B07] hover:underline"
                  >
                    <span>Return to {embedded ? 'My Tickets' : 'Visitor Dashboard'}</span>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>,
    {
      title: pageTitle,
      description: pageDescription,
    },
  );
}
