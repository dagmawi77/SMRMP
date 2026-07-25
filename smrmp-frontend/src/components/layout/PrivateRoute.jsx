import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../ui/Spinner';
import useAuthStore from '../../store/authStore';
import { ROLE_REDIRECTS } from '../../utils/constants';

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {string[]} [props.roles] required role allow-list (any match)
 * @param {string|string[]} [props.permissions] required permission(s)
 * @param {boolean} [props.anyPermission] if true, any listed permission is enough
 */
export default function PrivateRoute({
  children,
  roles,
  permissions,
  anyPermission = false,
}) {
  const { user, isAuthenticated, isRestoringSession, hasRole, can, canAny } =
    useAuthStore();
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

  if (user?.must_change_password) {
    const passwordPath = user?.role === 'visitor' ? '/portal/change-password' : '/change-password';
    if (location.pathname !== passwordPath && location.pathname !== '/change-password') {
      return <Navigate to={passwordPath} replace />;
    }
  }

  const deny = () => {
    const roleHome = ROLE_REDIRECTS[user?.role] || '/';
    return (
      <Navigate
        to={roleHome === location.pathname ? '/' : roleHome}
        replace
      />
    );
  };

  // Role gate (AND with permissions when both are set)
  if (roles?.length && !hasRole(...roles)) {
    return deny();
  }

  const requiredPerms = permissions
    ? Array.isArray(permissions)
      ? permissions
      : [permissions]
    : [];

  if (requiredPerms.length) {
    const allowed = anyPermission
      ? canAny(...requiredPerms)
      : requiredPerms.every((p) => can(p));
    if (!allowed) return deny();
  }

  return children;
}
