import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  TicketIcon,
  QrCodeIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  TrashIcon,
  PrinterIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  CreditCardIcon,
  ClockIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import PrivateLayout from '../../components/layout/PrivateLayout';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { ticketApi } from '../../api/ticketApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    visitor_name: '',
    visitor_phone: '',
    visit_date: '',
    status: 'valid',
  });

  // Query ticket details
  const {
    data: ticket,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ticket-detail', id],
    queryFn: () => ticketApi.getTicket(id),
    select: (res) => res?.data?.data?.ticket || res?.data?.ticket,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => ticketApi.updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets-list'] });
      toast.success('Ticket updated successfully');
      setIsEditModalOpen(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update ticket');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => ticketApi.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets-list'] });
      toast.success('Ticket deleted successfully');
      navigate('/tickets/manage');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete ticket');
    },
  });

  const openEditModal = () => {
    if (!ticket) return;
    setEditForm({
      visitor_name: ticket.visitor_name || '',
      visitor_phone: ticket.visitor_phone || '',
      visit_date: ticket.visit_date || '',
      status: ticket.status || 'valid',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(editForm);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <PrivateLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PrivateLayout>
    );
  }

  if (isError || !ticket) {
    return (
      <PrivateLayout>
        <div className="mx-auto max-w-2xl text-center py-12 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
            <ExclamationTriangleIcon className="h-8 w-8" />
          </div>
          <h2 className="font-display text-xl font-bold text-[#2B1B12]">Booked Ticket Not Found</h2>
          <p className="text-xs text-[#6E5445]">
            {error?.response?.data?.message || 'No ticket matching this ID was found in the database.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/tickets/manage')}>
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Return to Tickets Management</span>
          </Button>
        </div>
      </PrivateLayout>
    );
  }

  const isUsed = ticket.status === 'used';
  const isCancelled = ticket.status === 'cancelled';
  const statusVariant = isUsed ? 'gold' : isCancelled ? 'critical' : 'excellent';

  const verificationUrl = `${window.location.origin}/tickets/verify/${ticket.qr_ticket_code}`;

  return (
    <PrivateLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation & Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/tickets/manage')}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12] transition-colors"
              title="Back to Tickets"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-xl font-bold tracking-tight text-[#2B1B12]">
                  Booked Pass: <span className="font-mono font-bold text-[#7C4A2D]">{ticket.qr_ticket_code}</span>
                </h1>
                <Badge variant={statusVariant}>{ticket.status}</Badge>
              </div>
              <p className="text-xs text-[#6E5445] mt-0.5">
                Issued for {ticket.visitor_name} · Visit Date: {formatDate(ticket.visit_date)}
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {ticket.status === 'valid' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateMutation.mutate({ status: 'used' })}
                loading={updateMutation.isPending}
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Mark as Redeemed / Used</span>
              </Button>
            )}

            <Button variant="secondary" size="sm" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4" />
              <span>Print Pass</span>
            </Button>

            <Button variant="secondary" size="sm" onClick={openEditModal}>
              <PencilSquareIcon className="h-4 w-4" />
              <span>Edit Details</span>
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this booked ticket?')) {
                  deleteMutation.mutate();
                }
              }}
              loading={deleteMutation.isPending}
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Detail Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Digital QR Ticket Pass Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-smrmp-gold/40 bg-[#FAF6F0] p-6 shadow-xl text-[#2B1B12] text-center relative overflow-hidden">
              <div className="bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] -mx-6 -mt-6 p-5 text-smrmp-parchment border-b border-smrmp-gold/30 mb-6">
                <div className="flex items-center justify-center gap-2 text-smrmp-gold text-xs uppercase tracking-widest font-bold">
                  <BuildingLibraryIcon className="h-4 w-4" />
                  <span>Adwa Victory Memorial Museum</span>
                </div>
                <h3 className="font-display text-lg font-bold text-white mt-1">
                  Official Visitor Entry Pass
                </h3>
              </div>

              {/* QR Code Container */}
              <div className="mx-auto mb-4 flex h-52 w-52 items-center justify-center rounded-2xl bg-white p-3 border-2 border-[#E2D6C5] shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`}
                  alt={`QR code for ${ticket.qr_ticket_code}`}
                  className="h-44 w-44 rounded-xl"
                />
              </div>

              <div className="inline-block rounded-full bg-[#EFE5D8] px-4 py-1 border border-[#D8C8B8]">
                <span className="font-mono text-sm font-bold text-[#5C4233]">{ticket.qr_ticket_code}</span>
              </div>

              <div className="mt-5 space-y-2 text-xs text-left bg-[#FFFDF9] p-4 rounded-2xl border border-[#E2D6C5]">
                <div className="flex justify-between border-b border-[#E2D6C5]/60 pb-2">
                  <span className="text-[#6E5445] font-semibold">Pass Type:</span>
                  <span className="font-bold text-[#2B1B12] capitalize">{ticket.ticket_type}</span>
                </div>
                <div className="flex justify-between border-b border-[#E2D6C5]/60 pb-2">
                  <span className="text-[#6E5445] font-semibold">Quantity:</span>
                  <span className="font-bold text-[#2B1B12]">{ticket.quantity} Person(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E5445] font-semibold">Total Paid:</span>
                  <span className="font-bold text-[#374B07]">{formatCurrency(ticket.total_amount)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-[#E4EEDC] py-2.5 text-xs font-bold text-[#243205] border border-[#B8D4A0]">
                <CheckBadgeIcon className="h-4 w-4 text-[#374B07]" />
                <span>Gate Status: {(ticket.status || 'valid').toUpperCase()}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2D6C5]/60">
                <Link
                  to={`/tickets/verify/${ticket.qr_ticket_code}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:underline"
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Open Gate Check Verification Page</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Breakdown Cards */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Visitor & Booking Details */}
            <div className="rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] p-6 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#E2D6C5] pb-4 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFE5D8] text-[#7C4A2D]">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#2B1B12]">
                    Visitor & Pass Booking Details
                  </h3>
                  <p className="text-xs text-[#6E5445]">Registered contact and visit parameters</p>
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E2D6C5]">
                  <dt className="text-[#6E5445] font-medium flex items-center gap-1.5 mb-1">
                    <UserIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <span>Visitor Name</span>
                  </dt>
                  <dd className="font-bold text-sm text-[#2B1B12]">{ticket.visitor_name}</dd>
                </div>

                <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E2D6C5]">
                  <dt className="text-[#6E5445] font-medium flex items-center gap-1.5 mb-1">
                    <PhoneIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <span>Phone Number</span>
                  </dt>
                  <dd className="font-mono font-bold text-sm text-[#2B1B12]">{ticket.visitor_phone || 'N/A'}</dd>
                </div>

                <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E2D6C5]">
                  <dt className="text-[#6E5445] font-medium flex items-center gap-1.5 mb-1">
                    <TicketIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <span>Pass Classification</span>
                  </dt>
                  <dd className="font-bold text-sm text-[#2B1B12] capitalize">{ticket.ticket_type}</dd>
                </div>

                <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E2D6C5]">
                  <dt className="text-[#6E5445] font-medium flex items-center gap-1.5 mb-1">
                    <SparklesIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <span>Number of Persons</span>
                  </dt>
                  <dd className="font-bold text-sm text-[#2B1B12]">{ticket.quantity} Person(s)</dd>
                </div>

                <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E2D6C5] sm:col-span-2">
                  <dt className="text-[#6E5445] font-medium flex items-center gap-1.5 mb-1">
                    <CalendarIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <span>Scheduled Visit Date</span>
                  </dt>
                  <dd className="font-bold text-sm text-[#2B1B12]">{formatDate(ticket.visit_date)}</dd>
                </div>
              </dl>
            </div>

            {/* Card 2: Payment & Financial Settlement */}
            <div className="rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] p-6 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#E2D6C5] pb-4 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFE5D8] text-[#374B07]">
                  <BanknotesIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#2B1B12]">
                    Payment & Settlement Summary
                  </h3>
                  <p className="text-xs text-[#6E5445]">Transaction reference and pricing structure</p>
                </div>
              </div>

              <dl className="space-y-3 text-xs divide-y divide-[#E2D6C5]/60">
                <div className="flex justify-between pt-1">
                  <dt className="text-[#6E5445] font-medium flex items-center gap-1.5">
                    <CreditCardIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <span>Payment Method</span>
                  </dt>
                  <dd className="font-bold text-[#2B1B12] capitalize">{ticket.payment_method || 'Telebirr'}</dd>
                </div>

                <div className="flex justify-between pt-2">
                  <dt className="text-[#6E5445] font-medium">Payment Status</dt>
                  <dd className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full capitalize">
                    {ticket.payment_status || 'completed'}
                  </dd>
                </div>

                {ticket.payment_reference && (
                  <div className="flex justify-between pt-2">
                    <dt className="text-[#6E5445] font-medium">Payment Reference Code</dt>
                    <dd className="font-mono font-bold text-[#2B1B12] bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#E2D6C5]">
                      {ticket.payment_reference}
                    </dd>
                  </div>
                )}

                {ticket.unit_price && (
                  <div className="flex justify-between pt-2">
                    <dt className="text-[#6E5445] font-medium">Unit Price per Pass</dt>
                    <dd className="font-semibold text-[#2B1B12]">{formatCurrency(ticket.unit_price)}</dd>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <dt className="text-[#5C4233] font-bold text-sm">Total Amount Paid</dt>
                  <dd className="font-display text-lg font-bold text-[#374B07]">
                    {formatCurrency(ticket.total_amount)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Card 3: Gate Activity Log */}
            <div className="rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] p-6 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#E2D6C5] pb-3 mb-3">
                <ClockIcon className="h-5 w-5 text-[#7C4A2D]" />
                <h3 className="font-display text-sm font-bold text-[#2B1B12]">
                  System Lifecycle Timestamps
                </h3>
              </div>

              <div className="space-y-2 text-xs text-[#5C4233]">
                <div className="flex justify-between py-1 border-b border-[#E2D6C5]/50">
                  <span>Issued Date & Time:</span>
                  <span className="font-mono font-bold text-[#2B1B12]">
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#E2D6C5]/50">
                  <span>Gate Redemption Time:</span>
                  <span className="font-mono font-bold text-[#2B1B12]">
                    {ticket.used_at ? new Date(ticket.used_at).toLocaleString() : 'Not Yet Redeemed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Ticket Pass: ${ticket.qr_ticket_code}`}
          size="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                Visitor Name
              </label>
              <input
                type="text"
                required
                value={editForm.visitor_name}
                onChange={(e) => setEditForm({ ...editForm, visitor_name: e.target.value })}
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                Visitor Phone
              </label>
              <input
                type="text"
                required
                value={editForm.visitor_phone}
                onChange={(e) => setEditForm({ ...editForm, visitor_phone: e.target.value })}
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                  Visit Date
                </label>
                <input
                  type="date"
                  required
                  value={editForm.visit_date}
                  onChange={(e) => setEditForm({ ...editForm, visit_date: e.target.value })}
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                  Pass Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                >
                  <option value="valid">Valid</option>
                  <option value="used">Used / Redeemed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2D6C5] flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PrivateLayout>
  );
}
