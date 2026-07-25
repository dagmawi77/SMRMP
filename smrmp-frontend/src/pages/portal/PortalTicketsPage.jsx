import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  TicketIcon,
  UsersIcon,
  QrCodeIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
  SparklesIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import BuyTicketsDropdown from '../../components/tickets/BuyTicketsDropdown';
import DigitalTicket from '../../components/tickets/DigitalTicket';
import { usePortalTickets, usePortalBookings } from '../../hooks/usePortal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BOOKING_STATUS_BADGE } from '../../utils/constants';

const TICKET_STATUS_BADGE = {
  valid: 'excellent',
  used: 'default',
  cancelled: 'critical',
  pending: 'warning',
};

export default function PortalTicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all'; // 'all' | 'individual' | 'group'

  const { data: tickets = [], isLoading: loadingTickets } = usePortalTickets();
  const { data: bookings = [], isLoading: loadingBookings } = usePortalBookings();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPass, setSelectedPass] = useState(null); // { item, type: 'individual' | 'group' }
  const [copiedCode, setCopiedCode] = useState(null);

  const isLoading = loadingTickets || loadingBookings;

  // Change tab handler
  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  // Copy reference handler
  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Pass code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Combine list for 'all' tab or filter
  const combinedPasses = useMemo(() => {
    const indList = tickets.map((t) => ({ ...t, _passKind: 'individual' }));
    const grpList = bookings.map((b) => ({ ...b, _passKind: 'group' }));

    if (activeTab === 'individual') return indList;
    if (activeTab === 'group') return grpList;
    return [...indList, ...grpList].sort((a, b) => new Date(b.created_at || b.visit_date) - new Date(a.created_at || a.visit_date));
  }, [tickets, bookings, activeTab]);

  // Apply Search & Status Filter
  const filteredPasses = useMemo(() => {
    return combinedPasses.filter((pass) => {
      const isGroup = pass._passKind === 'group';
      const refCode = isGroup ? pass.booking_reference : pass.qr_ticket_code;
      const title = isGroup ? pass.group_name : `${pass.ticket_type} pass`;
      const name = isGroup ? pass.contact_name : pass.visitor_name;
      const status = (pass.status || 'valid').toLowerCase();

      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        refCode?.toLowerCase().includes(query) ||
        title?.toLowerCase().includes(query) ||
        name?.toLowerCase().includes(query);

      // Status match
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'valid' && (status === 'valid' || status === 'confirmed')) ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [combinedPasses, searchQuery, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const validTickets = tickets.filter((t) => (t.status || 'valid') === 'valid');
    const validBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending' || b.status === 'valid');

    const totalValid = validTickets.length + validBookings.length;
    const totalVisitors =
      validTickets.reduce((acc, t) => acc + (t.quantity || 1), 0) +
      validBookings.reduce((acc, b) => acc + (b.visitor_count || 1), 0);

    return {
      totalValid,
      individualCount: tickets.length,
      groupCount: bookings.length,
      totalVisitors,
    };
  }, [tickets, bookings]);

  return (
    <>
      <PortalPageHeader
        showTitle={false}
        showBack={false}
        icon={TicketIcon}
        title="My passes & tickets"
        description="View, manage, and access your digital gate passes and group bookings."
        actions={(
          <div className="flex items-center gap-2">
            <BuyTicketsDropdown variant="primary" buttonText="Buy pass" />
            <Link to="/portal/tickets/buy?tab=group">
              <Button variant="secondary" size="md" className="hidden sm:inline-flex">
                <PlusIcon className="h-4 w-4" />
                <span>Book group visit</span>
              </Button>
            </Link>
          </div>
        )}
      />

      {/* Summary Stats Overview */}
      <div className="mb-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover className="flex items-center gap-3.5 border-l-4 border-l-emerald-600 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E4EEDC] text-[#374B07]">
            <CheckCircleIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.totalValid}</p>
            <p className="text-xs font-semibold text-[#6E5445]">Active Gate Passes</p>
          </div>
        </Card>

        <Card hover className="flex items-center gap-3.5 border-l-4 border-l-smrmp-gold p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF0D8] text-[#7C4A2D]">
            <TicketIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.individualCount}</p>
            <p className="text-xs font-semibold text-[#6E5445]">Individual Passes</p>
          </div>
        </Card>

        <Card hover className="flex items-center gap-3.5 border-l-4 border-l-sky-600 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E2ECF5] text-[#1A4568]">
            <UserGroupIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.groupCount}</p>
            <p className="text-xs font-semibold text-[#6E5445]">Group Bookings</p>
          </div>
        </Card>

        <Card hover className="flex items-center gap-3.5 border-l-4 border-l-amber-600 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EFE0] text-[#8C581E]">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{stats.totalVisitors}</p>
            <p className="text-xs font-semibold text-[#6E5445]">Total Guests Included</p>
          </div>
        </Card>
      </div>

      {/* Tabs & Controls Bar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Tab Selector */}
        <div className="flex rounded-2xl bg-[#EFE5D8] p-1 border border-[#D8C8B8]">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-4 text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#FAF6F0] text-[#2B1B12] shadow-xs ring-1 ring-[#D4A017]/40'
                : 'text-[#7C4A2D] hover:text-[#2B1B12] hover:bg-[#FAF0E4]/60'
            }`}
          >
            <SparklesIcon className="h-4 w-4 text-[#7C4A2D]" />
            <span>All Passes ({tickets.length + bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('individual')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-4 text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'individual'
                ? 'bg-[#FAF6F0] text-[#2B1B12] shadow-xs ring-1 ring-[#D4A017]/40'
                : 'text-[#7C4A2D] hover:text-[#2B1B12] hover:bg-[#FAF0E4]/60'
            }`}
          >
            <TicketIcon className="h-4 w-4 text-[#374B07]" />
            <span>Individual ({tickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('group')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-4 text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'group'
                ? 'bg-[#FAF6F0] text-[#2B1B12] shadow-xs ring-1 ring-[#D4A017]/40'
                : 'text-[#7C4A2D] hover:text-[#2B1B12] hover:bg-[#FAF0E4]/60'
            }`}
          >
            <UserGroupIcon className="h-4 w-4 text-[#1A4568]" />
            <span>Group Visits ({bookings.length})</span>
          </button>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:w-64">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C4A2D]" />
            <input
              type="text"
              placeholder="Search reference, pass name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#D8C8B8] bg-[#FAF6F0] py-1.5 pl-9 pr-3 text-xs font-medium text-[#2B1B12] placeholder-[#8B7668] focus:border-smrmp-gold focus:outline-none focus:ring-1 focus:ring-smrmp-gold"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[#D8C8B8] bg-[#FAF6F0] px-2.5 py-1.5 text-xs text-[#2B1B12]">
            <FunnelIcon className="h-3.5 w-3.5 text-[#7C4A2D]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-[#2B1B12] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="valid">Valid / Confirmed</option>
              <option value="used">Used / Checked-in</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredPasses.length === 0 ? (
        <Card className="py-10">
          <EmptyState
            icon={activeTab === 'group' ? '🧑‍🤝‍🧑' : '🎫'}
            title={
              searchQuery || statusFilter !== 'all'
                ? 'No matching passes found'
                : activeTab === 'individual'
                ? 'No individual tickets yet'
                : activeTab === 'group'
                ? 'No group bookings yet'
                : 'No tickets or group passes found'
            }
            description={
              searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search terms or status filter.'
                : activeTab === 'group'
                ? 'Planning a group, school, or family visit? Reserve a group pass to see it here.'
                : 'Purchase a museum entry pass or book a group visit to see your digital pass here.'
            }
            action={
              searchQuery || statusFilter !== 'all' ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Reset filters
                </Button>
              ) : activeTab === 'group' ? (
                <Link to="/portal/tickets/buy?tab=group">
                  <Button variant="primary">Book a group visit</Button>
                </Link>
              ) : (
                <BuyTicketsDropdown variant="primary" buttonText="Buy entry pass" />
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPasses.map((pass) => {
            const isGroup = pass._passKind === 'group';
            const refCode = isGroup ? pass.booking_reference : pass.qr_ticket_code;
            const title = isGroup ? pass.group_name : `${pass.ticket_type} Pass`;
            const count = isGroup ? pass.visitor_count : pass.quantity;
            const countLabel = isGroup ? 'visitors' : 'guest(s)';
            const status = (pass.status || 'valid').toLowerCase();
            const badgeVariant = isGroup
              ? BOOKING_STATUS_BADGE[status] || 'default'
              : TICKET_STATUS_BADGE[status] || 'default';

            return (
              <Card
                key={`${pass._passKind}-${pass.id}`}
                className="relative overflow-hidden border border-[#D8C8B8] bg-[#FFFDF9] p-0 shadow-xs transition-all hover:shadow-md hover:border-[#D4A017]/60"
              >
                {/* Top Notch Accent Banner */}
                <div className="flex items-center justify-between border-b border-[#E2D6C5] bg-[#FAF6F0] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {isGroup ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E2ECF5] px-2.5 py-0.5 text-[10px] font-bold text-[#1A4568]">
                        <UserGroupIcon className="h-3 w-3" />
                        <span>GROUP PASS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E4EEDC] px-2.5 py-0.5 text-[10px] font-bold text-[#374B07]">
                        <TicketIcon className="h-3 w-3" />
                        <span>INDIVIDUAL PASS</span>
                      </span>
                    )}
                    <Badge variant={badgeVariant}>{status}</Badge>
                  </div>

                  <p className="text-[11px] font-semibold text-[#7C4A2D]">
                    {formatDate(pass.visit_date)}
                  </p>
                </div>

                {/* Card Main Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-display text-base font-bold text-[#2B1B12]">{title}</h4>
                      <p className="mt-0.5 text-xs text-[#6E5445]">
                        {isGroup ? `Organizer: ${pass.contact_name}` : `Holder: ${pass.visitor_name}`}
                      </p>
                    </div>

                    {/* QR Code Quick Preview Thumbnail */}
                    <button
                      type="button"
                      onClick={() => setSelectedPass({ item: pass, type: pass._passKind })}
                      className="group flex flex-col items-center justify-center rounded-xl border border-[#D8C8B8] bg-[#FAF6F0] p-1.5 hover:bg-[#FAF0D8] hover:border-[#D4A017] transition-all cursor-pointer"
                      title="Click to view digital pass QR"
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(refCode)}`}
                        alt="QR Thumbnail"
                        className="h-10 w-10 rounded-md object-contain"
                      />
                      <span className="mt-1 text-[9px] font-bold text-[#7C4A2D] group-hover:underline">Scan QR</span>
                    </button>
                  </div>

                  {/* Reference & Metadata Pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C8B8] bg-[#EFE5D8] px-2.5 py-1 font-mono text-xs font-bold text-[#5C4233]">
                      <span>{refCode}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(refCode, e)}
                        title="Copy reference code"
                        className="cursor-pointer text-[#7C4A2D] hover:text-[#2B1B12]"
                      >
                        {copiedCode === refCode ? (
                          <CheckIcon className="h-3.5 w-3.5 text-emerald-700" />
                        ) : (
                          <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <span className="rounded-lg bg-[#FAF0D8] px-2.5 py-1 text-xs font-bold text-[#7C4A2D]">
                      {count} {countLabel}
                    </span>

                    <span className="rounded-lg bg-[#EFE5D8] px-2.5 py-1 text-xs font-bold text-[#5C4233]">
                      {formatCurrency(pass.total_amount)}
                    </span>

                    {isGroup && pass.guide_required ? (
                      <span className="rounded-lg bg-[#E2ECF5] px-2.5 py-1 text-xs font-bold text-[#1A4568]">
                        Guide Included
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between border-t border-[#E2D6C5] bg-[#FAF6F0]/80 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPass({ item: pass, type: pass._passKind })}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#374B07] hover:text-[#283505] transition-colors cursor-pointer"
                  >
                    <QrCodeIcon className="h-4 w-4" />
                    <span>View Pass / QR Code</span>
                  </button>

                  <Link
                    to={`/portal/tickets/pass/${encodeURIComponent(refCode)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#7C4A2D] hover:text-[#2B1B12] transition-colors"
                  >
                    <span>Pass Page</span>
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal displaying Digital Pass with QR Code */}
      <Modal
        open={Boolean(selectedPass)}
        onClose={() => setSelectedPass(null)}
        title={selectedPass?.type === 'group' ? 'Group Digital Pass' : 'Individual Digital Pass'}
        size="md"
      >
        {selectedPass && (
          <DigitalTicket
            ticket={selectedPass.type === 'individual' ? selectedPass.item : null}
            groupBooking={selectedPass.type === 'group' ? selectedPass.item : null}
            showSandboxBanner={false}
          />
        )}
      </Modal>
    </>
  );
}
