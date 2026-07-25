import DashboardPage from './DashboardPage';
import MaintenanceDashboardPage from '../maintenance/MaintenanceDashboardPage';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../utils/constants';

/**
 * Serves the dashboard that matches the signed-in role at a single `/dashboard` URL.
 */
export default function RoleDashboard() {
  const role = useAuthStore((state) => state.user?.role);

  if (role === ROLES.MAINTENANCE) {
    return <MaintenanceDashboardPage />;
  }

  return <DashboardPage />;
}
