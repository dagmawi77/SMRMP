import { Link } from 'react-router-dom';
import { PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { usePortalBookings } from '../../hooks/usePortal';
import { BOOKING_STATUS_BADGE } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function PortalBookingsPage() {
  const { data: bookings = [], isLoading } = usePortalBookings();

  return (
    <>
      <PortalPageHeader
        showTitle={false}
        icon={UserGroupIcon}
        title="My group bookings"
        description="Group visit requests made with your contact email."
        actions={(
          <Link to="/portal/bookings/new">
            <Button variant="primary">
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              <span>Book a group visit</span>
            </Button>
          </Link>
        )}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <EmptyState
            icon="🧑‍🤝‍🧑"
            title="No group bookings yet"
            description="Planning a school trip, tour, or family gathering? Book a group visit to the museum."
            action={(
              <Link to="/portal/bookings/new">
                <Button variant="primary">Book a group visit</Button>
              </Link>
            )}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} hover className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-[#7C4A2D]">{booking.booking_reference}</p>
                <p className="text-sm font-bold text-[#2B1B12]">{booking.group_name}</p>
                <p className="mt-0.5 text-xs text-[#6E5445]">
                  {formatDate(booking.visit_date)}
                  {' · '}
                  {booking.visitor_count}
                  {' '}
                  visitor(s)
                  {' · '}
                  {formatCurrency(booking.total_amount)}
                </p>
              </div>
              <Badge variant={BOOKING_STATUS_BADGE[booking.status] || 'default'}>{booking.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
