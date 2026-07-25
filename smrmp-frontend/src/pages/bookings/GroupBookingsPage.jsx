import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { useGroupBookings, useTodaysBookings, useConfirmBooking, useCancelBooking, useCompleteBooking } from '../../hooks/useGroupBookings';
import { GROUP_TYPES, BOOKING_STATUS_BADGE } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import getApiErrorMessage from '../../utils/apiError';
import useAuthStore from '../../store/authStore';

export default function GroupBookingsPage() {
  const navigate = useNavigate();
  const { can } = useAuthStore();
  const [filters, setFilters] = useState({ search: '', status: '', group_type: '' });

  const { data, isLoading, isError, error, refetch } = useGroupBookings({
    page: 1,
    limit: 50,
    search: filters.search || undefined,
    status: filters.status || undefined,
    group_type: filters.group_type || undefined,
  });
  const { data: todaysBookings, isLoading: loadingToday } = useTodaysBookings();

  const confirmMutation = useConfirmBooking();
  const cancelMutation = useCancelBooking();
  const completeMutation = useCompleteBooking();

  const bookings = data?.bookings || [];
  const hasActiveFilters = Boolean(filters.search || filters.status || filters.group_type);

  const handleConfirm = async (booking) => {
    try {
      await confirmMutation.mutateAsync({ id: booking.id, data: {} });
      toast.success(`Booking ${booking.booking_reference} confirmed`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to confirm booking'));
    }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel booking ${booking.booking_reference}?`)) return;
    try {
      await cancelMutation.mutateAsync({ id: booking.id });
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel booking'));
    }
  };

  const handleComplete = async (booking) => {
    try {
      await completeMutation.mutateAsync(booking.id);
      toast.success(`Booking ${booking.booking_reference} marked as completed`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to complete booking'));
    }
  };

  const columns = [
    {
      key: 'booking_reference',
      label: 'Reference',
      render: (row) => <span className="font-mono text-xs font-bold text-[#7C4A2D]">{row.booking_reference}</span>,
    },
    {
      key: 'group_name',
      label: 'Group',
      render: (row) => (
        <div>
          <p className="font-bold text-sm text-[#2B1B12]">{row.group_name}</p>
          <p className="text-xs text-[#6E5445] capitalize">{row.group_type}</p>
        </div>
      ),
    },
    {
      key: 'contact_name',
      label: 'Contact',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-[#2B1B12]">{row.contact_name}</p>
          <p className="text-[11px] text-[#6E5445]">{row.contact_phone}</p>
        </div>
      ),
    },
    {
      key: 'visit_date',
      label: 'Visit Date',
      render: (row) => (
        <span className="text-xs font-semibold text-[#2B1B12]">
          {formatDate(row.visit_date)} {row.visit_time ? `· ${row.visit_time}` : ''}
        </span>
      ),
    },
    {
      key: 'visitor_count',
      label: 'Party Size',
      render: (row) => <span className="font-semibold">{row.visitor_count}</span>,
    },
    {
      key: 'total_amount',
      label: 'Total',
      render: (row) => <span className="font-semibold text-[#374B07]">{formatCurrency(row.total_amount)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={BOOKING_STATUS_BADGE[row.status] || 'default'}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {can('bookings.update') && row.status === 'pending' && (
            <button type="button" onClick={() => handleConfirm(row)} className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-50" title="Confirm Booking">
              <CheckCircleIcon className="h-4 w-4" />
            </button>
          )}
          {(can('bookings.manage') || can('bookings.update')) && row.status === 'confirmed' && (
            <button type="button" onClick={() => handleComplete(row)} className="rounded-lg p-1.5 text-[#374B07] hover:bg-[#E4EEDC]" title="Mark Completed">
              <ClipboardDocumentCheckIcon className="h-4 w-4" />
            </button>
          )}
          {can('bookings.update') && row.status !== 'cancelled' && row.status !== 'completed' && (
            <button type="button" onClick={() => handleCancel(row)} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="Cancel Booking">
              <XCircleIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PrivateLayout>
      <PageHeader
        title="Group & School Bookings"
        description="Review and confirm group requests submitted via the Visitor Portal. Handle desk scheduling and check-in."
        badge="Module 8"
      />

      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between border-b border-[#E2D6C5] pb-3">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-[#7C4A2D]" />
            <h3 className="font-display text-sm font-bold text-[#2B1B12]">Today&apos;s Scheduled Groups</h3>
          </div>
          <Badge variant="gold">{todaysBookings?.length || 0} Groups</Badge>
        </div>

        {loadingToday ? (
          <p className="py-6 text-center text-xs text-[#6E5445]">Loading today&apos;s bookings...</p>
        ) : !todaysBookings?.length ? (
          <p className="py-6 text-center text-xs text-[#6E5445]">No group bookings scheduled for today.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todaysBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => navigate(`/group-bookings/${b.id}`)}
                className="cursor-pointer rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 hover:border-smrmp-gold/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-[#2B1B12]">{b.group_name}</p>
                  <Badge variant={BOOKING_STATUS_BADGE[b.status] || 'default'}>{b.status}</Badge>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#6E5445]">
                  <UsersIcon className="h-3.5 w-3.5" />
                  {b.visitor_count} visitors {b.visit_time ? `· ${b.visit_time}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Search by group, contact, reference..."
              icon={MagnifyingGlassIcon}
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            <Select
              icon={FunnelIcon}
              placeholder="All Statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            />
            <Select
              placeholder="All Group Types"
              options={[{ value: '', label: 'All Group Types' }, ...GROUP_TYPES]}
              value={filters.group_type}
              onChange={(e) => setFilters((prev) => ({ ...prev, group_type: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={() => setFilters({ search: '', status: '', group_type: '' })}>
                Reset Filters
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <ArrowPathIcon className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </Card>

      {isError ? (
        <Card className="p-8 text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h3 className="font-bold text-[#2B1B12] text-lg">Unable to load group bookings</h3>
          <p className="mt-1 text-sm text-[#6E5445]">{getApiErrorMessage(error, 'An unexpected error occurred')}</p>
        </Card>
      ) : (
        <Table
          columns={columns}
          data={bookings}
          loading={isLoading}
          onRowClick={(row) => navigate(`/group-bookings/${row.id}`)}
          emptyMessage={hasActiveFilters ? 'No bookings match your filter criteria.' : 'No group bookings submitted yet.'}
        />
      )}
    </PrivateLayout>
  );
}
