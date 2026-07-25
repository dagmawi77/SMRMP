import { Link, useParams } from 'react-router-dom';
import { TicketIcon } from '@heroicons/react/24/outline';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import DigitalTicket from '../../components/tickets/DigitalTicket';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { usePortalTickets } from '../../hooks/usePortal';

/**
 * Read-only digital pass view for visitors.
 * Does NOT call /tickets/verify (which marks the ticket used).
 */
export default function PortalTicketPassPage() {
  const { code } = useParams();
  const { data: tickets = [], isLoading } = usePortalTickets();
  const ticket = tickets.find(
    (t) => t.qr_ticket_code === code || t.id === code,
  );

  return (
    <>
      <PortalPageHeader
        showTitle={false}
        icon={TicketIcon}
        title="Digital pass"
        description="Show this pass at the gate. Staff will scan it to validate entry."
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !ticket ? (
        <Card>
          <EmptyState
            icon="🎫"
            title="Pass not found"
            description="This ticket is not linked to your account."
            action={(
              <Link to="/portal/tickets">
                <Button variant="primary">Back to my tickets</Button>
              </Link>
            )}
          />
        </Card>
      ) : (
        <DigitalTicket ticket={ticket} showSandboxBanner={false} />
      )}
    </>
  );
}
