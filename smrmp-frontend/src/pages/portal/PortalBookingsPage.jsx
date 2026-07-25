import { Navigate } from 'react-router-dom';

/**
 * Legacy portal bookings page — redirects to unified /portal/tickets?tab=group.
 */
export default function PortalBookingsPage() {
  return <Navigate to="/portal/tickets?tab=group" replace />;
}
