import { Link } from 'react-router-dom';
import { PlusIcon, TicketIcon } from '@heroicons/react/24/outline';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { usePortalTickets } from '../../hooks/usePortal';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TICKET_STATUS_BADGE = {
  valid: 'excellent',
  used: 'default',
  cancelled: 'critical',
};

export default function PortalTicketsPage() {
  const { data: tickets = [], isLoading } = usePortalTickets();

  return (
    <>
      <PortalPageHeader
        showTitle={false}
        icon={TicketIcon}
        title="My tickets"
        description="Entry passes purchased under your account or phone number."
        actions={(
          <Link to="/portal/tickets/buy">
            <Button variant="primary">
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              <span>Buy tickets</span>
            </Button>
          </Link>
        )}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <EmptyState
            icon="🎫"
            title="No tickets yet"
            description="Purchase a museum entry pass to see it appear here."
            action={(
              <Link to="/portal/tickets/buy">
                <Button variant="primary">Buy tickets</Button>
              </Link>
            )}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id} hover className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-[#7C4A2D]">{ticket.qr_ticket_code}</p>
                <p className="text-sm font-bold capitalize text-[#2B1B12]">{ticket.ticket_type} pass</p>
                <p className="mt-0.5 text-xs text-[#6E5445]">
                  {formatDate(ticket.visit_date)}
                  {' · '}
                  {ticket.quantity}
                  {' '}
                  person(s)
                  {' · '}
                  {formatCurrency(ticket.total_amount)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={TICKET_STATUS_BADGE[ticket.status] || 'default'}>{ticket.status}</Badge>
                <Link
                  to={`/portal/tickets/pass/${encodeURIComponent(ticket.qr_ticket_code)}`}
                  className="text-xs font-bold text-[#374B07] transition-colors hover:underline"
                >
                  View pass
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
