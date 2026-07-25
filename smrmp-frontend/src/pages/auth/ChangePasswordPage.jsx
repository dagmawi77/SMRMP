import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PrivateLayout from '../../components/layout/PrivateLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { authApi } from '../../api/authApi';
import useAuthStore from '../../store/authStore';
import { ROLE_REDIRECTS } from '../../utils/constants';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, setAuth, token } = useAuthStore();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

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
      navigate(ROLE_REDIRECTS[nextUser.role] || '/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateLayout>
      <div className="mx-auto max-w-md">
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
    </PrivateLayout>
  );
}
