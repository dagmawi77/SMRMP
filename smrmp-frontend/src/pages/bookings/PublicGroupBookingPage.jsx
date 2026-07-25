import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import PublicSiteShell from '../../components/layout/PublicSiteShell';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import { useCreateGroupBooking } from '../../hooks/useGroupBookings';
import { GROUP_TYPES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import getApiErrorMessage from '../../utils/apiError';
import usePortalEmbed from '../../hooks/usePortalEmbed';

const minVisitDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
};

const estimatePrice = (count, guideRequired) => {
  const n = Number(count) || 0;
  let perPerson;
  if (n >= 30) perPerson = 75;
  else if (n >= 10) perPerson = 100;
  else perPerson = 150;
  return { perPerson, total: perPerson * n + (guideRequired ? 500 : 0) };
};

const emptyForm = {
  group_name: '',
  group_type: 'school',
  visitor_count: 10,
  guide_required: false,
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  visit_date: minVisitDate(),
  visit_time: '',
  special_requirements: '',
};

export default function PublicGroupBookingPage() {
  const embedded = usePortalEmbed();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const createBooking = useCreateGroupBooking();

  const estimate = useMemo(() => estimatePrice(form.visitor_count, form.guide_required), [form.visitor_count, form.guide_required]);

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canContinueStep1 = form.group_name.trim() && Number(form.visitor_count) >= 2;
  const canContinueStep2 = form.contact_name.trim() && form.contact_phone.trim() && form.visit_date;

  const handleSubmit = async () => {
    try {
      const res = await createBooking.mutateAsync(form);
      setConfirmedBooking(res?.data?.data?.booking);
      setStep(4);
      toast.success('Group booking request submitted!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to submit booking request'));
    }
  };

  const body = (
    <>
        {step < 4 && (
          <div className="mb-8 flex justify-center items-center gap-3 sm:gap-6">
            {['1. Group Info', '2. Contact & Date', '3. Review'].map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-2 text-xs font-bold ${
                  step > i + 1 ? 'text-[#374B07]' : step === i + 1 ? 'text-[#2B1B12]' : 'text-[#887060]'
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step >= i + 1 ? 'bg-gradient-to-br from-smrmp-green to-smrmp-deep-green text-white shadow-xs' : 'bg-[#EFE5D8] text-[#7C4A2D] border border-[#D8C8B8]'
                  }`}
                >
                  {step > i + 1 ? <CheckCircleIcon className="h-4 w-4" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-[#E2D6C5] bg-[#FAF6F0] p-6 sm:p-8 shadow-xl">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-base font-bold text-[#2B1B12] flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-[#7C4A2D]" /> Group Information
              </h2>
              <Input label="Group / Organisation Name" required value={form.group_name} onChange={update('group_name')} placeholder="e.g. Adwa Secondary School" />
              <Select label="Group Type" options={GROUP_TYPES} value={form.group_type} onChange={update('group_type')} />
              <Input
                label="Number of Visitors (minimum 2)"
                type="number"
                min="2"
                required
                value={form.visitor_count}
                onChange={update('visitor_count')}
              />
              <label className="flex items-center gap-2 text-xs font-semibold text-[#5C4233]">
                <input type="checkbox" checked={form.guide_required} onChange={update('guide_required')} className="h-4 w-4 rounded border-[#E2D6C5] text-smrmp-green focus:ring-smrmp-green" />
                <span>Request a dedicated museum guide (+500 ETB flat fee)</span>
              </label>

              <div className="rounded-2xl border border-[#D4A017]/30 bg-[#FAF0D8] p-4 text-xs text-[#7C4A2D]">
                <p className="font-bold">Estimated Price: {formatCurrency(estimate.total)}</p>
                <p className="mt-0.5">{formatCurrency(estimate.perPerson)} per person × {form.visitor_count || 0} visitors{form.guide_required ? ' + 500 ETB guide fee' : ''}</p>
              </div>

              <Button variant="primary" size="lg" className="w-full" disabled={!canContinueStep1} onClick={() => setStep(2)}>
                Continue to Contact Details
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline">
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <h2 className="font-display text-base font-bold text-[#2B1B12] flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-[#7C4A2D]" /> Contact &amp; Visit Date
              </h2>
              <Input label="Organiser Full Name" required value={form.contact_name} onChange={update('contact_name')} placeholder="e.g. Ato Tesfaye Kebede" />
              <Input label="Phone Number" required value={form.contact_phone} onChange={update('contact_phone')} placeholder="+251911223344" />
              <Input label="Email Address (optional)" type="email" value={form.contact_email} onChange={update('contact_email')} placeholder="organiser@example.com" />
              <Input
                label="Preferred Visit Date"
                type="date"
                required
                min={minVisitDate()}
                value={form.visit_date}
                onChange={update('visit_date')}
                hint="Bookings must be made at least 3 days in advance"
              />
              <Input label="Preferred Time (optional)" type="time" value={form.visit_time} onChange={update('visit_time')} />
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">Special Requirements (optional)</label>
                <textarea
                  rows={3}
                  value={form.special_requirements}
                  onChange={update('special_requirements')}
                  placeholder="Accessibility needs, dietary notes, preferred exhibits..."
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5 text-sm text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
                />
              </div>

              <Button variant="primary" size="lg" className="w-full" disabled={!canContinueStep2} onClick={() => setStep(3)}>
                Review Booking Request
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline">
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <h2 className="font-display text-base font-bold text-[#2B1B12] flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="h-5 w-5 text-[#7C4A2D]" /> Review &amp; Submit
              </h2>

              <dl className="space-y-2 rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 text-xs divide-y divide-[#E2D6C5]/60">
                <div className="flex justify-between pt-2 first:pt-0"><dt className="text-[#6E5445]">Group</dt><dd className="font-bold text-[#2B1B12]">{form.group_name}</dd></div>
                <div className="flex justify-between pt-2"><dt className="text-[#6E5445]">Type</dt><dd className="capitalize font-semibold">{form.group_type}</dd></div>
                <div className="flex justify-between pt-2"><dt className="text-[#6E5445]">Visitors</dt><dd className="font-semibold">{form.visitor_count}</dd></div>
                <div className="flex justify-between pt-2"><dt className="text-[#6E5445]">Guide Requested</dt><dd className="font-semibold">{form.guide_required ? 'Yes' : 'No'}</dd></div>
                <div className="flex justify-between pt-2"><dt className="text-[#6E5445]">Contact</dt><dd className="font-semibold">{form.contact_name} · {form.contact_phone}</dd></div>
                <div className="flex justify-between pt-2"><dt className="text-[#6E5445]">Visit Date</dt><dd className="font-semibold">{formatDate(form.visit_date)} {form.visit_time}</dd></div>
                <div className="flex justify-between pt-2"><dt className="font-bold text-[#2B1B12]">Estimated Total</dt><dd className="font-display text-base font-bold text-[#374B07]">{formatCurrency(estimate.total)}</dd></div>
              </dl>

              <p className="text-[11px] text-[#8C7467]">
                This is a request for booking. Museum staff will confirm availability and follow up via phone or email.
              </p>

              <Button variant="primary" size="lg" className="w-full" onClick={handleSubmit} loading={createBooking.isPending}>
                Submit Booking Request
              </Button>
            </div>
          )}

          {step === 4 && confirmedBooking && (
            <div className="space-y-5 text-center">
              <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-600" />
              <h2 className="font-display text-xl font-bold text-[#2B1B12]">Booking Request Submitted!</h2>
              <p className="text-sm text-[#5C4233]">
                Reference: <span className="font-mono font-bold">{confirmedBooking.booking_reference}</span>
              </p>
              <p className="text-xs text-[#6E5445] max-w-sm mx-auto leading-relaxed">
                Our team will contact {confirmedBooking.contact_name} at {confirmedBooking.contact_phone} to confirm your visit on {formatDate(confirmedBooking.visit_date)}.
              </p>
              <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 text-xs text-left mx-auto max-w-sm">
                <div className="flex justify-between py-1"><span className="text-[#6E5445]">Estimated Total</span><span className="font-bold text-[#374B07]">{formatCurrency(confirmedBooking.total_amount)}</span></div>
                <div className="flex justify-between py-1"><span className="text-[#6E5445]">Status</span><span className="font-bold capitalize">{confirmedBooking.status}</span></div>
              </div>
              <Link to="/portal" className="inline-flex items-center gap-2 text-xs font-bold text-[#374B07] hover:underline">
                <span>Return to Visitor Dashboard</span>
              </Link>
            </div>
          )}
        </div>
    </>
  );

  if (embedded) {
    return (
      <div className="max-w-2xl">
        <PortalPageHeader
          showTitle={false}
          title="Book a Group Visit"
          description="Tiered group pricing with optional dedicated guide service"
        />
        {body}
      </div>
    );
  }

  return (
    <PublicSiteShell
      subtitle="Group bookings"
      pageTitle="Book a group or school visit"
      pageDescription="Tiered group pricing with optional dedicated guide service"
      contentClassName="max-w-2xl"
    >
      {body}
    </PublicSiteShell>
  );
}
