import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { authApi } from '../../api/authApi';
import useAuthStore from '../../store/authStore';
import { getHomePath } from '../../utils/constants';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setAuth, token } = useAuthStore();
  const nestedInPortal = location.pathname.startsWith('/portal/');
  const isVisitor = user?.role === 'visitor';
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  // Keep visitors inside the persistent portal shell
  if (isVisitor && !nestedInPortal) {
    return <Navigate to="/portal/change-password" replace />;
  }

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(form);
      const nextUser = { ...user, must_change_password: false };
      setAuth(nextUser, token);
      toast.success('Password updated');
      navigate(getHomePath(nextUser.role), { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const formCard = (
    <div className="mx-auto max-w-md">
      {nestedInPortal ? (
        <PortalPageHeader
          showTitle={false}
          title="Change Password"
          description="Update your account password."
        />
      ) : null}
      <Alert variant="warning" title="Password change required" className="mb-4">
        Your account was created with a temporary password. Set a new password to continue.
      </Alert>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-6"
      >
        <Input
          label="Current password"
          name="currentPassword"
          type="password"
          required
          value={form.currentPassword}
          onChange={onChange}
        />
        <Input
          label="New password"
          name="newPassword"
          type="password"
          required
          value={form.newPassword}
          onChange={onChange}
          hint="Min 8 chars with upper, lower, number, and special character"
        />
        <Input
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          required
          value={form.confirmPassword}
          onChange={onChange}
        />
        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Update password
        </Button>
      </form>
    </div>
  );

  if (nestedInPortal) {
    return formCard;
  }

  return <PrivateLayout>{formCard}</PrivateLayout>;
}
