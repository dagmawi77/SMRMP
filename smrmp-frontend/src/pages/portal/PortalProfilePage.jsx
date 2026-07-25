import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { usePortalProfile, useUpdatePortalProfile } from '../../hooks/usePortal';
import { GENDER_OPTIONS, LANGUAGE_OPTIONS } from '../../utils/constants';

const emptyForm = {
  name: '',
  phone: '',
  gender: '',
  date_of_birth: '',
  nationality: '',
  address: '',
  preferred_language: '',
  marketing_opt_in: false,
};

export default function PortalProfilePage() {
  const { data: profile, isLoading } = usePortalProfile();
  const updateProfile = useUpdatePortalProfile();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name || '',
      phone: profile.phone || '',
      gender: profile.gender || '',
      date_of_birth: profile.date_of_birth ? String(profile.date_of_birth).slice(0, 10) : '',
      nationality: profile.nationality || '',
      address: profile.address || '',
      preferred_language: profile.preferred_language || '',
      marketing_opt_in: Boolean(profile.marketing_opt_in),
    });
  }, [profile]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(form);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <>
      <PortalPageHeader
        showTitle={false}
        showBack={false}
        icon={UserCircleIcon}
        title="My profile"
        description="Keep your contact details up to date."
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="max-w-2xl">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" name="name" value={form.name} onChange={onChange} required />
              <Input label="Email" value={profile?.email || ''} disabled hint="Contact the museum to change your email" />
              <Input label="Phone" name="phone" value={form.phone} onChange={onChange} />
              <Input
                label="Date of birth"
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={onChange}
              />
              <Select
                label="Gender"
                name="gender"
                options={GENDER_OPTIONS}
                value={form.gender}
                onChange={onChange}
                placeholder="Select gender"
              />
              <Input label="Nationality" name="nationality" value={form.nationality} onChange={onChange} />
              <Select
                label="Preferred language"
                name="preferred_language"
                options={LANGUAGE_OPTIONS}
                value={form.preferred_language}
                onChange={onChange}
                placeholder="Select language"
              />
              <Input label="National ID" value={profile?.national_id || ''} disabled hint="Not editable" />
            </div>

            <Input label="Address" name="address" value={form.address} onChange={onChange} />

            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-3 text-sm text-[#5C4233]">
              <input
                type="checkbox"
                name="marketing_opt_in"
                checked={form.marketing_opt_in}
                onChange={onChange}
                className="h-4 w-4 accent-smrmp-green"
              />
              Send me museum news and event updates
            </label>

            <div className="flex items-center justify-between border-t border-[#E2D6C5] pt-4 text-xs text-[#6E5445]">
              <span>
                {profile?.total_visits ?? 0}
                {' '}
                total visits recorded
              </span>
              <Button type="submit" variant="primary" loading={updateProfile.isPending}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}
