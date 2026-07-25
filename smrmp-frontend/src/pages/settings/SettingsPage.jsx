import useAuthStore from '../../store/authStore';
import AdminSettingsPage from '../admin/AdminSettingsPage';
import CuratorSettingsPage from './CuratorSettingsPage';

export default function SettingsPage() {
  const { user, hasRole, can } = useAuthStore();

  const isAdmin = user?.role === 'admin' || hasRole('admin') || can('users.read');

  if (isAdmin) {
    return <AdminSettingsPage />;
  }

  return <CuratorSettingsPage />;
}
