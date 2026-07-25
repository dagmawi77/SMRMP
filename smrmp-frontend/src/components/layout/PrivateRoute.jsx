import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../ui/Spinner';
import useAuthStore from '../../store/authStore';
import { ROLE_REDIRECTS } from '../../utils/constants';

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {string[]} [props.roles] legacy role allow-list
 * @param {string|string[]} [props.permissions] required permission(s) — all must match unless anyPermission
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

  if (user?.must_change_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
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
    if (!allowed) {
      const roleHome = ROLE_REDIRECTS[user?.role] || '/';
      return (
        <Navigate
          to={roleHome === location.pathname ? '/' : roleHome}
          replace
        />
      );
    }
  } else if (roles?.length && !hasRole(...roles)) {
    const roleHome = ROLE_REDIRECTS[user?.role] || '/';
    return (
      <Navigate to={roleHome === location.pathname ? '/' : roleHome} replace />
    );
  }

  return children;
}
