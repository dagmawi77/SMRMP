import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  FolderOpenIcon,
  MapPinIcon,
  PhotoIcon,
  Squares2X2Icon,
  UsersIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  QrCodeIcon,
  ArrowUpRightIcon,
  TableCellsIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PrivateLayout from '../../components/layout/PrivateLayout';
import {
  INITIAL_EXHIBITIONS,
  EXHIBITION_CATEGORIES,
  MOCK_ARTIFACTS_FOR_ASSIGNMENT,
  exhibitionDashboardData,
  formatVisitorCount,
} from './exhibitionData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

export default function ExhibitionPage() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'list' | 'create' | 'assign' | 'calendar' | 'gallery' | 'categories' | 'analytics'
  const [exhibitions, setExhibitions] = useState(INITIAL_EXHIBITIONS);
  const [artifacts, setArtifacts] = useState(MOCK_ARTIFACTS_FOR_ASSIGNMENT);
  const [categories, setCategories] = useState(EXHIBITION_CATEGORIES);

  // Search & Filter state for List
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedExhibitionIds, setSelectedExhibitionIds] = useState([]);

  // Modals state
  const [detailExhibition, setDetailExhibition] = useState(null);
  const [editingExhibition, setEditingExhibition] = useState(null);
  const [deletingExhibition, setDeletingExhibition] = useState(null);
  const [assigningExhibition, setAssigningExhibition] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Form State for Create/Edit
  const defaultFormData = {
    title: '',
    subtitle: '',
    category: 'Permanent Exhibition',
    description: '',
    theme: '',
    coverImage: 'https://images.pexels.com/photos/14950665/pexels-photo-14950665.jpeg?auto=compress&cs=tinysrgb&w=800&q=80',
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

  // Calendar View mode
  const [calendarView, setCalendarView] = useState('month'); // 'day' | 'week' | 'month' | 'year'

  // Calculated Stats
  const stats = useMemo(() => {
    const total = exhibitions.length;
    const active = exhibitions.filter((e) => e.status === 'Active').length;
    const upcoming = exhibitions.filter((e) => e.status === 'Upcoming').length;
    const completed = exhibitions.filter((e) => e.status === 'Completed').length;
    const cancelled = exhibitions.filter((e) => e.status === 'Cancelled').length;
    const draft = exhibitions.filter((e) => e.status === 'Draft').length;
    const totalVisitors = exhibitions.reduce((acc, curr) => acc + (curr.visitorCount || 0), 0);
    const featured = exhibitions.find((e) => e.featured) || exhibitions[0];
    return { total, active, upcoming, completed, cancelled, draft, totalVisitors, featured };
  }, [exhibitions]);

  // Filtered Exhibitions
  const filteredExhibitions = useMemo(() => {
    return exhibitions.filter((ex) => {
      const matchesSearch =
        !searchTerm ||
        ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.curator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.hall.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || ex.category === categoryFilter;
      const matchesStatus = !statusFilter || ex.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [exhibitions, searchTerm, categoryFilter, statusFilter]);

  // Handlers for Exhibition Operations
  const handleSaveExhibition = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.startDate || !formData.endDate) {
      toast.error('Please complete all required fields');
      return;
    }

    if (editingExhibition) {
      setExhibitions((prev) =>
        prev.map((ex) => (ex.id === editingExhibition.id ? { ...ex, ...formData } : ex))
      );
      toast.success(`Exhibition "${formData.title}" updated successfully`);
      setEditingExhibition(null);
    } else {
      const newExhibition = {
        id: `ex-${Date.now()}`,
        ...formData,
        curator: 'Current Curator',
        visitorCount: 0,
        assignedArtifactIds: [],
        qrCode: `ADWA-EX-${Math.floor(100 + Math.random() * 900)}`,
        galleryImages: formData.coverImage ? [formData.coverImage] : [],
      };
      setExhibitions((prev) => [newExhibition, ...prev]);
      toast.success(`New Exhibition "${formData.title}" created successfully!`);
    }

    setFormData(defaultFormData);
    setActiveTab('list');
  };

  const handleEditClick = (exhibition) => {
    setEditingExhibition(exhibition);
    setFormData({
      title: exhibition.title,
      subtitle: exhibition.subtitle || '',
      category: exhibition.category,
      description: exhibition.description,
      theme: exhibition.theme || '',
      coverImage: exhibition.coverImage,
      startDate: exhibition.startDate,
      endDate: exhibition.endDate,
      openingTime: exhibition.openingTime || '09:00',
      closingTime: exhibition.closingTime || '18:00',
      hall: exhibition.hall,
      roomNumber: exhibition.roomNumber || '',
      capacity: exhibition.capacity || 200,
      status: exhibition.status,
      featured: exhibition.featured || false,
      publicVisibility: exhibition.publicVisibility ?? true,
    });
    setActiveTab('create');
  };

  const handleDeleteExhibition = (id) => {
    setExhibitions((prev) => prev.filter((e) => e.id !== id));
    toast.success('Exhibition deleted successfully');
    setDeletingExhibition(null);
  };

  const handleDuplicateExhibition = (ex) => {
    const clone = {
      ...ex,
      id: `ex-${Date.now()}`,
      title: `${ex.title} (Copy)`,
      status: 'Draft',
      visitorCount: 0,
    };
    setExhibitions((prev) => [clone, ...prev]);
    toast.success(`Cloned "${ex.title}" into a new draft`);
  };

  const handlePublishExhibition = (ex) => {
    setExhibitions((prev) =>
      prev.map((e) => (e.id === ex.id ? { ...e, status: 'Active' } : e))
    );
    toast.success(`Exhibition "${ex.title}" is now published & active!`);
  };

  const handleArchiveExhibition = (ex) => {
    setExhibitions((prev) =>
      prev.map((e) => (e.id === ex.id ? { ...e, status: 'Completed' } : e))
    );
    toast.success(`Exhibition "${ex.title}" moved to archive`);
  };

  const handleToggleArtifactAssignment = (exhibitionId, artifactId) => {
    setExhibitions((prev) =>
      prev.map((ex) => {
        if (ex.id !== exhibitionId) return ex;
        const current = ex.assignedArtifactIds || [];
        const updated = current.includes(artifactId)
          ? current.filter((id) => id !== artifactId)
          : [...current, artifactId];
        return { ...ex, assignedArtifactIds: updated };
      })
    );

    setArtifacts((prev) =>
      prev.map((art) => {
        if (art.id !== artifactId) return art;
        const isAssigned = art.status === 'Assigned';
        return { ...art, status: isAssigned ? 'Available' : 'Assigned' };
      })
    );

    toast.success('Artifact assignment updated');
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      description: newCategoryDesc || 'Custom exhibition category.',
      count: 0,
      status: 'Active',
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategoryName('');
    setNewCategoryDesc('');
    setShowAddCategoryModal(false);
    toast.success('Category added successfully');
  };

  const handleCopyPublicUrl = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url || 'https://adwamuseum.et/exhibitions');
      toast.success('Public exhibition link copied to clipboard');
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">Active</Badge>;
      case 'Upcoming':
        return <Badge variant="warning">Upcoming</Badge>;
      case 'Draft':
        return <Badge variant="info">Draft</Badge>;
      case 'Completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <PrivateLayout>
      <div className="space-y-6 pb-6">
        {/* Module Header Card - styled with high-contrast text */}
        <header className="rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C4A2D]">
                <span className="h-px w-6 bg-smrmp-gold" />
                Adwa Museum Operations / ዐውደ ርዕይ
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-[#2B1B12] sm:text-4xl">
                Exhibition Management
              </h1>
              <p className="mt-1 max-w-2xl text-xs font-semibold leading-relaxed text-[#6E5445]">
                Create, organize, schedule, and analyze museum exhibitions in a unified curatorial control center.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  setEditingExhibition(null);
                  setFormData(defaultFormData);
                  setActiveTab('create');
                }}
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create Exhibition</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('assign')}
              >
                <FolderOpenIcon className="h-4 w-4" />
                <span>Assign Artifacts</span>
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav
            aria-label="Exhibition module views"
            className="mt-6 flex flex-wrap gap-2 border-t border-[#E2D6C5] pt-4"
          >
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { id: 'list', label: 'Exhibitions List', icon: TableCellsIcon },
              { id: 'create', label: editingExhibition ? 'Edit Exhibition' : 'Create Exhibition', icon: PlusIcon },
              { id: 'assign', label: 'Assign Artifacts', icon: FolderOpenIcon },
              { id: 'calendar', label: 'Calendar & Schedule', icon: CalendarDaysIcon },
              { id: 'gallery', label: 'Gallery', icon: PhotoIcon },
              { id: 'categories', label: 'Categories', icon: Squares2X2Icon },
              { id: 'analytics', label: 'Analytics', icon: UsersIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-smrmp-gold text-black shadow-md font-extrabold'
                      : 'bg-[#EFE3D1] text-[#4A3525] hover:bg-[#E2D6C5] hover:text-[#120D08] border border-[#D6C5AE]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD VIEW */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
              <Card padding={false} className="p-4 border-t-2 border-t-smrmp-gold">
                <p className="text-[10px] font-semibold text-smrmp-subtle">Total Exhibitions</p>
                <p className="mt-1 font-display text-2xl font-bold text-[#2B1B12]">{stats.total}</p>
                <p className="mt-1 text-[9px] font-bold text-smrmp-green">All time portfolio</p>
              </Card>
              <Card padding={false} className="p-4 border-t-2 border-t-emerald-500">
                <p className="text-[10px] font-semibold text-smrmp-subtle">Active Exhibitions</p>
                <p className="mt-1 font-display text-2xl font-bold text-emerald-700">{stats.active}</p>
                <p className="mt-1 text-[9px] font-bold text-emerald-600">Currently open</p>
              </Card>
              <Card padding={false} className="p-4 border-t-2 border-t-amber-500">
                <p className="text-[10px] font-semibold text-smrmp-subtle">Upcoming</p>
                <p className="mt-1 font-display text-2xl font-bold text-amber-700">{stats.upcoming}</p>
                <p className="mt-1 text-[9px] font-bold text-amber-600">Scheduled next</p>
              </Card>
              <Card padding={false} className="p-4 border-t-2 border-t-blue-500">
                <p className="text-[10px] font-semibold text-smrmp-subtle">Draft Exhibitions</p>
                <p className="mt-1 font-display text-2xl font-bold text-blue-700">{stats.draft}</p>
                <p className="mt-1 text-[9px] font-bold text-blue-600">In preparation</p>
              </Card>
              <Card padding={false} className="p-4 border-t-2 border-t-slate-400">
                <p className="text-[10px] font-semibold text-smrmp-subtle">Completed</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-700">{stats.completed}</p>
                <p className="mt-1 text-[9px] font-bold text-slate-500">Archived stories</p>
              </Card>
              <Card padding={false} className="p-4 border-t-2 border-t-smrmp-gold">
                <p className="text-[10px] font-semibold text-smrmp-subtle">Total Visitors</p>
                <p className="mt-1 font-display text-2xl font-bold text-[#2B1B12]">
                  {formatVisitorCount(stats.totalVisitors)}
                </p>
                <p className="mt-1 text-[9px] font-bold text-smrmp-green">+14.2% YoY</p>
              </Card>
            </div>

            {/* Featured Exhibition Banner */}
            {stats.featured && (
              <section aria-labelledby="featured-exhibition-title">
                <div className="relative overflow-hidden rounded-2xl border border-smrmp-gold/50 bg-[#1C120B] p-6 text-white shadow-xl">
                  <img
                    src={stats.featured.coverImage}
                    alt={stats.featured.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-35"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#120B07] via-[#1C120B]/90 to-transparent" />
                  <div className="relative z-10 grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">Featured Exhibition</Badge>
                        <span className="text-[10px] uppercase tracking-wider text-smrmp-gold font-bold">
                          {stats.featured.category}
                        </span>
                      </div>
                      <h2 id="featured-exhibition-title" className="font-display text-3xl font-bold text-white sm:text-4xl">
                        {stats.featured.title}
                      </h2>
                      <p className="text-xs text-white/90 leading-relaxed max-w-xl">
                        {stats.featured.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-smrmp-parchment pt-2 font-medium">
                        <span className="flex items-center gap-1.5"><MapPinIcon className="h-4 w-4 text-smrmp-gold" />{stats.featured.hall} ({stats.featured.roomNumber})</span>
                        <span className="flex items-center gap-1.5"><CalendarDaysIcon className="h-4 w-4 text-smrmp-gold" />{stats.featured.startDate} to {stats.featured.endDate}</span>
                        <span className="flex items-center gap-1.5"><UsersIcon className="h-4 w-4 text-smrmp-gold" />{formatVisitorCount(stats.featured.visitorCount)} Visitors</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-xl border border-white/15 bg-black/60 p-4 backdrop-blur-sm">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-gold">Quick Actions</p>
                        <p className="mt-1 text-xs text-white/90">Manage artifacts and details for this featured exhibition.</p>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Button
                          variant="gold"
                          size="sm"
                          className="w-full"
                          onClick={() => setDetailExhibition(stats.featured)}
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View Details & QR</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setAssigningExhibition(stats.featured);
                            setActiveTab('assign');
                          }}
                        >
                          <FolderOpenIcon className="h-4 w-4" />
                          <span>Assign Artifacts</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Charts & Trends Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between pb-3 border-b border-smrmp-border">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2B1B12]">Monthly Visitor Trends</h3>
                    <p className="text-xs text-smrmp-subtle">Year-to-date attendance across all exhibitions</p>
                  </div>
                  <Badge variant="success">+12.6% YoY</Badge>
                </div>
                <div className="h-64 pt-4">
                  <Line
                    data={{
                      labels: exhibitionDashboardData.visitorTrend.map((d) => d.month),
                      datasets: [
                        {
                          label: 'Visitors',
                          data: exhibitionDashboardData.visitorTrend.map((d) => d.visitors),
                          borderColor: '#D4A017',
                          backgroundColor: 'rgba(212,160,23,.15)',
                          borderWidth: 2,
                          fill: true,
                          tension: 0.35,
                        },
                        {
                          label: 'Monthly Target',
                          data: exhibitionDashboardData.visitorTrend.map((d) => d.goal),
                          borderColor: 'rgba(110,84,69,.4)',
                          borderDash: [4, 4],
                          borderWidth: 1,
                          fill: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } },
                      scales: {
                        y: { ticks: { callback: (v) => `${v / 1000}k` } },
                      },
                    }}
                  />
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between pb-3 border-b border-smrmp-border">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2B1B12]">Exhibition Popularity</h3>
                    <p className="text-xs text-smrmp-subtle">Ranked by attendance</p>
                  </div>
                  <ChartBarIcon className="h-5 w-5 text-smrmp-gold" />
                </div>
                <div className="mt-4 space-y-3.5">
                  {exhibitions.slice(0, 4).map((ex, idx) => (
                    <div key={ex.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#2B1B12] truncate max-w-[180px]">
                          {idx + 1}. {ex.title}
                        </span>
                        <span className="text-smrmp-subtle font-medium">{formatVisitorCount(ex.visitorCount)}</span>
                      </div>
                      <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-smrmp-gold rounded-full transition-all"
                          style={{ width: `${Math.min(100, (ex.visitorCount / 20000) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EXHIBITION LIST VIEW */}
        {/* ========================================================================= */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Search & Filter Controls */}
            <Card className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap gap-2">
                  <Input
                    placeholder="Search by title, curator, or hall..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={MagnifyingGlassIcon}
                    className="w-full sm:w-72"
                  />
                  <Select
                    placeholder="All Categories"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    options={[
                      { value: '', label: 'All Categories' },
                      ...categories.map((c) => ({ value: c.name, label: c.name })),
                    ]}
                    className="w-full sm:w-48"
                  />
                  <Select
                    placeholder="All Statuses"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: '', label: 'All Statuses' },
                      { value: 'Active', label: 'Active' },
                      { value: 'Upcoming', label: 'Upcoming' },
                      { value: 'Draft', label: 'Draft' },
                      { value: 'Completed', label: 'Completed' },
                      { value: 'Cancelled', label: 'Cancelled' },
                    ]}
                    className="w-full sm:w-40"
                  />
                </div>

                <div className="flex items-center gap-2 border-t border-stone-200 pt-2 sm:border-0 sm:pt-0">
                  <Button
                    variant={viewMode === 'table' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <TableCellsIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Table</span>
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* List Table View */}
            {viewMode === 'table' ? (
              <Card padding={false} className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6F0] border-b border-[#E2D6C5] font-bold text-[#5C4233] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Exhibition</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Dates</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Artifacts</th>
                        <th className="px-4 py-3">Visitors</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-[#2B1B12]">
                      {filteredExhibitions.map((ex) => (
                        <tr key={ex.id} className="hover:bg-[#FAF0E4]/50 transition-colors">
                          <td className="px-4 py-3 font-semibold">
                            <div className="flex items-center gap-3">
                              <img
                                src={ex.coverImage}
                                alt={ex.title}
                                className="h-10 w-12 rounded-lg object-cover border border-stone-200"
                              />
                              <div>
                                <p className="font-bold text-[#2B1B12]">{ex.title}</p>
                                <p className="text-[10px] text-stone-500">{ex.subtitle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-stone-700">{ex.category}</td>
                          <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                            {ex.startDate} → {ex.endDate}
                          </td>
                          <td className="px-4 py-3 text-stone-600">
                            {ex.hall} {ex.roomNumber ? `(${ex.roomNumber})` : ''}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(ex.status)}</td>
                          <td className="px-4 py-3 font-bold text-smrmp-green">
                            {ex.assignedArtifactIds?.length || 0} assigned
                          </td>
                          <td className="px-4 py-3 font-semibold">{formatVisitorCount(ex.visitorCount)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="View Details"
                                onClick={() => setDetailExhibition(ex)}
                                className="p-1.5 text-stone-600 hover:text-smrmp-green hover:bg-stone-100 rounded-lg transition"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Edit Exhibition"
                                onClick={() => handleEditClick(ex)}
                                className="p-1.5 text-stone-600 hover:text-smrmp-gold hover:bg-stone-100 rounded-lg transition"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Duplicate"
                                onClick={() => handleDuplicateExhibition(ex)}
                                className="p-1.5 text-stone-600 hover:text-blue-600 hover:bg-stone-100 rounded-lg transition"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Delete"
                                onClick={() => setDeletingExhibition(ex)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredExhibitions.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-smrmp-subtle">
                            No exhibitions match the current filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              /* Grid View */
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredExhibitions.map((ex) => (
                  <Card key={ex.id} padding={false} className="overflow-hidden flex flex-col justify-between">
                    <div className="relative h-40">
                      <img src={ex.coverImage} alt={ex.title} className="h-full w-full object-cover" />
                      <div className="absolute top-2 left-2 flex gap-1">
                        {getStatusBadge(ex.status)}
                        {ex.featured && <Badge variant="warning">Featured</Badge>}
                      </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-gold">{ex.category}</p>
                      <h3 className="font-display text-base font-bold text-[#2B1B12] leading-tight">{ex.title}</h3>
                      <p className="text-xs text-stone-600 line-clamp-2">{ex.description}</p>
                      <div className="pt-2 text-xs text-stone-500 space-y-1">
                        <p className="flex items-center gap-1.5"><MapPinIcon className="h-3.5 w-3.5 text-smrmp-gold" />{ex.hall} ({ex.roomNumber})</p>
                        <p className="flex items-center gap-1.5"><CalendarDaysIcon className="h-3.5 w-3.5 text-smrmp-gold" />{ex.startDate} to {ex.endDate}</p>
                      </div>
                    </div>
                    <div className="border-t border-stone-200 bg-[#FAF6F0] p-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-700">
                        {ex.assignedArtifactIds?.length || 0} Artifacts
                      </span>
                      <div className="flex gap-1">
                        <Button variant="secondary" size="xs" onClick={() => setDetailExhibition(ex)}>
                          Details
                        </Button>
                        <Button variant="primary" size="xs" onClick={() => handleEditClick(ex)}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CREATE / EDIT EXHIBITION FORM */}
        {/* ========================================================================= */}
        {activeTab === 'create' && (
          <Card className="max-w-4xl mx-auto p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#2B1B12]">
                  {editingExhibition ? 'Edit Exhibition Record' : 'Create New Museum Exhibition'}
                </h2>
                <p className="text-xs text-smrmp-subtle">Fill out exhibition details, schedule, and hall locations</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('list')}>
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSaveExhibition} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Exhibition Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. The Lion of Adwa"
                  required
                />
                <Input
                  label="Subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Material History of Courage"
                />

                <Select
                  label="Category *"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={categories.map((c) => ({ value: c.name, label: c.name }))}
                  required
                />

                <Input
                  label="Theme / Focus"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="e.g. Heroic Heritage & Craftsmanship"
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
                  label="Opening Time"
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                />
                <Input
                  label="Closing Time"
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                />

                <Select
                  label="Exhibition Hall *"
                  value={formData.hall}
                  onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                  options={[
                    { value: 'Hall 01', label: 'Hall 01' },
                    { value: 'Hall 02', label: 'Hall 02' },
                    { value: 'Hall 03', label: 'Hall 03' },
                    { value: 'Hall 04', label: 'Hall 04' },
                    { value: 'Education Wing', label: 'Education Wing' },
                  ]}
                  required
                />
                <Input
                  label="Room Number / Pavilion"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g. Room 2B"
                />

                <Input
                  label="Max Capacity (Visitors)"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 0 })}
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

                <div className="sm:col-span-2">
                  <Input
                    label="Cover Image URL"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C4233]">
                    Description & Curatorial Notes *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the exhibition concept, key objects, and story..."
                    className="w-full rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-3 text-sm text-[#2B1B12] outline-none focus:border-smrmp-green focus:ring-2 focus:ring-smrmp-green/20"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-stone-300 text-smrmp-gold focus:ring-smrmp-gold"
                    />
                    Featured Exhibition
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => setActiveTab('list')}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gold">
                    {editingExhibition ? 'Save Changes' : 'Create Exhibition'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ASSIGN ARTIFACTS TOOL */}
        {/* ========================================================================= */}
        {activeTab === 'assign' && (
          <Card className="p-6 space-y-6">
            <div className="border-b border-stone-200 pb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-[#2B1B12]">Assign Artifacts to Exhibition</h2>
                <p className="text-xs text-smrmp-subtle">Select an exhibition and manage physical artifacts displayed in it</p>
              </div>

              <Select
                label="Target Exhibition"
                value={assigningExhibition?.id || exhibitions[0]?.id}
                onChange={(e) => {
                  const target = exhibitions.find((ex) => ex.id === e.target.value);
                  setAssigningExhibition(target);
                }}
                options={exhibitions.map((ex) => ({ value: ex.id, label: ex.title }))}
                className="w-full sm:w-80"
              />
            </div>

            {assigningExhibition && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#FAF6F0] p-4 border border-[#E2D6C5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-smrmp-gold">{assigningExhibition.category}</span>
                    <h3 className="font-bold text-base text-[#2B1B12]">{assigningExhibition.title}</h3>
                    <p className="text-xs text-stone-600">
                      Hall: {assigningExhibition.hall} ({assigningExhibition.roomNumber}) · {assigningExhibition.assignedArtifactIds?.length || 0} artifacts currently assigned
                    </p>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-[#2B1B12] pt-2">Available Artifact Repository</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {artifacts.map((art) => {
                    const isAssignedToThis = assigningExhibition.assignedArtifactIds?.includes(art.id);
                    return (
                      <div
                        key={art.id}
                        className={`rounded-xl border p-3 flex gap-3 items-center justify-between transition ${
                          isAssignedToThis ? 'border-smrmp-green bg-emerald-50/50' : 'border-stone-200 bg-white'
                        }`}
                      >
                        <img src={art.image} alt={art.name} className="h-12 w-12 rounded-lg object-cover border" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-[#2B1B12] truncate">{art.name}</p>
                          <p className="text-[10px] text-stone-500 uppercase">{art.category} · {art.location}</p>
                        </div>
                        <Button
                          variant={isAssignedToThis ? 'danger' : 'gold'}
                          size="xs"
                          onClick={() => handleToggleArtifactAssignment(assigningExhibition.id, art.id)}
                        >
                          {isAssignedToThis ? 'Remove' : 'Assign'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CALENDAR & SCHEDULE */}
        {/* ========================================================================= */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#2B1B12]">Exhibition Calendar & Timelines</h2>
                  <p className="text-xs text-smrmp-subtle">Schedule tours, lectures, and public exhibition openings</p>
                </div>

                <div className="flex items-center gap-2">
                  {['day', 'week', 'month', 'year'].map((mode) => (
                    <Button
                      key={mode}
                      variant={calendarView === mode ? 'primary' : 'secondary'}
                      size="xs"
                      onClick={() => setCalendarView(mode)}
                      className="capitalize"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Conflict Indicator */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <span>No schedule conflicts detected for Hall 01, Hall 02, and Hall 03 today.</span>
              </div>

              {/* Daily Schedule Rail */}
              <div className="mt-6 space-y-3">
                <h3 className="font-bold text-sm text-[#2B1B12]">Today's Scheduled Events</h3>
                <div className="divide-y divide-stone-200 border rounded-xl overflow-hidden bg-white">
                  {exhibitionDashboardData.schedule.map((sch, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-stone-50 transition">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-smrmp-gold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          {sch.time}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-[#2B1B12]">{sch.title}</p>
                          <p className="text-xs text-stone-500">{sch.detail}</p>
                        </div>
                      </div>
                      <Badge variant="success">Scheduled</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: GALLERY */}
        {/* ========================================================================= */}
        {activeTab === 'gallery' && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#2B1B12]">Exhibition Media Gallery</h2>
                <p className="text-xs text-smrmp-subtle">High-resolution imagery for public storytelling</p>
              </div>
              <Button variant="gold" size="sm" onClick={() => toast.success('Image upload tool ready')}>
                <PhotoIcon className="h-4 w-4" />
                <span>Upload New Image</span>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exhibitions.flatMap((e) => e.galleryImages || []).map((img, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl border border-stone-200 bg-black cursor-pointer h-48"
                  onClick={() => setFullscreenImage(img)}
                >
                  <img src={img} alt="Gallery" className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-3 flex items-end justify-between text-white">
                    <span className="text-xs font-bold">Click to view full screen</span>
                    <EyeIcon className="h-4 w-4 text-smrmp-gold" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: CATEGORIES */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-[#2B1B12]">Exhibition Categories Taxonomy</h2>
              <Button variant="gold" size="sm" onClick={() => setShowAddCategoryModal(true)}>
                <PlusIcon className="h-4 w-4" />
                <span>Add Category</span>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Card key={cat.id} className="p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#2B1B12]">{cat.name}</h3>
                      <Badge variant="success">{cat.status}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-stone-600 leading-relaxed">{cat.description}</p>
                  </div>
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-semibold">
                    <span>{cat.count} Exhibitions</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter(cat.name);
                        setActiveTab('list');
                      }}
                      className="text-smrmp-gold hover:underline font-bold"
                    >
                      Filter View →
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-4">
                <p className="text-xs text-smrmp-subtle font-semibold">Total Attendance</p>
                <p className="text-2xl font-bold font-display text-[#2B1B12]">67,480</p>
                <p className="text-[10px] font-bold text-emerald-600">+14.2% YoY</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-smrmp-subtle font-semibold">Avg Visit Duration</p>
                <p className="text-2xl font-bold font-display text-[#2B1B12]">48 min</p>
                <p className="text-[10px] font-bold text-emerald-600">+6 min vs Q3</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-smrmp-subtle font-semibold">Attendance Rate</p>
                <p className="text-2xl font-bold font-display text-[#2B1B12]">86%</p>
                <p className="text-[10px] font-bold text-emerald-600">Above 80% target</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-smrmp-subtle font-semibold">Satisfaction Rating</p>
                <p className="text-2xl font-bold font-display text-[#2B1B12]">4.9 / 5.0</p>
                <p className="text-[10px] font-bold text-emerald-600">Based on 1.2k reviews</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-[#2B1B12] mb-4">Visitor Demographics Breakdown</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ['Local School Groups', 'Domestic Tourists', 'International Visitors', 'Researchers & VIPs'],
                    datasets: [
                      {
                        label: 'Visitors Count',
                        data: [24000, 28000, 12000, 3480],
                        backgroundColor: '#D4A017',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODALS */}
        {/* ========================================================================= */}

        {/* Detail Modal */}
        {detailExhibition && (
          <Modal
            isOpen={Boolean(detailExhibition)}
            onClose={() => setDetailExhibition(null)}
            title={detailExhibition.title}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4 text-xs text-[#2B1B12]">
              <img
                src={detailExhibition.coverImage}
                alt={detailExhibition.title}
                className="h-48 w-full rounded-xl object-cover border"
              />
              <div className="flex items-center justify-between">
                <Badge variant="warning">{detailExhibition.category}</Badge>
                {getStatusBadge(detailExhibition.status)}
              </div>
              <p className="text-sm text-stone-700">{detailExhibition.description}</p>

              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <p><strong>Hall:</strong> {detailExhibition.hall} ({detailExhibition.roomNumber})</p>
                <p><strong>Curator:</strong> {detailExhibition.curator}</p>
                <p><strong>Dates:</strong> {detailExhibition.startDate} to {detailExhibition.endDate}</p>
                <p><strong>Hours:</strong> {detailExhibition.openingTime} - {detailExhibition.closingTime}</p>
              </div>

              <div className="border-t pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCodeIcon className="h-6 w-6 text-smrmp-gold" />
                  <div>
                    <p className="font-bold text-xs">Public QR Code: {detailExhibition.qrCode}</p>
                    <p className="text-[10px] text-stone-500">Scan tag at hall entrance</p>
                  </div>
                </div>
                <Button variant="gold" size="xs" onClick={() => handleCopyPublicUrl(detailExhibition.publicUrl)}>
                  Copy Link
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {deletingExhibition && (
          <Modal
            isOpen={Boolean(deletingExhibition)}
            onClose={() => setDeletingExhibition(null)}
            title="Confirm Delete Exhibition"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <ExclamationTriangleIcon className="h-6 w-6 shrink-0" />
                <p className="text-xs font-semibold">
                  Are you sure you want to delete "{deletingExhibition.title}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setDeletingExhibition(null)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDeleteExhibition(deletingExhibition.id)}>
                  Delete Exhibition
                </Button>
              </div>
            </div>
          </Modal>
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
                placeholder="e.g. Commemorative Exhibition"
              />
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-stone-600">Description</label>
                <textarea
                  rows={3}
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Describe the scope of this category..."
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-smrmp-gold"
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

        {/* Fullscreen Image Modal */}
        {fullscreenImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              type="button"
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 text-white hover:text-smrmp-gold"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            <img src={fullscreenImage} alt="Fullscreen preview" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" />
          </div>
        )}
      </div>
    </PrivateLayout>
  );
}
