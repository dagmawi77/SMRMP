import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../ui/Spinner';
import useAuthStore from '../../store/authStore';
import { ROLE_REDIRECTS } from '../../utils/constants';

export default function PrivateRoute({ children, roles }) {
  const { user, isAuthenticated, isRestoringSession, hasRole } = useAuthStore();
  const location = useLocation();

  if (isRestoringSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-smrmp-brown">
        <Spinner size="lg" />
        <span className="sr-only">Restoring your session</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length && !hasRole(...roles)) {
    // Send people to their own landing page rather than a fixed one, which
    // would bounce forever for roles that can't reach it either.
    const roleHome = ROLE_REDIRECTS[user?.role] || '/';
    return <Navigate to={roleHome === location.pathname ? '/' : roleHome} replace />;
  }

  return children;
}
