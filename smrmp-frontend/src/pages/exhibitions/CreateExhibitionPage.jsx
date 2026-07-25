import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  FolderOpenIcon,
  MapPinIcon,
  CalendarDaysIcon,
  EyeIcon,
  CheckIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import { useArtifacts } from '../../hooks/useArtifacts';
import {
  useExhibition,
  useCreateExhibition,
  useUpdateExhibition,
} from '../../hooks/useExhibitions';
import { EXHIBITION_CATEGORIES } from './exhibitionData';
import getApiErrorMessage from '../../utils/apiError';

export default function CreateExhibitionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Dynamic API queries
  const { data: exhibitionApiData, isLoading: exhibitionLoading } = useExhibition(id);
  const { data: artifactsApiData } = useArtifacts();

  const createExhibitionMutation = useCreateExhibition();
  const updateExhibitionMutation = useUpdateExhibition();

  const [builderStep, setBuilderStep] = useState(1);
  const [categories] = useState(EXHIBITION_CATEGORIES);

  // Live API artifacts from backend database
  const availableArtifacts = useMemo(() => {
    const liveList = artifactsApiData?.artifacts || [];
    return liveList.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category || 'other',
      location: a.location || 'Vault',
      image: a.qr_data_url || 'https://images.pexels.com/photos/14950665/pexels-photo-14950665.jpeg',
      status: a.condition_status === 'good' ? 'Available' : 'Assigned',
    }));
  }, [artifactsApiData]);

  // Form State
  const defaultFormData = {
    title: '',
    subtitle: '',
    category: 'Permanent Exhibition',
    description: '',
    theme: '',
    coverImage:
      'https://images.pexels.com/photos/14950665/pexels-photo-14950665.jpeg?auto=compress&cs=tinysrgb&w=800&q=80',
    startDate: '',
    endDate: '',
    openingTime: '09:00',
    closingTime: '18:00',
    hall: 'Hall 01',
    roomNumber: 'Room 1A',
    capacity: 200,
    status: 'Draft',
    featured: false,
    publicVisibility: true,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [assignedArtifactIds, setAssignedArtifactIds] = useState([]);

  // Populate form if editing existing exhibition
  useEffect(() => {
    if (exhibitionApiData) {
      const ex = exhibitionApiData;
      setFormData({
        title: ex.name || ex.title || '',
        subtitle: ex.subtitle || '',
        category: ex.category || 'Permanent Exhibition',
        description: ex.description || '',
        theme: ex.theme || '',
        coverImage: ex.cover_image || ex.coverImage || defaultFormData.coverImage,
        startDate: ex.start_date || ex.startDate || '',
        endDate: ex.end_date || ex.endDate || '',
        openingTime: ex.openingTime || '09:00',
        closingTime: ex.closingTime || '18:00',
        hall: ex.location || ex.hall || 'Hall 01',
        roomNumber: ex.roomNumber || '',
        capacity: ex.expected_visitors || ex.capacity || 200,
        status: ex.status ? ex.status.charAt(0).toUpperCase() + ex.status.slice(1) : 'Draft',
        featured: ex.featured || false,
        publicVisibility: ex.publicVisibility ?? true,
      });

      if (Array.isArray(ex.artifacts)) {
        setAssignedArtifactIds(ex.artifacts.map((a) => a.id));
      }
    }
  }, [exhibitionApiData]);

  // Artifact search inside Step 3
  const [artifactSearch, setArtifactSearch] = useState('');
  const [artifactCategoryFilter, setArtifactCategoryFilter] = useState('');
  const [artifactFilterTab, setArtifactFilterTab] = useState('all');

  const handleToggleArtifactAssignment = (artifactId) => {
    setAssignedArtifactIds((prev) => {
      const isAssigned = prev.includes(artifactId);
      if (isAssigned) {
        return prev.filter((aId) => aId !== artifactId);
      } else {
        return [...prev, artifactId];
      }
    });
    toast.success('Artifact selection toggled');
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.category || !formData.startDate || !formData.endDate) {
      toast.error('Please complete title, category, start and end dates.');
      return;
    }

    const payload = {
      name: formData.title,
      description: formData.description,
      status: formData.status ? formData.status.toLowerCase() : 'draft',
      start_date: formData.startDate,
      end_date: formData.endDate,
      location: `${formData.hall}${formData.roomNumber ? ` (${formData.roomNumber})` : ''}`,
      theme: formData.theme,
      expected_visitors: parseInt(formData.capacity, 10) || 200,
      artifact_ids: assignedArtifactIds,
    };

    try {
      if (id) {
        await updateExhibitionMutation.mutateAsync({ id, data: payload });
        toast.success(`Exhibition "${formData.title}" updated successfully!`);
      } else {
        await createExhibitionMutation.mutateAsync(payload);
        toast.success(`New Exhibition "${formData.title}" created successfully!`);
      }
      navigate('/exhibitions');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save exhibition record'));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'active':
        return <Badge variant="excellent">Active</Badge>;
      case 'Upcoming':
      case 'upcoming':
        return <Badge variant="fair">Upcoming</Badge>;
      case 'Draft':
      case 'draft':
      case 'planning':
        return <Badge variant="good">Draft</Badge>;
      case 'Completed':
      case 'closed':
        return <Badge variant="default">Completed</Badge>;
      case 'Cancelled':
      case 'cancelled':
        return <Badge variant="critical">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredArtifactsForAssign = useMemo(() => {
    return availableArtifacts.filter((art) => {
      const matchesSearch =
        !artifactSearch ||
        art.name.toLowerCase().includes(artifactSearch.toLowerCase()) ||
        art.id.toLowerCase().includes(artifactSearch.toLowerCase()) ||
        (art.location && art.location.toLowerCase().includes(artifactSearch.toLowerCase()));
      const matchesCategory = !artifactCategoryFilter || art.category === artifactCategoryFilter;

      const isAssignedToCurrent = assignedArtifactIds.includes(art.id);
      let matchesTab = true;
      if (artifactFilterTab === 'assigned') matchesTab = isAssignedToCurrent;
      if (artifactFilterTab === 'unassigned') matchesTab = !isAssignedToCurrent;

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [availableArtifacts, artifactSearch, artifactCategoryFilter, artifactFilterTab, assignedArtifactIds]);

  const isSaving = createExhibitionMutation.isPending || updateExhibitionMutation.isPending;

  return (
    <PrivateLayout>
      <PageHeader
        title={id ? `Edit Exhibition: ${formData.title || 'Record'}` : 'Create New Exhibition'}
        description="Unified curatorial builder: define concept details, allocate museum halls, and assign physical artifacts."
        backPath="/exhibitions"
        backLabel="Back to Exhibitions Workspace"
      />

      <div className="grid gap-6 lg:grid-cols-3 pb-8">
        {/* Main Builder Steps Column */}
        <div className="lg:col-span-2">
          <Card className="p-5 sm:p-7">
            {exhibitionLoading && (
              <div className="p-4 text-center text-xs text-[#7C4A2D] font-bold">
                Loading exhibition record from API...
              </div>
            )}

            {/* Step Bar */}
            <div className="mb-6 grid grid-cols-3 gap-2 text-center text-xs font-bold">
              {[
                { step: 1, title: '1. Basic Info & Concept' },
                { step: 2, title: '2. Hall Schedule & Availability' },
                { step: 3, title: '3. Assign Physical Artifacts' },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setBuilderStep(s.step)}
                  className={`rounded-xl py-2.5 transition ${
                    builderStep === s.step
                      ? 'bg-smrmp-gold text-[#1C120B] shadow-xs font-black ring-1 ring-amber-600/30'
                      : 'bg-[#FAF6F0] text-[#7C4A2D] border border-[#E2D6C5]'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Step 1: Basic Info */}
              {builderStep === 1 && (
                <div className="space-y-4">
                  <Input
                    label="Exhibition Title *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. The Lion of Adwa: Victory & Strategy"
                    required
                  />
                  <Input
                    label="Subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. A material history of courage, craft, and victory."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Category *"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      options={categories.map((c) => ({ value: c.name, label: c.name }))}
                      required
                    />
                    <Input
                      label="Curatorial Theme"
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      placeholder="e.g. Heroic Resilience & Heritage"
                    />
                  </div>

                  <Input
                    label="Cover Image URL"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://..."
                  />

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
                      Description &amp; Curatorial Statement *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Provide historical context, key physical artifacts featured, and themes..."
                      className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-3 text-sm text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
                      required
                    />
                  </div>

                  <div className="rounded-xl bg-[#FAF6F0] p-4 border border-[#E2D6C5] flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#2B1B12] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded border-stone-300 text-smrmp-gold focus:ring-smrmp-gold"
                      />
                      <span>Pin as Featured Showcase</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-[#2B1B12] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.publicVisibility}
                        onChange={(e) => setFormData({ ...formData, publicVisibility: e.target.checked })}
                        className="rounded border-stone-300 text-smrmp-gold focus:ring-smrmp-gold"
                      />
                      <span>Publicly Visible to Visitors</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Hall Location & Schedule */}
              {builderStep === 2 && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Exhibition Hall *"
                      value={formData.hall}
                      onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                      options={[
                        { value: 'Hall 01', label: 'Hall 01 (Main Entry)' },
                        { value: 'Hall 02', label: 'Hall 02 (Adwa Battle)' },
                        { value: 'Hall 03', label: 'Hall 03 (Treaties & Diplomacy)' },
                        { value: 'Hall 04', label: 'Hall 04 (Centennial Retrospective)' },
                        { value: 'Education Wing', label: 'Education Wing' },
                      ]}
                      required
                    />
                    <Input
                      label="Room / Pavilion Number"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      placeholder="e.g. Room 2B"
                    />

                    <Input
                      label="Start Date *"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                    <Input
                      label="End Date *"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />

                    <Input
                      label="Opening Hours"
                      type="time"
                      value={formData.openingTime}
                      onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    />
                    <Input
                      label="Closing Hours"
                      type="time"
                      value={formData.closingTime}
                      onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    />

                    <Input
                      label="Max Hall Visitor Capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 0 })
                      }
                    />

                    <Select
                      label="Exhibition Status *"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      options={[
                        { value: 'Draft', label: 'Draft' },
                        { value: 'Active', label: 'Active' },
                        { value: 'Upcoming', label: 'Upcoming' },
                        { value: 'Completed', label: 'Completed' },
                        { value: 'Cancelled', label: 'Cancelled' },
                      ]}
                    />
                  </div>

                  {/* Integrated Hall Schedule Visualizer */}
                  <div className="rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#7C4A2D] flex items-center gap-1.5">
                        <BuildingLibraryIcon className="h-4 w-4" />
                        <span>Live Museum Hall Schedule Visualizer</span>
                      </h4>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        Hall {formData.hall} Ready
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {['Hall 01', 'Hall 02', 'Hall 03', 'Hall 04', 'Education Wing'].map((hall) => {
                        const isSelectedHall = formData.hall === hall;
                        return (
                          <div
                            key={hall}
                            className={`rounded-lg p-2.5 text-xs flex items-center justify-between border ${
                              isSelectedHall
                                ? 'border-smrmp-gold bg-[#FAF0D8] font-bold'
                                : 'border-[#E2D6C5] bg-white'
                            }`}
                          >
                            <span className="text-[#2B1B12]">{hall}</span>
                            <span className="text-[10px] text-[#7C4A2D]">
                              {isSelectedHall ? 'Selected Target Hall' : 'Available for Booking'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Assign Artifacts */}
              {builderStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#FAF6F0] p-4 border border-[#E2D6C5] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-smrmp-gold">
                        Assign Physical Artifacts
                      </p>
                      <p className="font-bold text-sm text-[#2B1B12]">
                        {formData.title || 'New Exhibition'} ({formData.hall})
                      </p>
                      <p className="text-xs text-[#6E5445]">
                        Items selected:{' '}
                        <span className="font-bold text-smrmp-green">{assignedArtifactIds.length} items</span>
                      </p>
                    </div>
                    <Badge variant="excellent">{assignedArtifactIds.length} Items Selected</Badge>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Input
                      placeholder="Search artifact name or ID..."
                      value={artifactSearch}
                      onChange={(e) => setArtifactSearch(e.target.value)}
                      icon={MagnifyingGlassIcon}
                      className="w-full sm:w-60"
                    />

                    <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#E2D6C5]">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'assigned', label: 'Assigned' },
                        { id: 'unassigned', label: 'Available' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setArtifactFilterTab(f.id)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            artifactFilterTab === f.id
                              ? 'bg-smrmp-gold text-[#1C120B] shadow-2xs'
                              : 'text-[#7C4A2D]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 max-h-80 overflow-y-auto p-1">
                    {filteredArtifactsForAssign.map((art) => {
                      const isAssigned = assignedArtifactIds.includes(art.id);
                      return (
                        <div
                          key={art.id}
                          className={`rounded-xl border p-3 flex gap-3 items-center justify-between transition ${
                            isAssigned
                              ? 'border-smrmp-green bg-[#E4EEDC]/40'
                              : 'border-[#E2D6C5] bg-[#FFFDF9]'
                          }`}
                        >
                          <img
                            src={art.image}
                            alt={art.name}
                            className="h-10 w-10 rounded-lg object-cover border border-[#E2D6C5]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-[#2B1B12] truncate">{art.name}</p>
                            <p className="text-[10px] text-[#6E5445] uppercase">
                              {art.category} · {art.location}
                            </p>
                          </div>
                          <Button
                            variant={isAssigned ? 'danger' : 'gold'}
                            size="xs"
                            onClick={() => handleToggleArtifactAssignment(art.id)}
                          >
                            {isAssigned ? 'Remove' : 'Assign'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between border-t border-[#E2D6C5] pt-4">
                {builderStep > 1 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setBuilderStep((s) => s - 1)}
                  >
                    ← Previous Step
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/exhibitions')}
                  >
                    Cancel
                  </Button>
                )}

                {builderStep < 3 ? (
                  <Button
                    type="button"
                    variant="gold"
                    size="sm"
                    onClick={() => setBuilderStep((s) => s + 1)}
                  >
                    Next Step →
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gold"
                    size="sm"
                    loading={isSaving}
                    onClick={handleSave}
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Finish &amp; Save Exhibition</span>
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C4A2D] flex items-center gap-1.5">
            <EyeIcon className="h-4 w-4" />
            <span>Live Exhibition Preview</span>
          </h3>

          <Card padding={false} className="overflow-hidden border-2 border-smrmp-gold/60 shadow-lg">
            <div className="relative h-44">
              <img
                src={
                  formData.coverImage ||
                  'https://images.pexels.com/photos/14950665/pexels-photo-14950665.jpeg'
                }
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-2 left-2 flex gap-1">
                {getStatusBadge(formData.status)}
                {formData.featured && <Badge variant="fair">Featured</Badge>}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-smrmp-gold">
                {formData.category}
              </span>
              <h4 className="font-display text-base font-bold text-[#2B1B12]">
                {formData.title || 'Untitled Exhibition'}
              </h4>
              <p className="text-xs text-[#6E5445] line-clamp-2">
                {formData.description || 'Provide exhibition concept and curator description...'}
              </p>

              <div className="pt-2 text-xs text-[#5C4233] space-y-1 border-t border-[#E2D6C5]">
                <p className="flex items-center gap-1.5">
                  <MapPinIcon className="h-3.5 w-3.5 text-smrmp-gold" />
                  {formData.hall} {formData.roomNumber ? `(${formData.roomNumber})` : ''}
                </p>
                <p className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="h-3.5 w-3.5 text-smrmp-gold" />
                  {formData.startDate || 'YYYY-MM-DD'} → {formData.endDate || 'YYYY-MM-DD'}
                </p>
                <p className="flex items-center gap-1.5 text-smrmp-green font-bold">
                  <FolderOpenIcon className="h-3.5 w-3.5" />
                  {assignedArtifactIds.length} Physical Artifacts Selected
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PrivateLayout>
  );
}
