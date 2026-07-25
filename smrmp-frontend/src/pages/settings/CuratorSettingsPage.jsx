import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  UserIcon,
  SparklesIcon,
  BuildingLibraryIcon,
  BellIcon,
  KeyIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  LanguageIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  LockClosedIcon,
  CameraIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PasswordStrengthMeter from '../../components/registration/PasswordStrengthMeter';
import useAuthStore from '../../store/authStore';
import { authApi } from '../../api/authApi';
import { DEPARTMENT_OPTIONS } from '../../utils/constants';

const DEFAULT_CURATOR_PREFERENCES = {
  // AI & Cataloging
  aiLanguage: 'am', // Amharic
  aiTone: 'academic',
  requireCuratorReview: true,
  duplicateSensitivity: 'medium',
  autoGenerateAudio: true,
  audioVoice: 'am-female-meskerem',

  // Museum Standards & Accessions
  accessionPrefix: 'ADM-2026-',
  defaultGallery: 'Hall 1: Menelik & Taytu Archival Gallery',
  defaultStorageVault: 'Vault A - Climate Controlled (Manuscripts & Arms)',
  defaultCondition: 'good',

  // Notifications
  notifyConservationAlerts: true,
  notifyPendingAiReviews: true,
  notifyExhibitionDeadlines: true,
  notifyQrScanSpikes: false,
  emailDigestFrequency: 'daily',

  // Curatorial Bio & Domain
  curatorTitle: 'Senior Curator of Adwa Victory Collections',
  specialization: '19th Century Arms, Imperial Regalia, Battle Maps & Archival Manuscripts',
  officeLocation: 'Curatorial Wing B, Gallery Floor 2',
  curatorBio: 'Specializing in Solomonic military history and archival conservation. Oversees cataloging and AI narrative review for Adwa Victory Memorial Museum artifacts.',
};

export default function CuratorSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Avatar Picture State
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Kassahun Tadesse',
    email: user?.email || '',
    phone: user?.phone || '+251922334455',
    gender: user?.gender || 'prefer_not',
    nationality: user?.nationality || 'Ethiopian',
    national_id: user?.national_id || '',
    curatorTitle: user?.curatorSettings?.curatorTitle || DEFAULT_CURATOR_PREFERENCES.curatorTitle,
    department: user?.department || 'Curatorial & Exhibitions',
    specialization: user?.curatorSettings?.specialization || DEFAULT_CURATOR_PREFERENCES.specialization,
    officeLocation: user?.curatorSettings?.officeLocation || DEFAULT_CURATOR_PREFERENCES.officeLocation,
    curatorBio: user?.curatorSettings?.curatorBio || DEFAULT_CURATOR_PREFERENCES.curatorBio,
  });

  // AI & Cataloging Settings State
  const [aiSettings, setAiSettings] = useState({
    aiLanguage: user?.curatorSettings?.aiLanguage || DEFAULT_CURATOR_PREFERENCES.aiLanguage,
    aiTone: user?.curatorSettings?.aiTone || DEFAULT_CURATOR_PREFERENCES.aiTone,
    requireCuratorReview: user?.curatorSettings?.requireCuratorReview ?? DEFAULT_CURATOR_PREFERENCES.requireCuratorReview,
    duplicateSensitivity: user?.curatorSettings?.duplicateSensitivity || DEFAULT_CURATOR_PREFERENCES.duplicateSensitivity,
    autoGenerateAudio: user?.curatorSettings?.autoGenerateAudio ?? DEFAULT_CURATOR_PREFERENCES.autoGenerateAudio,
    audioVoice: user?.curatorSettings?.audioVoice || DEFAULT_CURATOR_PREFERENCES.audioVoice,
  });

  // Museum Standards State
  const [standardsSettings, setStandardsSettings] = useState({
    accessionPrefix: user?.curatorSettings?.accessionPrefix || DEFAULT_CURATOR_PREFERENCES.accessionPrefix,
    defaultGallery: user?.curatorSettings?.defaultGallery || DEFAULT_CURATOR_PREFERENCES.defaultGallery,
    defaultStorageVault: user?.curatorSettings?.defaultStorageVault || DEFAULT_CURATOR_PREFERENCES.defaultStorageVault,
    defaultCondition: user?.curatorSettings?.defaultCondition || DEFAULT_CURATOR_PREFERENCES.defaultCondition,
  });

  // Categories Taxonomy State
  const [categories, setCategories] = useState([
    { id: 'cat-1', name: 'Permanent Exhibition', desc: 'Core long-term museum displays highlighting major historical milestones.' },
    { id: 'cat-2', name: 'Temporary Exhibition', desc: 'Rotating seasonal exhibitions featured for limited timeframes.' },
    { id: 'cat-3', name: 'Traveling Exhibition', desc: 'Mobile artifact showcases shared with regional partner institutions.' },
    { id: 'cat-4', name: 'Historical Exhibition', desc: 'Detailed chronological narratives of battle tactics, treaties, and diplomacy.' },
    { id: 'cat-5', name: 'Cultural Exhibition', desc: 'Spotlight on living heritage, traditional craftsmanship, and attire.' },
    { id: 'cat-6', name: 'Educational Exhibition', desc: 'Interactive learning zones designed for school groups and young visitors.' },
    { id: 'cat-7', name: 'Special Exhibition', desc: 'VIP exclusive commemorative installations and commemorative events.' },
  ]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      desc: newCategoryDesc.trim() || 'Custom exhibition category.',
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategoryName('');
    setNewCategoryDesc('');
    setShowAddCategoryModal(false);
    toast.success(`Category "${newCat.name}" added successfully`);
  };

  const handleDeleteCategory = (catId, catName) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    toast.success(`Category "${catName}" removed`);
  };

  // Notifications State
  const [notifySettings, setNotifySettings] = useState({
    notifyConservationAlerts: user?.curatorSettings?.notifyConservationAlerts ?? DEFAULT_CURATOR_PREFERENCES.notifyConservationAlerts,
    notifyPendingAiReviews: user?.curatorSettings?.notifyPendingAiReviews ?? DEFAULT_CURATOR_PREFERENCES.notifyPendingAiReviews,
    notifyExhibitionDeadlines: user?.curatorSettings?.notifyExhibitionDeadlines ?? DEFAULT_CURATOR_PREFERENCES.notifyExhibitionDeadlines,
    notifyQrScanSpikes: user?.curatorSettings?.notifyQrScanSpikes ?? DEFAULT_CURATOR_PREFERENCES.notifyQrScanSpikes,
    emailDigestFrequency: user?.curatorSettings?.emailDigestFrequency || DEFAULT_CURATOR_PREFERENCES.emailDigestFrequency,
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Sync profile form when user changes in store
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        department: user.department || prev.department,
      }));
      if (user.avatar) {
        setAvatarUrl(user.avatar);
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiChange = (field, value) => {
    setAiSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleStandardsChange = (e) => {
    const { name, value } = e.target;
    setStandardsSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotifyToggle = (field) => {
    setNotifySettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await authApi.uploadAvatar(formData);
      const updatedAvatar = res?.data?.data?.avatar || res?.data?.avatar;
      if (updatedAvatar) {
        setAvatarUrl(updatedAvatar);
        updateUser({ avatar: updatedAvatar });
        toast.success('Public profile picture uploaded and updated!');
      } else {
        throw new Error('Avatar upload did not return a valid URL');
      }
    } catch {
      // Fallback for local testing / offline
      const reader = new FileReader();
      reader.onload = (event) => {
        const localDataUrl = event.target.result;
        setAvatarUrl(localDataUrl);
        updateUser({ avatar: localDataUrl });
        toast.success('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }
    setAvatarUrl(customUrlInput.trim());
    updateUser({ avatar: customUrlInput.trim() });
    authApi.updateProfile({ avatar: customUrlInput.trim() }).catch(() => {});
    toast.success('Profile picture updated from URL!');
    setCustomUrlInput('');
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    updateUser({ avatar: null });
    authApi.updateProfile({ avatar: '' }).catch(() => {});
    toast.success('Profile picture removed');
  };

  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    try {
      // 1. Send profile updates to backend API
      try {
        await authApi.updateProfile({
          name: profileForm.name,
          phone: profileForm.phone,
          gender: profileForm.gender,
          nationality: profileForm.nationality,
          national_id: profileForm.national_id,
          avatar: avatarUrl,
        });
      } catch (apiErr) {
        console.warn('Backend update error, updating local state:', apiErr?.message);
      }

      // 2. Combine curator settings and update authStore
      const curatorSettings = {
        ...aiSettings,
        ...standardsSettings,
        ...notifySettings,
        curatorTitle: profileForm.curatorTitle,
        specialization: profileForm.specialization,
        officeLocation: profileForm.officeLocation,
        curatorBio: profileForm.curatorBio,
        updatedAt: new Date().toISOString(),
      };

      updateUser({
        name: profileForm.name,
        phone: profileForm.phone,
        department: profileForm.department,
        avatar: avatarUrl,
        curatorSettings,
      });

      toast.success('Curator settings & public profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update curator settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResetDefaults = () => {
    setAiSettings({
      aiLanguage: DEFAULT_CURATOR_PREFERENCES.aiLanguage,
      aiTone: DEFAULT_CURATOR_PREFERENCES.aiTone,
      requireCuratorReview: DEFAULT_CURATOR_PREFERENCES.requireCuratorReview,
      duplicateSensitivity: DEFAULT_CURATOR_PREFERENCES.duplicateSensitivity,
      autoGenerateAudio: DEFAULT_CURATOR_PREFERENCES.autoGenerateAudio,
      audioVoice: DEFAULT_CURATOR_PREFERENCES.audioVoice,
    });
    setStandardsSettings({
      accessionPrefix: DEFAULT_CURATOR_PREFERENCES.accessionPrefix,
      defaultGallery: DEFAULT_CURATOR_PREFERENCES.defaultGallery,
      defaultStorageVault: DEFAULT_CURATOR_PREFERENCES.defaultStorageVault,
      defaultCondition: DEFAULT_CURATOR_PREFERENCES.defaultCondition,
    });
    setNotifySettings({
      notifyConservationAlerts: DEFAULT_CURATOR_PREFERENCES.notifyConservationAlerts,
      notifyPendingAiReviews: DEFAULT_CURATOR_PREFERENCES.notifyPendingAiReviews,
      notifyExhibitionDeadlines: DEFAULT_CURATOR_PREFERENCES.notifyExhibitionDeadlines,
      notifyQrScanSpikes: DEFAULT_CURATOR_PREFERENCES.notifyQrScanSpikes,
      emailDigestFrequency: DEFAULT_CURATOR_PREFERENCES.emailDigestFrequency,
    });
    toast.success('Curator preferences reset to museum standards');
  };

  const tabs = [
    { id: 'profile', label: 'Curator Profile & Photo', icon: UserIcon },
    { id: 'ai', label: 'AI & Cataloging', icon: SparklesIcon },
    { id: 'standards', label: 'Museum Standards', icon: BuildingLibraryIcon },
    { id: 'notifications', label: 'Alerts & Digest', icon: BellIcon },
    { id: 'security', label: 'Security & Auth', icon: KeyIcon },
  ];

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <PageHeader
          title="Curator Settings & Public Profile"
          description="Manage your public curatorial identity, photo avatar, AI narrative standards, accession prefixes, and cataloging workflows."
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Settings' },
          ]}
          actions={(
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDefaults}
                className="border-[#D8C8B8] text-[#7C4A2D] hover:bg-[#FAF0E4]"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                Reset Defaults
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAllSettings}
                loading={isSaving}
                className="bg-[#374B07] text-white hover:bg-[#243205]"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                Save Settings
              </Button>
            </div>
          )}
        />

        {/* Curator Profile Summary Header Banner */}
        <Card className="border-[#E2D6C5] bg-gradient-to-r from-[#FAF6F0] via-[#FAF0D8]/40 to-[#FAF6F0]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2">
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profileForm.name}
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-[#D4A017] shadow-md transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-[#374B07] text-[#D4A017] font-display font-bold text-3xl flex items-center justify-center border-2 border-[#D4A017]/40 shadow-sm">
                    {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#374B07] text-white border-2 border-white flex items-center justify-center hover:bg-[#243205] transition-transform hover:scale-110 shadow-sm"
                  title="Upload profile picture"
                >
                  <CameraIcon className="h-4 w-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-[#2B1B12]">{profileForm.name || 'Curator User'}</h2>
                  <Badge variant="gold">Curator Portal</Badge>
                  <Badge variant="good">Public Verified</Badge>
                </div>
                <p className="text-xs text-[#7C4A2D] font-semibold mt-0.5">{profileForm.curatorTitle}</p>
                <p className="text-[11px] text-[#6E5445] mt-1 flex items-center gap-2">
                  <span>🏛️ {profileForm.department}</span>
                  <span>•</span>
                  <span>📍 {profileForm.officeLocation}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full md:w-auto border-t md:border-t-0 border-[#E2D6C5] pt-3 md:pt-0">
              <div className="rounded-xl bg-white/80 p-2.5 text-center border border-[#E2D6C5]/60 shadow-2xs">
                <p className="text-[10px] font-bold text-[#7C4A2D] uppercase tracking-wider">AI Language</p>
                <p className="text-xs font-bold text-[#2B1B12] mt-0.5 uppercase">{aiSettings.aiLanguage}</p>
              </div>
              <div className="rounded-xl bg-white/80 p-2.5 text-center border border-[#E2D6C5]/60 shadow-2xs">
                <p className="text-[10px] font-bold text-[#7C4A2D] uppercase tracking-wider">AI Sign-off</p>
                <p className="text-xs font-bold text-[#374B07] mt-0.5">
                  {aiSettings.requireCuratorReview ? 'Mandatory' : 'Optional'}
                </p>
              </div>
              <div className="rounded-xl bg-white/80 p-2.5 text-center border border-[#E2D6C5]/60 shadow-2xs">
                <p className="text-[10px] font-bold text-[#7C4A2D] uppercase tracking-wider">Prefix</p>
                <p className="text-xs font-bold text-[#2B1B12] mt-0.5">{standardsSettings.accessionPrefix}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Tab Selection Navigation */}
        <div className="border-b border-[#E2D6C5]">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Settings Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                    isActive
                      ? 'border-[#374B07] text-[#374B07] bg-[#E4EEDC]/40 rounded-t-lg'
                      : 'border-transparent text-[#7C4A2D] hover:text-[#2B1B12] hover:border-[#D4A017]/40'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#374B07]' : 'text-[#7C4A2D]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* TAB 1: CURATOR PROFILE & PHOTO */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* SECTION A: PROFILE PICTURE UPLOAD */}
              <Card title="Public Curator Profile Picture" subtitle="Upload an official photograph visible on public artifact pages and museum catalogs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-2">
                  <div className="relative group shrink-0">
                    {avatarUrl ? (
                      <div className="relative">
                        <img
                          src={avatarUrl}
                          alt={profileForm.name}
                          className="h-28 w-28 rounded-2xl object-cover border-2 border-[#D4A017] shadow-md"
                        />
                        <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Public Verified Curator">
                          <CheckCircleIcon className="h-4 w-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 w-28 rounded-2xl bg-[#374B07] text-[#D4A017] font-display font-bold text-4xl flex items-center justify-center border-2 border-[#D4A017]/40 shadow-sm">
                        {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        loading={isUploadingAvatar}
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#374B07] text-white hover:bg-[#243205]"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4 mr-1.5" />
                        Upload New Photo
                      </Button>

                      {avatarUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveAvatar}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4 mr-1.5" />
                          Remove Photo
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6E5445]">
                      Supported formats: <strong>JPG, PNG, WEBP</strong>. Max size: 10MB. High-resolution square portraits recommended.
                    </p>

                    {/* Image URL Input Fallback */}
                    <div className="pt-2 border-t border-[#E2D6C5]">
                      <label className="block text-xs font-bold text-[#2B1B12] mb-1">
                        Or Link Image URL Directly
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          placeholder="https://example.com/curator-photo.jpg"
                          className="flex-1 rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-1.5 text-xs text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleApplyUrl}
                          className="bg-[#FAF0D8] text-[#7C4A2D] hover:bg-[#D4A017]/20 border border-[#D4A017]/30"
                        >
                          Apply URL
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* SECTION B: PERSONAL & CURATORIAL DETAILS */}
              <Card title="Personal & Curatorial Details" subtitle="Update your official staff metadata and curatorial assignment">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    required
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    value={profileForm.email}
                    disabled
                    helperText="Managed by System Administrator / Supabase Auth"
                  />
                  <Input
                    label="Curator Title / Designation"
                    name="curatorTitle"
                    value={profileForm.curatorTitle}
                    onChange={handleProfileChange}
                    placeholder="e.g. Senior Curator of Adwa Collections"
                  />
                  <Select
                    label="Department"
                    name="department"
                    value={profileForm.department}
                    onChange={handleProfileChange}
                    options={DEPARTMENT_OPTIONS}
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="+251911223344"
                  />
                  <Input
                    label="Office / Bureau Location"
                    name="officeLocation"
                    value={profileForm.officeLocation}
                    onChange={handleProfileChange}
                    placeholder="e.g. Curatorial Wing B, Room 204"
                  />
                  <Input
                    label="Nationality"
                    name="nationality"
                    value={profileForm.nationality}
                    onChange={handleProfileChange}
                  />
                  <Input
                    label="National ID / Staff ID"
                    name="national_id"
                    value={profileForm.national_id}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-[#2B1B12] mb-1">
                    Curatorial Specialization & Domain Expertise
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={profileForm.specialization}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none focus:ring-1 focus:ring-[#374B07]"
                    placeholder="e.g. 19th Century Arms, Imperial Regalia, Battle Maps & Archival Manuscripts"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-[#2B1B12] mb-1">
                    Curator Biography / Public Statement
                  </label>
                  <textarea
                    rows={4}
                    name="curatorBio"
                    value={profileForm.curatorBio}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] p-3 text-xs font-normal text-[#2B1B12] focus:border-[#374B07] focus:outline-none focus:ring-1 focus:ring-[#374B07]"
                    placeholder="Describe your research background, curatorial focus, and institutional role..."
                  />
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN: PREVIEW & SEAL */}
            <div className="space-y-6">
              {/* PUBLIC PROFILE CARD PREVIEW */}
              <Card title="Public Profile Card Preview" subtitle="How visitors see your verified curator seal on public artifact pages">
                <div className="rounded-2xl border border-[#D4A017]/50 bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#FAF0D8]/40 p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profileForm.name} className="h-12 w-12 rounded-xl object-cover border border-[#D4A017] shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-[#374B07] text-[#D4A017] font-bold text-lg flex items-center justify-center shrink-0">
                        {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-[#2B1B12]">{profileForm.name}</h4>
                        <CheckCircleIcon className="h-4 w-4 text-emerald-600" title="Verified Curator" />
                      </div>
                      <p className="text-[11px] text-[#7C4A2D] font-semibold">{profileForm.curatorTitle}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#5C4233] leading-relaxed line-clamp-3 bg-white/70 p-2.5 rounded-xl border border-[#E2D6C5]/60">
                    &ldquo;{profileForm.curatorBio}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2D6C5] text-[10px]">
                    <span className="text-[#6E5445] font-semibold">Adwa Victory Memorial</span>
                    <span className="font-mono text-[#374B07] font-bold">SEAL: ADW-CUR-2026</span>
                  </div>
                </div>
              </Card>

              <Card title="Curator Identity Seal" subtitle="Official cataloging authorization status">
                <div className="rounded-xl border border-[#D4A017]/40 bg-[#FAF0D8]/50 p-4 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF0D8] border border-[#D4A017] text-[#374B07]">
                    <ShieldCheckIcon className="h-8 w-8 text-[#D4A017]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2B1B12]">Verified Curatorial Seal</h4>
                    <p className="text-[11px] text-[#7C4A2D] mt-0.5">Adwa Victory Memorial Museum Authority</p>
                  </div>
                  <p className="text-[11px] text-[#5C4233] leading-relaxed">
                    Your digital signature and profile photo are affixed to approved artifact catalog entries, AI reviews, and conservation log approvals.
                  </p>
                  <div className="inline-block rounded-md bg-[#FFFDF9] px-3 py-1.5 text-[10px] font-mono font-bold text-[#374B07] border border-[#E2D6C5]">
                    SEAL-ID: ADW-CUR-2026-884
                  </div>
                </div>
              </Card>

              <Card title="Curatorial Quick Metrics">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E2D6C5]">
                    <span className="text-[#6E5445] font-semibold">Primary Museum:</span>
                    <span className="font-bold text-[#2B1B12]">Adwa Victory Memorial</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#E2D6C5]">
                    <span className="text-[#6E5445] font-semibold">Role Level:</span>
                    <Badge variant="good">Curator Level II</Badge>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#E2D6C5]">
                    <span className="text-[#6E5445] font-semibold">Catalog Permissions:</span>
                    <span className="text-emerald-700 font-bold">Full Create/Edit</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6E5445] font-semibold">AI Review Authorization:</span>
                    <span className="text-[#374B07] font-bold">Enabled</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: AI & AUTOMATED CATALOGING PREFERENCES */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <Card title="AI Description & Narrative Engine Settings" subtitle="Configure defaults for AI-assisted artifact cataloging and audio generation">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#2B1B12] mb-1 flex items-center gap-1.5">
                    <LanguageIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <span>Default AI Output Language</span>
                  </label>
                  <select
                    value={aiSettings.aiLanguage}
                    onChange={(e) => handleAiChange('aiLanguage', e.target.value)}
                    className="w-full rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                  >
                    <option value="am">Amharic (አማርኛ) — Recommended for Adwa Museum</option>
                    <option value="en">English (Official Archival Standard)</option>
                    <option value="om">Afaan Oromoo</option>
                    <option value="ti">Tigrinya (ትግርኛ)</option>
                    <option value="fr">French (Français)</option>
                  </select>
                  <p className="text-[11px] text-[#6E5445] mt-1">
                    Primary language used when generating artifact descriptions, historical context, and public audio scripts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B1B12] mb-1 flex items-center gap-1.5">
                    <DocumentTextIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <span>AI Description Narrative Style</span>
                  </label>
                  <select
                    value={aiSettings.aiTone}
                    onChange={(e) => handleAiChange('aiTone', e.target.value)}
                    className="w-full rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                  >
                    <option value="academic">Academic &amp; Historical (Detailed, provenance-focused)</option>
                    <option value="visitor">Visitor &amp; Educational (Accessible, engaging narrative)</option>
                    <option value="archival">Archival Technical (Material, dimensions &amp; physical specs)</option>
                    <option value="storytelling">Storytelling &amp; Heritage (Emotional &amp; national hero emphasis)</option>
                  </select>
                  <p className="text-[11px] text-[#6E5445] mt-1">
                    Adjusts vocabulary and framing when AI generates artifact background texts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B1B12] mb-1 flex items-center gap-1.5">
                    <SpeakerWaveIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <span>Audio Narration Voice Persona</span>
                  </label>
                  <select
                    value={aiSettings.audioVoice}
                    onChange={(e) => handleAiChange('audioVoice', e.target.value)}
                    className="w-full rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                  >
                    <option value="am-female-meskerem">Amharic — Female (Meskerem) [Warm Narrative]</option>
                    <option value="am-male-abebe">Amharic — Male (Abebe) [Authoritative Historical]</option>
                    <option value="en-female-hannah">English — Female (Hannah) [Curatorial Clear]</option>
                    <option value="en-male-solomon">English — Male (Solomon) [Deep Resonant]</option>
                  </select>
                  <p className="text-[11px] text-[#6E5445] mt-1">
                    Voice model used for public QR code audio guides.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B1B12] mb-1 flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#7C4A2D]" />
                    <span>Duplicate Detection Sensitivity</span>
                  </label>
                  <select
                    value={aiSettings.duplicateSensitivity}
                    onChange={(e) => handleAiChange('duplicateSensitivity', e.target.value)}
                    className="w-full rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                  >
                    <option value="high">High (Strict visual &amp; title similarity check)</option>
                    <option value="medium">Medium (Balanced — flags strong image matches)</option>
                    <option value="low">Low (Permissive — flags exact duplicates only)</option>
                  </select>
                  <p className="text-[11px] text-[#6E5445] mt-1">
                    Controls automated warnings when adding new artifacts that resemble existing inventory.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#E2D6C5] space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#2B1B12]">Mandatory Curator Review Policy</span>
                    <p className="text-[11px] text-[#6E5445]">
                      Enforce human curator sign-off before AI-generated descriptions and audio go live on public QR displays.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAiChange('requireCuratorReview', !aiSettings.requireCuratorReview)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      aiSettings.requireCuratorReview ? 'bg-[#374B07]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        aiSettings.requireCuratorReview ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#2B1B12]">Auto-generate Audio Narration on Approval</span>
                    <p className="text-[11px] text-[#6E5445]">
                      Automatically queue text-to-speech audio rendering as soon as an artifact description is finalized.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAiChange('autoGenerateAudio', !aiSettings.autoGenerateAudio)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      aiSettings.autoGenerateAudio ? 'bg-[#374B07]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        aiSettings.autoGenerateAudio ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: MUSEUM STANDARDS & ACCESSION NUMBERS */}
        {activeTab === 'standards' && (
          <div className="space-y-6">
            <Card title="Museum Accession & Gallery Defaults" subtitle="Set standard cataloging rules for new artifact registrations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Accession Number Prefix"
                    name="accessionPrefix"
                    value={standardsSettings.accessionPrefix}
                    onChange={handleStandardsChange}
                    placeholder="e.g. ADM-2026-"
                    helperText="Auto-prepended to newly generated museum registration codes"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B1B12] mb-1">
                    Default Primary Exhibition Hall
                  </label>
                  <select
                    name="defaultGallery"
                    value={standardsSettings.defaultGallery}
                    onChange={handleStandardsChange}
                    className="w-full rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                  >
                    <option value="Hall 1: Menelik & Taytu Archival Gallery">Hall 1: Menelik &amp; Taytu Archival Gallery</option>
                    <option value="Hall 2: Battle Tactics & Arms Hall">Hall 2: Battle Tactics &amp; Arms Hall</option>
                    <option value="Hall 3: Victory & Foreign Relations Vault">Hall 3: Victory &amp; Foreign Relations Vault</option>
                    <option value="Hall 4: Traditional Regalia & Textiles">Hall 4: Traditional Regalia &amp; Textiles</option>
                    <option value="Central Rotunda">Central Rotunda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B1B12] mb-1">
                    Default Storage Vault / Reserve Location
                  </label>
                  <select
                    name="defaultStorageVault"
                    value={standardsSettings.defaultStorageVault}
                    onChange={handleStandardsChange}
                    className="w-full rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                  >
                    <option value="Vault A - Climate Controlled (Manuscripts & Arms)">Vault A - Climate Controlled (Manuscripts &amp; Arms)</option>
                    <option value="Vault B - High Security (Gold, Jewelry & Medals)">Vault B - High Security (Gold, Jewelry &amp; Medals)</option>
                    <option value="Vault C - Heavy Ordinance & Artillery Storage">Vault C - Heavy Ordinance &amp; Artillery Storage</option>
                    <option value="Conservation Lab Prep Room">Conservation Lab Prep Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B1B12] mb-1">
                    Default Initial Condition Assessment
                  </label>
                  <select
                    name="defaultCondition"
                    value={standardsSettings.defaultCondition}
                    onChange={handleStandardsChange}
                    className="w-full rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good (Minor wear)</option>
                    <option value="fair">Fair (Requires monitoring)</option>
                    <option value="poor">Poor (Needs restoration)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#D4A017]/40 bg-[#FAF0D8]/40 p-4 flex items-start gap-3">
                <InformationCircleIcon className="h-5 w-5 text-[#D4A017] shrink-0 mt-0.5" />
                <div className="text-xs text-[#5C4233] leading-relaxed">
                  <strong>Accession Numbering Convention:</strong> Standard format is <code className="font-mono text-[#374B07] bg-white px-1.5 py-0.5 rounded border border-[#E2D6C5]">{standardsSettings.accessionPrefix}0001</code>.
                  This ensures seamless integration with conservation logs and Telebirr-guided visitor audio tours.
                </div>
              </div>
            </Card>

            <Card
              title="Exhibition Categories & Taxonomy"
              subtitle="Configure and maintain standard categories used for curating exhibitions and hall planning"
              action={
                <Button variant="gold" size="xs" onClick={() => setShowAddCategoryModal(true)}>
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>Add New Category</span>
                </Button>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3.5 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#2B1B12]">{cat.name}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="excellent">Active Standard</Badge>
                          {cat.id.startsWith('cat-') && !['cat-1','cat-2','cat-3'].includes(cat.id) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              title="Delete category"
                              className="text-rose-600 hover:text-rose-800 p-1"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-[#6E5445] leading-relaxed">{cat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Add Category Modal */}
        {showAddCategoryModal && (
          <Modal
            isOpen={showAddCategoryModal}
            onClose={() => setShowAddCategoryModal(false)}
            title="Add New Exhibition Category"
          >
            <div className="space-y-4">
              <Input
                label="Category Name *"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Commemorative Installation"
              />
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-[#5C4233]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Describe the scope of this category..."
                  className="w-full rounded-xl border border-[#E2D6C5] p-2.5 text-xs outline-none focus:border-smrmp-gold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAddCategoryModal(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="sm" onClick={handleAddCategory}>
                  Add Category
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* TAB 4: ALERTS & NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card title="Curatorial Notification & Alert Subscriptions" subtitle="Control when and how you receive alerts about museum operations">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9]">
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1B12]">Conservation Condition Drop Alerts</h4>
                    <p className="text-[11px] text-[#6E5445] mt-0.5">
                      Get notified when a conservation specialist flags an artifact condition as &apos;Critical&apos; or &apos;Poor&apos;.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotifyToggle('notifyConservationAlerts')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifySettings.notifyConservationAlerts ? 'bg-[#374B07]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifySettings.notifyConservationAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9]">
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1B12]">AI Review Queue Notifications</h4>
                    <p className="text-[11px] text-[#6E5445] mt-0.5">
                      Alerts when new AI draft descriptions or translated audio scripts require curator approval.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotifyToggle('notifyPendingAiReviews')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifySettings.notifyPendingAiReviews ? 'bg-[#374B07]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifySettings.notifyPendingAiReviews ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9]">
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1B12]">Exhibition Schedule &amp; Loan Deadlines</h4>
                    <p className="text-[11px] text-[#6E5445] mt-0.5">
                      Reminders 7 days and 24 hours prior to exhibition rotations, loan returns, or gallery maintenance.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotifyToggle('notifyExhibitionDeadlines')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifySettings.notifyExhibitionDeadlines ? 'bg-[#374B07]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifySettings.notifyExhibitionDeadlines ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2D6C5] bg-[#FFFDF9]">
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1B12]">High Visitor Scan Spike Alerts</h4>
                    <p className="text-[11px] text-[#6E5445] mt-0.5">
                      Alerts when an artifact&apos;s QR code receives an unusually high surge of visitor scans in a single hour.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotifyToggle('notifyQrScanSpikes')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifySettings.notifyQrScanSpikes ? 'bg-[#374B07]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifySettings.notifyQrScanSpikes ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E2D6C5]">
                <label className="block text-xs font-bold text-[#2B1B12] mb-1">
                  Email Digest Summary Frequency
                </label>
                <select
                  value={notifySettings.emailDigestFrequency}
                  onChange={(e) => setNotifySettings((prev) => ({ ...prev, emailDigestFrequency: e.target.value }))}
                  className="w-full sm:w-64 rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-[#374B07] focus:outline-none"
                >
                  <option value="realtime">Immediate (Real-time email per alert)</option>
                  <option value="daily">Daily Morning Digest (08:00 EAT)</option>
                  <option value="weekly">Weekly Summary Report</option>
                  <option value="none">Disabled (In-app alerts only)</option>
                </select>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: SECURITY & CREDENTIALS */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Change Account Password" subtitle="Ensure your staff credentials follow museum security standards">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />

                  <div>
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      required
                      helperText="Must be at least 8 characters with upper, lower, number, and special symbol"
                    />
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <PasswordStrengthMeter password={passwordForm.newPassword} />
                      </div>
                    )}
                  </div>

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isChangingPassword}
                      className="bg-[#374B07] text-white hover:bg-[#243205]"
                    >
                      <LockClosedIcon className="h-4 w-4 mr-1.5" />
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Active Session Info">
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FAF0D8]/60 border border-[#D4A017]/30">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div>
                      <p className="font-bold text-[#2B1B12]">Current Web Session</p>
                      <p className="text-[10px] text-[#7C4A2D]">Logged in via Supabase Auth</p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-1.5 text-[#5C4233]">
                    <p className="flex justify-between">
                      <span>User ID:</span>
                      <span className="font-mono text-[10px] text-[#2B1B12]">{user?.id?.slice(0, 16)}...</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-semibold text-[#2B1B12]">{user?.email}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Role Scope:</span>
                      <Badge variant="gold">{user?.role || 'curator'}</Badge>
                    </p>
                    <p className="flex justify-between">
                      <span>Last Activity:</span>
                      <span className="font-semibold text-[#2B1B12]">Just Now</span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card title="Security Best Practices">
                <ul className="text-xs text-[#5C4233] space-y-2 list-disc list-inside">
                  <li>Never share your curator credentials or token with unauthorized personnel.</li>
                  <li>All catalog changes and AI approvals are recorded in the immutable audit log.</li>
                  <li>Always lock your terminal when stepping away from the cataloging station.</li>
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
}
