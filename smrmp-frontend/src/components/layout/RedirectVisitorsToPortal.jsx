import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * Keeps authenticated visitors inside VisitorLayout.
 * Public/anonymous users still see the standalone public page.
 */
export default function RedirectVisitorsToPortal({ to, children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.role === 'visitor') {
    return <Navigate to={to} replace />;
  }

  return children;
}
