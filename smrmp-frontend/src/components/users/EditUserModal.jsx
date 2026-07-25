import { useState, useEffect } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { STAFF_ROLE_OPTIONS, DEPARTMENT_OPTIONS } from '../../utils/constants';
import { useUpdateUser } from '../../hooks/useUsers';
import getApiErrorMessage from '../../utils/apiError';
import toast from 'react-hot-toast';

export default function EditUserModal({ user, isOpen, onClose, onSuccess }) {
  const updateUserMutation = useUpdateUser();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Administration & IT',
    role: 'curator',
    password: '',
    status: 'active',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || 'Administration & IT',
        role: user.role && user.role !== 'visitor' ? user.role : 'curator',
        password: '',
        status: user.status || 'active',
      });
      setErrorMsg('');
      setFormErrors({});
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.role) {
      errors.role = 'Role selection is required';
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: formData.department,
        role: formData.role,
        status: formData.status,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      await updateUserMutation.mutateAsync({
        id: user.id,
        data: payload,
      });

      toast.success(`User "${formData.name}" updated successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to update user');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Edit User: ${user.name}`}
      size="lg"
    >
      <div className="space-y-5">
        {errorMsg && <Alert variant="error" message={errorMsg} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <Input
              label="Full Name"
              name="name"
              icon={UserIcon}
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              required
            />

            {/* Email Address */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              icon={EnvelopeIcon}
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Phone Number */}
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              icon={PhoneIcon}
              value={formData.phone}
              onChange={handleChange}
              error={formErrors.phone}
            />

            {/* Department */}
            <Select
              label="Department"
              name="department"
              icon={BuildingOfficeIcon}
              options={DEPARTMENT_OPTIONS}
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          {/* Role Selection (Excludes Visitor) */}
          <Select
            label="System Role (Staff Only)"
            name="role"
            icon={ShieldCheckIcon}
            options={STAFF_ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
            value={formData.role}
            onChange={handleChange}
            error={formErrors.role}
            required
          />

          {/* Optional Password Update */}
          <div className="relative">
            <Input
              label="New Password (leave blank to keep existing)"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={KeyIcon}
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-[#7C4A2D] hover:text-[#2B1B12]"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Account Status Toggle */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">
              Account Status
            </label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                formData.status === 'active'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-[#E2D6C5] bg-[#FFFDF9] text-[#5C4233] hover:bg-[#FAF0E4]'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={`h-2 w-2 rounded-full ${formData.status === 'active' ? 'bg-emerald-600' : 'bg-stone-400'}`} />
                <span>Active</span>
              </label>

              <label className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                formData.status === 'inactive'
                  ? 'border-amber-500 bg-amber-50 text-amber-900'
                  : 'border-[#E2D6C5] bg-[#FFFDF9] text-[#5C4233] hover:bg-[#FAF0E4]'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={`h-2 w-2 rounded-full ${formData.status === 'inactive' ? 'bg-amber-500' : 'bg-stone-400'}`} />
                <span>Inactive</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E2D6C5] pt-4 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={updateUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={updateUserMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
