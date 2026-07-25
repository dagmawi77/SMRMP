import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, TicketIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import DigitalTicket from '../../components/tickets/DigitalTicket';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { usePortalTickets, usePortalBookings } from '../../hooks/usePortal';

/**
 * Read-only digital pass view for visitors (Individual and Group Passes).
 * Does NOT call /tickets/verify (which marks the ticket used by staff).
 */
export default function PortalTicketPassPage() {
  const { code } = useParams();
  const { data: tickets = [], isLoading: loadingTickets } = usePortalTickets();
  const { data: bookings = [], isLoading: loadingBookings } = usePortalBookings();

  const isLoading = loadingTickets || loadingBookings;

  const ticket = tickets.find(
    (t) => t.qr_ticket_code === code || t.id === code,
  );

  const groupBooking = bookings.find(
    (b) => b.booking_reference === code || b.id === code,
  );

  const foundPass = ticket || groupBooking;
  const isGroup = Boolean(groupBooking);

  return (
    <>
      <PortalPageHeader
        showTitle={false}
        icon={isGroup ? UserGroupIcon : TicketIcon}
        title={isGroup ? 'Group Digital Pass' : 'Individual Digital Pass'}
        description="Show this digital pass at the museum entrance scanner or staff check-in station."
        actions={(
          <Link to={isGroup ? '/portal/tickets?tab=group' : '/portal/tickets'}>
            <Button variant="secondary" size="sm">
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to my passes</span>
            </Button>
          </Link>
        )}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !foundPass ? (
        <Card>
          <EmptyState
            icon="🎫"
            title="Pass not found"
            description="We couldn't locate a valid ticket or group booking matching this code on your account."
            action={(
              <Link to="/portal/tickets">
                <Button variant="primary">View all my passes</Button>
              </Link>
            )}
          />
        </Card>
      ) : (
        <div className="py-2">
          <DigitalTicket
            ticket={ticket}
            groupBooking={groupBooking}
            showSandboxBanner={false}
          />
        </div>
      )}
    </>
  );
}
