import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  TicketIcon,
  PlusIcon,
  QrCodeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  SparklesIcon,
  ArrowPathIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  BanknotesIcon,
  TagIcon,
  FunnelIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

import PrivateLayout from '../../components/layout/PrivateLayout';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import DigitalTicket from '../../components/tickets/DigitalTicket';
import { ticketApi } from '../../api/ticketApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function TicketManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Tab state: 'booked' | 'types'
  const [activeTab, setActiveTab] = useState('booked');

  // View Mode: 'grid' | 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Filters for Booked Tickets
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedTicketForPass, setSelectedTicketForPass] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editingType, setEditingType] = useState(null);

  // Form states
  const [issueForm, setIssueForm] = useState({
    ticket_type: 'adult',
    visitor_name: '',
    visitor_phone: '',
    quantity: 1,
    visit_date: new Date().toISOString().split('T')[0],
    payment_method: 'telebirr',
  });

  const [editTicketForm, setEditTicketForm] = useState({
    visitor_name: '',
    visitor_phone: '',
    visit_date: '',
    status: 'valid',
  });

  const [typeForm, setTypeForm] = useState({
    type: '',
    label: '',
    price_etb: 100,
    description: '',
    is_active: true,
  });

  // Queries
  const { data: ticketTypesData, isLoading: loadingTypes } = useQuery({
    queryKey: ['ticket-types-all'],
    queryFn: () => ticketApi.getTypes({ all: true }),
    select: (res) => res?.data?.data?.ticket_types || res?.data?.ticket_types || [],
  });

  const {
    data: ticketsData,
    isLoading: loadingTickets,
  } = useQuery({
    queryKey: ['tickets-list', searchTerm, statusFilter, typeFilter, dateFilter],
    queryFn: () =>
      ticketApi.listTickets({
        search: searchTerm,
        status: statusFilter,
        ticket_type: typeFilter,
        visit_date: dateFilter,
      }),
    select: (res) => res?.data?.data?.tickets || [],
  });

  const tickets = ticketsData || [];
  const ticketTypes = ticketTypesData || [];

  // Mutations
  const issueMutation = useMutation({
    mutationFn: (data) => ticketApi.purchase(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['tickets-list'] });
      toast.success('Ticket pass issued successfully!');
      setShowIssueModal(false);
      setIssueForm({
        ticket_type: ticketTypes[0]?.type || 'adult',
        visitor_name: '',
        visitor_phone: '',
        quantity: 1,
        visit_date: new Date().toISOString().split('T')[0],
        payment_method: 'telebirr',
      });
      const issuedTicket = res?.data?.data?.ticket;
      if (issuedTicket) {
        setSelectedTicketForPass(issuedTicket);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to issue ticket pass');
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }) => ticketApi.updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets-list'] });
      toast.success('Ticket updated successfully');
      setEditingTicket(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update ticket');
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: (id) => ticketApi.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets-list'] });
      toast.success('Ticket deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete ticket');
    },
  });

  const createTypeMutation = useMutation({
    mutationFn: (data) => ticketApi.createType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types-all'] });
      toast.success('Ticket type created');
      setShowTypeModal(false);
      setTypeForm({ type: '', label: '', price_etb: 100, description: '', is_active: true });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create ticket type');
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }) => ticketApi.updateType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types-all'] });
      toast.success('Ticket type updated');
      setEditingType(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update ticket type');
    },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (id) => ticketApi.deleteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types-all'] });
      toast.success('Ticket type deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete ticket type');
    },
  });

  // Derived Stats
  const stats = useMemo(() => {
    const totalBooked = tickets.length;
    const validCount = tickets.filter((t) => t.status === 'valid').length;
    const usedCount = tickets.filter((t) => t.status === 'used').length;
    const totalRevenue = tickets.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
    return { totalBooked, validCount, usedCount, totalRevenue };
  }, [tickets]);

  // Handlers
  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueForm.visitor_name.trim()) {
      toast.error('Visitor name is required');
      return;
    }
    if (!issueForm.visitor_phone.trim()) {
      toast.error('Visitor phone is required');
      return;
    }
    issueMutation.mutate(issueForm);
  };

  const handleEditTicketSubmit = (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    updateTicketMutation.mutate({
      id: editingTicket.id,
      data: editTicketForm,
    });
  };

  const handleTypeSubmit = (e) => {
    e.preventDefault();
    if (editingType) {
      updateTypeMutation.mutate({
        id: editingType.id,
        data: typeForm,
      });
    } else {
      createTypeMutation.mutate(typeForm);
    }
  };

  const openTypeModalForEdit = (typeObj) => {
    setEditingType(typeObj);
    setTypeForm({
      type: typeObj.type,
      label: typeObj.label,
      price_etb: typeObj.price_etb,
      description: typeObj.description || '',
      is_active: typeObj.is_active,
    });
  };

  const openTypeModalForAdd = () => {
    setEditingType(null);
    setTypeForm({ type: '', label: '', price_etb: 100, description: '', is_active: true });
    setShowTypeModal(true);
  };

  const openEditTicketModal = (ticketObj) => {
    setEditingTicket(ticketObj);
    setEditTicketForm({
      visitor_name: ticketObj.visitor_name,
      visitor_phone: ticketObj.visitor_phone,
      visit_date: ticketObj.visit_date,
      status: ticketObj.status,
    });
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#E2D6C5] bg-[#FFFDF9] p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF0D8] text-[#7C4A2D] border border-[#D4A017]/40 shadow-xs">
                <TicketIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight text-[#2B1B12]">
                  Ticket & Pass Operations
                </h1>
                <p className="text-xs text-[#6E5445]">
                  Manage visitor bookings, issue entry passes, and configure ticket catalog types.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={openTypeModalForAdd}
              className="font-semibold"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Ticket Type</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowIssueModal(true)}
              className="font-bold"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>Issue Visitor Ticket</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6E5445]">
              <TicketIcon className="h-4 w-4 text-[#7C4A2D]" />
              <span>Total Bookings</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#2B1B12]">{stats.totalBooked}</p>
          </div>

          <div className="rounded-2xl border border-[#B8D4A0] bg-[#E4EEDC] p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#243205]">
              <CheckCircleIcon className="h-4 w-4 text-[#374B07]" />
              <span>Valid Passes</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#243205]">{stats.validCount}</p>
          </div>

          <div className="rounded-2xl border border-amber-300 bg-[#FAF0D8] p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7C4A2D]">
              <QrCodeIcon className="h-4 w-4 text-[#D4A017]" />
              <span>Redeemed (Used)</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#7C4A2D]">{stats.usedCount}</p>
          </div>

          <div className="rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6E5445]">
              <BanknotesIcon className="h-4 w-4 text-[#374B07]" />
              <span>Total Revenue</span>
            </div>
            <p className="mt-2 text-xl font-bold text-[#374B07]">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* Main Tabs Navigation */}
        <div className="flex items-center gap-3 border-b border-[#E2D6C5] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('booked')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'booked'
                ? 'bg-[#374B07] text-white shadow-xs'
                : 'text-[#5C4233] hover:bg-[#FAF0E4]'
            }`}
          >
            <TicketIcon className="h-4 w-4" />
            <span>Booked Tickets ({tickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('types')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'types'
                ? 'bg-[#374B07] text-white shadow-xs'
                : 'text-[#5C4233] hover:bg-[#FAF0E4]'
            }`}
          >
            <TagIcon className="h-4 w-4" />
            <span>Ticket Catalog Types ({ticketTypes.length})</span>
          </button>
        </div>

        {/* TAB 1: Booked Tickets List */}
        {activeTab === 'booked' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-3 shadow-2xs">
              <div className="relative flex-1 min-w-[200px]">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#7C4A2D]" />
                <input
                  type="text"
                  placeholder="Search by visitor name, phone, code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] pl-9 pr-3 py-1.5 text-xs text-[#2B1B12] placeholder:text-[#A08C7D] focus:border-[#374B07] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-[#7C4A2D]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-1.5 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="valid">Valid</option>
                  <option value="used">Used</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-1.5 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                >
                  <option value="">All Types</option>
                  {ticketTypes.map((tt) => (
                    <option key={tt.type} value={tt.type}>
                      {tt.label}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-1.5 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                />

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#E2D6C5]">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    title="Grid Cards View"
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === 'grid'
                        ? 'bg-[#374B07] text-white shadow-2xs'
                        : 'text-[#7C4A2D] hover:bg-[#EFE5D8]'
                    }`}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    title="Table View"
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === 'table'
                        ? 'bg-[#374B07] text-white shadow-2xs'
                        : 'text-[#7C4A2D] hover:bg-[#EFE5D8]'
                    }`}
                  >
                    <TableCellsIcon className="h-4 w-4" />
                  </button>
                </div>

                {(searchTerm || statusFilter || typeFilter || dateFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setTypeFilter('');
                      setDateFilter('');
                    }}
                    className="text-xs font-bold text-[#8C3A10] hover:underline ml-1"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Tickets Render (Grid Cards or Table) */}
            {loadingTickets ? (
              <div className="flex justify-center p-12">
                <Spinner size="lg" />
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState
                title="No Booked Tickets Found"
                description="No tickets match your filters. Click 'Issue Visitor Ticket' to create a new ticket pass."
                actionLabel="Issue Ticket Now"
                onAction={() => setShowIssueModal(true)}
              />
            ) : viewMode === 'grid' ? (
              /* GRID CARDS VIEW - CLICKABLE CARDS */
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tickets.map((t) => {
                  const isUsed = t.status === 'used';
                  const isCancelled = t.status === 'cancelled';
                  const badgeVariant = isUsed ? 'gold' : isCancelled ? 'critical' : 'excellent';

                  return (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/tickets/${t.id}`)}
                      className="group relative flex flex-col justify-between rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-5 shadow-2xs hover:border-smrmp-gold hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-center justify-between border-b border-[#E2D6C5]/60 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF0D8] text-[#7C4A2D] border border-[#D4A017]/30 group-hover:bg-[#374B07] group-hover:text-white transition-colors">
                              <QrCodeIcon className="h-4 w-4" />
                            </div>
                            <span className="font-mono text-sm font-bold text-[#2B1B12] group-hover:text-[#374B07] transition-colors">
                              {t.qr_ticket_code}
                            </span>
                          </div>
                          <Badge variant={badgeVariant}>{t.status}</Badge>
                        </div>

                        {/* Card Content */}
                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="font-bold text-sm text-[#2B1B12] group-hover:text-[#7C4A2D] transition-colors">
                              {t.visitor_name}
                            </p>
                            <p className="text-[11px] font-mono text-[#6E5445]">{t.visitor_phone}</p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[#6E5445]">Pass Type:</span>
                            <span className="font-semibold text-[#2B1B12] capitalize">{t.ticket_type} ({t.quantity}x)</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[#6E5445]">Visit Date:</span>
                            <span className="font-semibold text-[#2B1B12]">{formatDate(t.visit_date)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="border-t border-[#E2D6C5]/60 pt-3 flex items-center justify-between mt-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#6E5445] block">Total Amount</span>
                          <span className="font-display text-base font-bold text-[#374B07]">
                            {formatCurrency(t.total_amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedTicketForPass(t)}
                            title="Quick View QR Pass"
                            className="rounded-lg p-1.5 text-[#7C4A2D] hover:bg-[#FAF0E4]"
                          >
                            <QrCodeIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditTicketModal(t)}
                            title="Edit Ticket"
                            className="rounded-lg p-1.5 text-[#7C4A2D] hover:bg-[#FAF0E4]"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/tickets/${t.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#EFE5D8] px-2.5 py-1 text-xs font-bold text-[#5C4233] border border-[#D8C8B8] hover:bg-[#FAF0E4] hover:text-[#2B1B12] transition-colors"
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW - ROW CLICKABLE */
              <div className="overflow-hidden rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E2D6C5] bg-[#FAF6F0] text-[11px] font-bold uppercase tracking-wider text-[#6E5445]">
                      <tr>
                        <th className="px-4 py-3">Pass Code</th>
                        <th className="px-4 py-3">Visitor Info</th>
                        <th className="px-4 py-3">Ticket Type</th>
                        <th className="px-4 py-3">Qty & Price</th>
                        <th className="px-4 py-3">Visit Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2D6C5]/60 text-[#2B1B12]">
                      {tickets.map((t) => {
                        const isUsed = t.status === 'used';
                        const isCancelled = t.status === 'cancelled';
                        const badgeVariant = isUsed ? 'gold' : isCancelled ? 'critical' : 'excellent';

                        return (
                          <tr
                            key={t.id}
                            onClick={() => navigate(`/tickets/${t.id}`)}
                            className="hover:bg-[#FAF0E4]/80 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 font-mono font-bold text-[#2B1B12]">
                              <span className="inline-flex items-center gap-1.5 hover:text-[#374B07]">
                                <QrCodeIcon className="h-4 w-4 text-[#7C4A2D]" />
                                <span>{t.qr_ticket_code}</span>
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <p className="font-bold text-[#2B1B12] hover:text-[#374B07]">
                                {t.visitor_name}
                              </p>
                              <p className="text-[11px] text-[#6E5445] font-mono">{t.visitor_phone}</p>
                            </td>

                            <td className="px-4 py-3 capitalize font-semibold text-[#5C4233]">
                              {t.ticket_type}
                            </td>

                            <td className="px-4 py-3">
                              <span className="font-semibold">{t.quantity}x</span>
                              <span className="ml-1 text-[11px] text-[#6E5445]">
                                ({formatCurrency(t.total_amount)})
                              </span>
                            </td>

                            <td className="px-4 py-3 font-medium text-[#2B1B12]">
                              {formatDate(t.visit_date)}
                            </td>

                            <td className="px-4 py-3">
                              <Badge variant={badgeVariant}>
                                {t.status}
                              </Badge>
                            </td>

                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/tickets/${t.id}`}
                                  title="View Ticket Details Page"
                                  className="rounded-lg p-1 text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12]"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => setSelectedTicketForPass(t)}
                                  title="View Ticket / QR Code Modal"
                                  className="rounded-lg p-1 text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12]"
                                >
                                  <QrCodeIcon className="h-4 w-4" />
                                </button>

                                {t.status === 'valid' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateTicketMutation.mutate({
                                        id: t.id,
                                        data: { status: 'used' },
                                      })
                                    }
                                    title="Mark as Used / Redeemed"
                                    className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => openEditTicketModal(t)}
                                  title="Edit Details"
                                  className="rounded-lg p-1 text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12]"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this ticket?')) {
                                      deleteTicketMutation.mutate(t.id);
                                    }
                                  }}
                                  title="Delete Ticket"
                                  className="rounded-lg p-1 text-rose-700 hover:bg-rose-50"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Ticket Catalog Types */}
        {activeTab === 'types' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-[#2B1B12]">
                Active & Inactive Ticket Pricing Catalog
              </h2>
              <Button size="sm" variant="primary" onClick={openTypeModalForAdd}>
                <PlusIcon className="h-4 w-4" />
                <span>New Ticket Type</span>
              </Button>
            </div>

            {loadingTypes ? (
              <div className="flex justify-center p-12">
                <Spinner size="lg" />
              </div>
            ) : ticketTypes.length === 0 ? (
              <EmptyState
                title="No Ticket Types Configured"
                description="Add catalog ticket types (e.g. Adult, Student, VIP) for visitors to purchase."
                actionLabel="Add First Ticket Type"
                onAction={openTypeModalForAdd}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ticketTypes.map((tt) => (
                  <div
                    key={tt.id || tt.type}
                    className="flex flex-col justify-between rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-5 shadow-2xs hover:border-[#D4A017]/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[#E2D6C5]/60 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-[#7C4A2D]" />
                          <h3 className="font-display text-sm font-bold text-[#2B1B12]">
                            {tt.label}
                          </h3>
                        </div>
                        <Badge variant={tt.is_active ? 'excellent' : 'critical'}>
                          {tt.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <span className="font-mono text-xs font-bold text-[#7C4A2D] bg-[#FAF0D8] px-2 py-0.5 rounded-md border border-[#D4A017]/30">
                          {tt.type}
                        </span>
                        <p className="mt-2 text-xs text-[#5C4233] leading-relaxed">
                          {tt.description || 'No description provided'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#E2D6C5]/60 pt-3 flex items-center justify-between mt-2">
                      <span className="font-display text-lg font-bold text-[#374B07]">
                        {formatCurrency(tt.price_etb)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openTypeModalForEdit(tt)}
                          className="rounded-lg p-1.5 text-[#7C4A2D] hover:bg-[#FAF0E4] hover:text-[#2B1B12]"
                          title="Edit Type"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete ticket type "${tt.label}"?`)) {
                              deleteTypeMutation.mutate(tt.id || tt.type);
                            }
                          }}
                          className="rounded-lg p-1.5 text-rose-700 hover:bg-rose-50"
                          title="Delete Type"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: Issue New Ticket Pass */}
        <Modal
          open={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          title="Issue Museum Entry Ticket"
          size="md"
        >
          <form onSubmit={handleIssueSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                Visitor Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Abebe Bikila"
                  value={issueForm.visitor_name}
                  onChange={(e) => setIssueForm({ ...issueForm, visitor_name: e.target.value })}
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] pl-9 pr-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                />
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#7C4A2D]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                Visitor Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. +251911223344"
                  value={issueForm.visitor_phone}
                  onChange={(e) => setIssueForm({ ...issueForm, visitor_phone: e.target.value })}
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] pl-9 pr-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                />
                <PhoneIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#7C4A2D]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                  Ticket Type
                </label>
                <select
                  value={issueForm.ticket_type}
                  onChange={(e) => setIssueForm({ ...issueForm, ticket_type: e.target.value })}
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                >
                  {ticketTypes.map((tt) => (
                    <option key={tt.type} value={tt.type}>
                      {tt.label} ({tt.price_etb} ETB)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={issueForm.quantity}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, quantity: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                  Visit Date
                </label>
                <input
                  type="date"
                  required
                  value={issueForm.visit_date}
                  onChange={(e) => setIssueForm({ ...issueForm, visit_date: e.target.value })}
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                  Payment Method
                </label>
                <select
                  value={issueForm.payment_method}
                  onChange={(e) => setIssueForm({ ...issueForm, payment_method: e.target.value })}
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                >
                  <option value="telebirr">Telebirr</option>
                  <option value="chapa">Chapa</option>
                  <option value="cash">Cash (Counter)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2D6C5] flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowIssueModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={issueMutation.isPending}
              >
                Issue & Generate QR
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Edit Booked Ticket Details */}
        <Modal
          open={Boolean(editingTicket)}
          onClose={() => setEditingTicket(null)}
          title={`Edit Ticket: ${editingTicket?.qr_ticket_code || ''}`}
          size="md"
        >
          <form onSubmit={handleEditTicketSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                Visitor Name
              </label>
              <input
                type="text"
                required
                value={editTicketForm.visitor_name}
                onChange={(e) =>
                  setEditTicketForm({ ...editTicketForm, visitor_name: e.target.value })
                }
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
                value={editTicketForm.visitor_phone}
                onChange={(e) =>
                  setEditTicketForm({ ...editTicketForm, visitor_phone: e.target.value })
                }
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
                  value={editTicketForm.visit_date}
                  onChange={(e) =>
                    setEditTicketForm({ ...editTicketForm, visit_date: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                  Status
                </label>
                <select
                  value={editTicketForm.status}
                  onChange={(e) =>
                    setEditTicketForm({ ...editTicketForm, status: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                >
                  <option value="valid">Valid</option>
                  <option value="used">Used / Redeemed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2D6C5] flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingTicket(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={updateTicketMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Ticket Catalog Type (Add / Edit) */}
        <Modal
          open={showTypeModal || Boolean(editingType)}
          onClose={() => {
            setShowTypeModal(false);
            setEditingType(null);
          }}
          title={editingType ? `Edit Ticket Type: ${editingType.label}` : 'Create New Ticket Type'}
          size="md"
        >
          <form onSubmit={handleTypeSubmit} className="space-y-4">
            {!editingType && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                  Type Identifier Code (e.g. adult, student, tour)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. senior_citizen"
                  value={typeForm.type}
                  onChange={(e) => setTypeForm({ ...typeForm, type: e.target.value })}
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                Display Label
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Visitor Pass"
                value={typeForm.label}
                onChange={(e) => setTypeForm({ ...typeForm, label: e.target.value })}
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                Price (ETB)
              </label>
              <input
                type="number"
                min="0"
                required
                value={typeForm.price_etb}
                onChange={(e) => setTypeForm({ ...typeForm, price_etb: e.target.value })}
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4233] mb-1">
                Description
              </label>
              <textarea
                rows="3"
                placeholder="Details on pass access and eligibility..."
                value={typeForm.description}
                onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_check"
                checked={typeForm.is_active}
                onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-[#E2D6C5] text-[#374B07] focus:ring-[#374B07]"
              />
              <label htmlFor="is_active_check" className="text-xs font-bold text-[#2B1B12]">
                Is Active for Visitor Booking
              </label>
            </div>

            <div className="pt-3 border-t border-[#E2D6C5] flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowTypeModal(false);
                  setEditingType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={createTypeMutation.isPending || updateTypeMutation.isPending}
              >
                {editingType ? 'Update Type' : 'Create Type'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Digital Ticket QR Display */}
        <Modal
          open={Boolean(selectedTicketForPass)}
          onClose={() => setSelectedTicketForPass(null)}
          title="Digital Ticket Pass & QR Code"
          size="md"
        >
          {selectedTicketForPass && (
            <div className="py-2">
              <DigitalTicket ticket={selectedTicketForPass} />
            </div>
          )}
        </Modal>
      </div>
    </PrivateLayout>
  );
}
