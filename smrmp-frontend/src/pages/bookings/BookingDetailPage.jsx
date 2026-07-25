import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  UsersIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import {
  useGroupBooking,
  useConfirmBooking,
  useCancelBooking,
  useCompleteBooking,
  useBookingInvoice,
} from '../../hooks/useGroupBookings';
import { BOOKING_STATUS_BADGE } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import getApiErrorMessage from '../../utils/apiError';
import useAuthStore from '../../store/authStore';

export default function BookingDetailPage() {
  const { id } = useParams();
  const { can } = useAuthStore();
  const [showInvoice, setShowInvoice] = useState(false);

  const { data: booking, isLoading, isError, error, refetch } = useGroupBooking(id);
  const { data: invoice, isLoading: loadingInvoice } = useBookingInvoice(id, showInvoice);

  const confirmMutation = useConfirmBooking();
  const cancelMutation = useCancelBooking();
  const completeMutation = useCompleteBooking();

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync({ id, data: {} });
      toast.success('Booking confirmed successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to confirm booking'));
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelMutation.mutateAsync({ id });
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel booking'));
    }
  };

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(id);
      toast.success('Booking marked as completed & visit logged');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to complete booking'));
    }
  };

  if (isLoading) {
    return (
      <PrivateLayout>
        <Spinner size="lg" className="mx-auto py-24" />
      </PrivateLayout>
    );
  }

  if (isError || !booking) {
    return (
      <PrivateLayout>
        <Card className="p-8 text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h3 className="font-bold text-[#2B1B12] text-lg">Booking not found</h3>
          <p className="mt-1 text-sm text-[#6E5445]">{getApiErrorMessage(error, 'This booking record could not be loaded')}</p>
          <Button variant="secondary" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </Card>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <PageHeader
        title={booking.group_name}
        description={`Booking reference ${booking.booking_reference}`}
        badge="Group Booking"
        backPath="/group-bookings"
        showBack
        action={
          <div className="flex flex-wrap gap-2">
            {can('bookings.update') && booking.status === 'pending' && (
              <Button variant="primary" onClick={handleConfirm} loading={confirmMutation.isPending}>
                <CheckCircleIcon className="h-4 w-4" />
                <span>Confirm Booking</span>
              </Button>
            )}
            {(can('bookings.manage') || can('bookings.update')) && booking.status === 'confirmed' && (
              <Button variant="secondary" onClick={handleComplete} loading={completeMutation.isPending}>
                <ClipboardDocumentCheckIcon className="h-4 w-4" />
                <span>Mark Completed</span>
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowInvoice(true)}>
              <DocumentTextIcon className="h-4 w-4" />
              <span>View Invoice</span>
            </Button>
            {can('bookings.update') && booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Button variant="danger" onClick={handleCancel} loading={cancelMutation.isPending}>
                <XCircleIcon className="h-4 w-4" />
                <span>Cancel Booking</span>
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-6 flex items-center gap-3">
        <Badge variant={BOOKING_STATUS_BADGE[booking.status] || 'default'} className="text-sm px-3 py-1">
          {booking.status}
        </Badge>
        <Badge variant="default" className="capitalize">
          {booking.group_type}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-display text-sm font-bold text-[#2B1B12] border-b border-[#E2D6C5] pb-3">Booking Details</h3>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">
                <UserIcon className="h-3.5 w-3.5" /> Contact Person
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{booking.contact_name}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">
                <PhoneIcon className="h-3.5 w-3.5" /> Phone
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{booking.contact_phone}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">
                <EnvelopeIcon className="h-3.5 w-3.5" /> Email
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{booking.contact_email || '—'}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">
                <CalendarIcon className="h-3.5 w-3.5" /> Visit Date
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">
                {formatDate(booking.visit_date)} {booking.visit_time ? `at ${booking.visit_time}` : ''}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">
                <UsersIcon className="h-3.5 w-3.5" /> Party Size
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{booking.visitor_count} visitors</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">
                <AcademicCapIcon className="h-3.5 w-3.5" /> Guide Requested
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#2B1B12]">{booking.guide_required ? 'Yes' : 'No'}</dd>
            </div>
            {booking.special_requirements && (
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Special Requirements</dt>
                <dd className="mt-1 text-sm text-[#5C4233] whitespace-pre-line">{booking.special_requirements}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <h3 className="mb-4 font-display text-sm font-bold text-[#2B1B12] border-b border-[#E2D6C5] pb-3 flex items-center gap-1.5">
            <BanknotesIcon className="h-4 w-4 text-[#7C4A2D]" /> Pricing Summary
          </h3>
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between">
              <dt className="text-[#6E5445]">Per Person</dt>
              <dd className="font-semibold text-[#2B1B12]">{formatCurrency(booking.price_per_person)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6E5445]">Guide Fee</dt>
              <dd className="font-semibold text-[#2B1B12]">
                {formatCurrency(
                  booking.guide_fee
                    ?? (booking.guide_required
                      ? Math.max(0, Number(booking.total_amount || 0) - Number(booking.price_per_person || 0) * Number(booking.visitor_count || 0))
                      : 0),
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-[#E2D6C5] pt-3">
              <dt className="font-bold text-[#2B1B12]">Total Amount</dt>
              <dd className="font-display text-lg font-bold text-[#374B07]">{formatCurrency(booking.total_amount)}</dd>
            </div>
            <div className="flex justify-between pt-1">
              <dt className="text-[#6E5445]">Payment Status</dt>
              <dd>
                <Badge variant={booking.payment_status === 'completed' ? 'excellent' : booking.payment_status === 'failed' ? 'critical' : 'fair'}>
                  {booking.payment_status}
                </Badge>
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {showInvoice && (
        <Card className="mt-6">
          <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-3 mb-4">
            <h3 className="font-display text-sm font-bold text-[#2B1B12]">Invoice</h3>
            <button type="button" onClick={() => setShowInvoice(false)} className="text-xs font-bold text-[#7C4A2D] hover:underline">
              Close
            </button>
          </div>
          {loadingInvoice ? (
            <Spinner className="py-8" />
          ) : invoice ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[#6E5445]">Invoice Number</span><span className="font-mono font-bold">{invoice.invoice_number}</span></div>
              <div className="flex justify-between"><span className="text-[#6E5445]">Group</span><span className="font-semibold">{invoice.group_name}</span></div>
              <div className="flex justify-between"><span className="text-[#6E5445]">Visitors</span><span className="font-semibold">{invoice.visitor_count}</span></div>
              <div className="flex justify-between"><span className="text-[#6E5445]">Price / Person</span><span className="font-semibold">{formatCurrency(invoice.price_per_person)}</span></div>
              <div className="flex justify-between"><span className="text-[#6E5445]">Guide Fee</span><span className="font-semibold">{formatCurrency(invoice.guide_fee)}</span></div>
              <div className="flex justify-between border-t border-[#E2D6C5] pt-2"><span className="font-bold text-[#2B1B12]">Total</span><span className="font-bold text-[#374B07]">{formatCurrency(invoice.total_amount)}</span></div>
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-[#6E5445]">Unable to load invoice.</p>
          )}
        </Card>
      )}
    </PrivateLayout>
  );
}
