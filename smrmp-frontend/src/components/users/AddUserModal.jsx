import { useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { STAFF_ROLE_OPTIONS, DEPARTMENT_OPTIONS } from '../../utils/constants';
import { useCreateUser } from '../../hooks/useUsers';
import getApiErrorMessage from '../../utils/apiError';
import toast from 'react-hot-toast';

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
  const createUserMutation = useCreateUser();
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

  const selectedRoleOption = STAFF_ROLE_OPTIONS.find((r) => r.value === formData.role);

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
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.role) {
      errors.role = 'Role selection is required';
    } else if (formData.role === 'visitor') {
      errors.role = 'Visitor role cannot be selected for staff management';
    }

    if (!formData.password) {
      errors.password = 'Initial password is required';
    } else if (formData.password.length < 6) {
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
      await createUserMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: formData.department,
        role: formData.role,
        password: formData.password,
        status: formData.status,
      });

      toast.success(`Staff user "${formData.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'Administration & IT',
        role: 'curator',
        password: '',
        status: 'active',
      });
      setFormErrors({});

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to create user');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add New Staff User"
      size="lg"
    >
      <div className="space-y-5">
        {/* Informative banner explaining staff roles vs visitors */}
        <div className="rounded-xl border border-amber-200 bg-[#FAF0D8]/70 p-4 text-xs text-[#5C4233]">
          <div className="flex items-start gap-2.5">
            <InformationCircleIcon className="h-5 w-5 shrink-0 text-[#D4A017] mt-0.5" />
            <div>
              <p className="font-bold text-[#2B1B12] text-sm">Staff Account Provisioning</p>
              <p className="mt-1 leading-relaxed">
                This form creates official museum staff and administrative user accounts. Visitor accounts are created automatically during ticket booking and visitor self-registration and are excluded here.
              </p>
            </div>
          </div>
        </div>

        {errorMsg && <Alert variant="error" message={errorMsg} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <Input
              label="Full Name"
              name="name"
              placeholder="e.g. Abebe Bikila"
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
              placeholder="e.g. abebe@adwamuseum.gov.et"
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
              placeholder="+251 91 123 4567"
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

          {/* Role Selection (Strictly excluding Visitor) */}
          <div className="space-y-2">
            <Select
              label="Assign System Role (Staff Only)"
              name="role"
              icon={ShieldCheckIcon}
              options={STAFF_ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
              value={formData.role}
              onChange={handleChange}
              error={formErrors.role}
              required
            />

            {selectedRoleOption && (
              <div className="rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-3 text-xs text-[#5C4233]">
                <span className="font-bold text-[#2B1B12]">{selectedRoleOption.label}:</span>{' '}
                {selectedRoleOption.description}
              </div>
            )}
          </div>

          {/* Password & Show/Hide Toggle */}
          <div className="relative">
            <Input
              label="Initial Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              icon={KeyIcon}
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              required
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

          {/* Account Status Selection */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C4233]">
              Account Initial Status
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
                <CheckCircleIcon className={`h-4 w-4 ${formData.status === 'active' ? 'text-emerald-600' : 'text-stone-400'}`} />
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

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E2D6C5] pt-4 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createUserMutation.isPending}
            >
              Create Staff User
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
