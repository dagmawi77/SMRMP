import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ChartBarIcon,
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
  TableCellsIcon,
  EyeIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowRightIcon,
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
import { Line } from 'react-chartjs-2';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PrivateLayout from '../../components/layout/PrivateLayout';
import {
  useExhibitions,
  useCreateExhibition,
  useUpdateExhibition,
  useDeleteExhibition,
} from '../../hooks/useExhibitions';
import { useDashboardStats, useDashboardCharts } from '../../hooks/useDashboard';

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

export const formatVisitorCount = (value) => new Intl.NumberFormat('en-US').format(value || 0);

export default function ExhibitionDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'list' | 'gallery' | 'categories'

  // Dynamic API queries
  const { data: exhibitionsApiData, isLoading: isExhibitionsLoading } = useExhibitions();
  const { data: dashboardStats } = useDashboardStats();
  const { data: dashboardCharts } = useDashboardCharts();

  const createExhibitionMutation = useCreateExhibition();
  const updateExhibitionMutation = useUpdateExhibition();
  const deleteExhibitionMutation = useDeleteExhibition();

  const [customCategories, setCustomCategories] = useState([]);

  // Search & Filter state for List View
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedExhibitionIds, setSelectedExhibitionIds] = useState([]);

  // Modals state
  const [detailExhibition, setDetailExhibition] = useState(null);
  const [deletingExhibition, setDeletingExhibition] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [galleryFilterExhibitionId, setGalleryFilterExhibitionId] = useState('all');

  // Dynamic exhibitions array ONLY from backend API
  const exhibitions = useMemo(() => {
    const liveList = exhibitionsApiData?.exhibitions || [];
    return liveList.map((e) => {
      const rawStatus = (e.status || 'planning').toLowerCase();
      let displayStatus = 'Draft';
      if (rawStatus === 'active') displayStatus = 'Active';
      else if (rawStatus === 'upcoming') displayStatus = 'Upcoming';
      else if (rawStatus === 'closed' || rawStatus === 'ended' || rawStatus === 'completed') displayStatus = 'Completed';
      else if (rawStatus === 'cancelled') displayStatus = 'Cancelled';

      return {
        id: e.id,
        title: e.name || 'Untitled Exhibition',
        subtitle: e.theme ? `Theme: ${e.theme}` : (e.description || 'Curatorial Showcase'),
        category: e.theme || 'Permanent Exhibition',
        description: e.description || 'No description provided.',
        theme: e.theme || 'Heritage & Memory',
        coverImage:
          e.gallery && e.gallery.startsWith('http')
            ? e.gallery
            : 'https://images.pexels.com/photos/14950665/pexels-photo-14950665.jpeg?auto=compress&cs=tinysrgb&w=800&q=80',
        startDate: e.start_date || 'N/A',
        endDate: e.end_date || 'N/A',
        openingTime: '09:00',
        closingTime: '18:00',
        hall: e.gallery || 'Main Hall',
        roomNumber: 'Main Room',
        capacity: e.expected_visitors || 200,
        status: displayStatus,
        rawStatus: rawStatus,
        featured: false,
        publicVisibility: true,
        curator: 'Curatorial Team',
        visitorCount: e.actual_visitors || e.expected_visitors || 0,
        assignedArtifactIds: Array.isArray(e.artifacts) ? e.artifacts.map((a) => a.id) : [],
        artifacts: e.artifacts || [],
        qrCode: `ADWA-EX-${e.id.slice(0, 8)}`,
        galleryImages: [
          e.gallery && e.gallery.startsWith('http')
            ? e.gallery
            : 'https://images.pexels.com/photos/14950665/pexels-photo-14950665.jpeg?auto=compress&cs=tinysrgb&w=600&q=80',
        ],
      };
    });
  }, [exhibitionsApiData]);

  // Derive categories taxonomy dynamically from backend exhibitions
  const categories = useMemo(() => {
    const map = new Map();
    exhibitions.forEach((ex) => {
      const catName = ex.category || 'Permanent Exhibition';
      if (!map.has(catName)) {
        map.set(catName, {
          id: `cat-${catName.toLowerCase().replace(/\s+/g, '-')}`,
          name: catName,
          description: `Core displays categorized under ${catName}.`,
          count: 0,
          status: 'Active',
        });
      }
      map.get(catName).count += 1;
    });

    customCategories.forEach((cat) => {
      if (!map.has(cat.name)) {
        map.set(cat.name, cat);
      }
    });

    return Array.from(map.values());
  }, [exhibitions, customCategories]);

  // Calculated Stats from DB
  const stats = useMemo(() => {
    const total = exhibitions.length;
    const active = exhibitions.filter((e) => e.status === 'Active').length;
    const upcoming = exhibitions.filter((e) => e.status === 'Upcoming').length;
    const completed = exhibitions.filter((e) => e.status === 'Completed').length;
    const cancelled = exhibitions.filter((e) => e.status === 'Cancelled').length;
    const draft = exhibitions.filter((e) => e.status === 'Draft').length;
    const totalVisitors = exhibitions.reduce((acc, curr) => acc + (curr.visitorCount || 0), 0);
    const featured = exhibitions[0] || null;
    return { total, active, upcoming, completed, cancelled, draft, totalVisitors, featured };
  }, [exhibitions]);

  // Chart data from backend
  const visitorTrendData = useMemo(() => {
    const rawTrend = dashboardCharts?.visitor_trend || [];
    if (rawTrend.length > 0) {
      return {
        labels: rawTrend.map((d) => d.date),
        visitors: rawTrend.map((d) => d.count),
        goals: rawTrend.map((d) => Math.round(d.count * 1.1 + 10)),
      };
    }
    const labels = exhibitions.map((ex) => (ex.title.length > 15 ? `${ex.title.slice(0, 15)}...` : ex.title));
    const visitors = exhibitions.map((ex) => ex.visitorCount);
    const goals = exhibitions.map((ex) => ex.capacity);
    return { labels, visitors, goals };
  }, [dashboardCharts, exhibitions]);

  // Filtered Exhibitions
  const filteredExhibitions = useMemo(() => {
    return exhibitions.filter((ex) => {
      const matchesSearch =
        !searchTerm ||
        ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ex.curator && ex.curator.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ex.hall && ex.hall.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !categoryFilter || ex.category === categoryFilter;
      const matchesStatus = !statusFilter || ex.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [exhibitions, searchTerm, categoryFilter, statusFilter]);

  const isAnyFilterActive = Boolean(searchTerm || categoryFilter || statusFilter);

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  const handleQuickStatusChange = async (exhibitionId, newStatus) => {
    let backendStatus = newStatus.toLowerCase();
    if (backendStatus === 'draft') backendStatus = 'planning';
    if (backendStatus === 'completed') backendStatus = 'closed';
    try {
      await updateExhibitionMutation.mutateAsync({
        id: exhibitionId,
        data: { status: backendStatus },
      });
      toast.success(`Exhibition status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteExhibition = async (id) => {
    try {
      await deleteExhibitionMutation.mutateAsync(id);
      setSelectedExhibitionIds((prev) => prev.filter((item) => item !== id));
      toast.success('Exhibition deleted from database');
    } catch {
      toast.error('Failed to delete exhibition record');
    }
    setDeletingExhibition(null);
  };

  const handleDuplicateExhibition = async (ex) => {
    try {
      await createExhibitionMutation.mutateAsync({
        name: `${ex.title} (Copy)`,
        description: ex.description,
        status: 'planning',
        start_date: ex.startDate !== 'N/A' ? ex.startDate : null,
        end_date: ex.endDate !== 'N/A' ? ex.endDate : null,
        location: ex.hall,
        theme: ex.theme,
        expected_visitors: ex.capacity,
        artifact_ids: ex.assignedArtifactIds,
      });
      toast.success(`Cloned "${ex.title}" into database`);
    } catch {
      toast.error('Failed to duplicate exhibition');
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedExhibitionIds.length === 0) return;
    let backendStatus = newStatus.toLowerCase();
    if (backendStatus === 'draft') backendStatus = 'planning';
    if (backendStatus === 'completed') backendStatus = 'closed';
    try {
      await Promise.all(
        selectedExhibitionIds.map((id) =>
          updateExhibitionMutation.mutateAsync({
            id,
            data: { status: backendStatus },
          })
        )
      );
      toast.success(`Updated ${selectedExhibitionIds.length} exhibitions in database`);
      setSelectedExhibitionIds([]);
    } catch {
      toast.error('Failed to update selected exhibitions');
    }
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
    setCustomCategories((prev) => [...prev, newCat]);
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
      case 'ended':
        return <Badge variant="default">Completed</Badge>;
      case 'Cancelled':
      case 'cancelled':
        return <Badge variant="critical">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Gallery items filtered by exhibition
  const allGalleryItems = useMemo(() => {
    return exhibitions.flatMap((ex) =>
      (ex.galleryImages || []).map((imgUrl, i) => ({
        id: `${ex.id}-img-${i}`,
        exhibitionId: ex.id,
        exhibitionTitle: ex.title,
        url: imgUrl,
        category: ex.category,
      }))
    );
  }, [exhibitions]);

  const filteredGalleryItems = useMemo(() => {
    if (galleryFilterExhibitionId === 'all') return allGalleryItems;
    return allGalleryItems.filter((item) => item.exhibitionId === galleryFilterExhibitionId);
  }, [allGalleryItems, galleryFilterExhibitionId]);

  return (
    <PrivateLayout>
      <div className="space-y-5 pb-8">
        {/* ========================================================================= */}
        {/* HEADER & PORTAL NAVIGATION */}
        {/* ========================================================================= */}
        <header className="rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C4A2D]">
                <span className="h-2 w-2 rounded-full bg-smrmp-gold" />
                Adwa Museum Curatorial Division / ዐውደ ርዕይ
              </div>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#2B1B12] sm:text-3xl">
                Exhibition Management Workspace
              </h1>
              <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[#6E5445]">
                Curate, catalog, schedule halls, and track attendance across permanent and seasonal exhibitions.
              </p>
            </div>

            {/* Top Single Primary Action Button */}
            <div className="flex items-center gap-2">
              <Button variant="gold" size="sm" onClick={() => navigate('/exhibitions/new')}>
                <PlusIcon className="h-4 w-4" />
                <span>Create Exhibition</span>
              </Button>
            </div>
          </div>

          {/* Scrollable Pill Tab Navigation */}
          <div className="mt-5 border-t border-[#E2D6C5] pt-3 overflow-x-auto no-scrollbar">
            <nav aria-label="Exhibition workspace views" className="flex items-center gap-1.5 min-w-max">
              {[
                { id: 'dashboard', label: 'Dashboard Overview', icon: ChartBarIcon, badge: null },
                { id: 'list', label: 'Exhibitions List', icon: TableCellsIcon, badge: exhibitions.length },
                { id: 'gallery', label: 'Media Gallery', icon: PhotoIcon, badge: allGalleryItems.length },
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
                        ? 'bg-smrmp-gold text-[#1C120B] shadow-xs font-extrabold ring-1 ring-amber-600/30'
                        : 'bg-[#EFE3D1] text-[#4A3525] hover:bg-[#E2D6C5] hover:text-[#120D08] border border-[#D6C5AE]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                    {tab.badge !== null && (
                      <span
                        className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                          isActive
                            ? 'bg-[#1C120B] text-smrmp-gold'
                            : 'bg-[#FAF6F0] text-[#7C4A2D] border border-[#D8C8B8]'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {isExhibitionsLoading && (
          <div className="p-3 text-center text-xs font-bold text-[#7C4A2D]">
            Loading exhibition records from backend database...
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD VIEW */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            {/* Interactive KPI Cards */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setActiveTab('list');
                }}
                className="text-left group cursor-pointer"
              >
                <Card padding={false} className="p-3.5 border-t-2 border-t-smrmp-gold hover:shadow-md transition">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-subtle">Total Exhibitions</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#2B1B12] group-hover:text-smrmp-gold transition">
                    {stats.total}
                  </p>
                  <p className="mt-1 text-[9px] font-bold text-smrmp-green flex items-center gap-1">
                    <span>View all records</span>
                    <ArrowRightIcon className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition" />
                  </p>
                </Card>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Active');
                  setActiveTab('list');
                }}
                className="text-left group cursor-pointer"
              >
                <Card padding={false} className="p-3.5 border-t-2 border-t-emerald-600 hover:shadow-md transition">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-subtle">Active Exhibitions</p>
                  <p className="mt-1 font-display text-2xl font-bold text-emerald-800 group-hover:scale-105 transition">
                    {stats.active}
                  </p>
                  <p className="mt-1 text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                    <span>Currently open</span>
                    <ArrowRightIcon className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition" />
                  </p>
                </Card>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Upcoming');
                  setActiveTab('list');
                }}
                className="text-left group cursor-pointer"
              >
                <Card padding={false} className="p-3.5 border-t-2 border-t-amber-500 hover:shadow-md transition">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-subtle">Upcoming</p>
                  <p className="mt-1 font-display text-2xl font-bold text-amber-800 group-hover:scale-105 transition">
                    {stats.upcoming}
                  </p>
                  <p className="mt-1 text-[9px] font-bold text-amber-700 flex items-center gap-1">
                    <span>Scheduled next</span>
                    <ArrowRightIcon className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition" />
                  </p>
                </Card>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Draft');
                  setActiveTab('list');
                }}
                className="text-left group cursor-pointer"
              >
                <Card padding={false} className="p-3.5 border-t-2 border-t-blue-500 hover:shadow-md transition">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-subtle">Drafts</p>
                  <p className="mt-1 font-display text-2xl font-bold text-blue-800 group-hover:scale-105 transition">
                    {stats.draft}
                  </p>
                  <p className="mt-1 text-[9px] font-bold text-blue-700 flex items-center gap-1">
                    <span>In preparation</span>
                    <ArrowRightIcon className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition" />
                  </p>
                </Card>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Completed');
                  setActiveTab('list');
                }}
                className="text-left group cursor-pointer"
              >
                <Card padding={false} className="p-3.5 border-t-2 border-t-slate-400 hover:shadow-md transition">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-subtle">Completed</p>
                  <p className="mt-1 font-display text-2xl font-bold text-slate-800 group-hover:scale-105 transition">
                    {stats.completed}
                  </p>
                  <p className="mt-1 text-[9px] font-bold text-slate-600 flex items-center gap-1">
                    <span>Archived stories</span>
                    <ArrowRightIcon className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition" />
                  </p>
                </Card>
              </button>

              <Card padding={false} className="p-3.5 border-t-2 border-t-smrmp-gold">
                <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-subtle">Total Expected Visitors</p>
                <p className="mt-1 font-display text-2xl font-bold text-[#2B1B12]">
                  {formatVisitorCount(stats.totalVisitors)}
                </p>
                <p className="mt-1 text-[9px] font-bold text-smrmp-green">
                  {dashboardStats?.visitors_today ? `${dashboardStats.visitors_today} today` : 'From database'}
                </p>
              </Card>
            </div>

            {/* Featured Exhibition Spotlight Banner */}
            {stats.featured ? (
              <section aria-labelledby="featured-exhibition-title">
                <div className="relative overflow-hidden rounded-2xl border border-smrmp-gold/50 bg-[#1C120B] p-5 sm:p-7 text-white shadow-lg">
                  <img
                    src={stats.featured.coverImage}
                    alt={stats.featured.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-35"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#120B07] via-[#1C120B]/90 to-transparent" />

                  <div className="relative z-10 grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="fair">Featured Showcase</Badge>
                        <span className="text-[10px] uppercase tracking-wider text-smrmp-gold font-bold">
                          {stats.featured.category}
                        </span>
                      </div>
                      <h2 id="featured-exhibition-title" className="font-display text-2xl font-bold text-white sm:text-3xl">
                        {stats.featured.title}
                      </h2>
                      <p className="text-xs text-white/90 leading-relaxed max-w-xl">
                        {stats.featured.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-smrmp-parchment pt-2 font-medium">
                        <span className="flex items-center gap-1.5">
                          <MapPinIcon className="h-4 w-4 text-smrmp-gold" />
                          {stats.featured.hall} ({stats.featured.roomNumber})
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="h-4 w-4 text-smrmp-gold" />
                          {stats.featured.startDate} → {stats.featured.endDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <UsersIcon className="h-4 w-4 text-smrmp-gold" />
                          {formatVisitorCount(stats.featured.visitorCount)} Expected Visitors
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-xl border border-white/20 bg-black/70 p-4 backdrop-blur-md">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-gold flex items-center gap-1">
                          <SparklesIcon className="h-3.5 w-3.5" />
                          <span>Curator Quick Controls</span>
                        </p>
                        <p className="text-xs text-white/90">
                          Assigned Artifacts:{' '}
                          <span className="font-bold text-smrmp-gold">
                            {stats.featured.assignedArtifactIds?.length || 0} items
                          </span>
                        </p>
                        <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                          <div
                            className="h-full bg-smrmp-gold rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                ((stats.featured.assignedArtifactIds?.length || 0) / 5) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Button
                          variant="gold"
                          size="sm"
                          className="w-full"
                          onClick={() => setDetailExhibition(stats.featured)}
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View Details &amp; QR Tag</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() => navigate(`/exhibitions/${stats.featured.id}/edit`)}
                        >
                          <PencilSquareIcon className="h-4 w-4 text-[#7C4A2D]" />
                          <span>Edit &amp; Manage Planner</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <Card className="p-8 text-center space-y-3">
                <ArchiveBoxIcon className="mx-auto h-10 w-10 text-[#A89485]" />
                <h3 className="font-display text-lg font-bold text-[#2B1B12]">No Exhibitions Found in Database</h3>
                <p className="text-xs text-[#6E5445] max-w-md mx-auto">
                  Create your first exhibition record to begin curating museum halls and assigning physical artifacts.
                </p>
                <Button variant="gold" size="sm" onClick={() => navigate('/exhibitions/new')} className="mt-2">
                  <PlusIcon className="h-4 w-4" />
                  <span>Create First Exhibition</span>
                </Button>
              </Card>
            )}

            {/* Main Operational Charts Grid */}
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2D6C5]">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2B1B12]">Visitor Attendance Trends</h3>
                    <p className="text-xs text-[#6E5445]">Attendance analytics loaded live from database</p>
                  </div>
                  <Badge variant="excellent">Live DB</Badge>
                </div>
                <div className="h-64 pt-4">
                  {visitorTrendData.labels.length > 0 ? (
                    <Line
                      data={{
                        labels: visitorTrendData.labels,
                        datasets: [
                          {
                            label: 'Visitors',
                            data: visitorTrendData.visitors,
                            borderColor: '#D4A017',
                            backgroundColor: 'rgba(212,160,23,.15)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.35,
                          },
                          {
                            label: 'Target / Capacity',
                            data: visitorTrendData.goals,
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
                          y: { ticks: { callback: (v) => formatVisitorCount(v) } },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#7C4A2D]">
                      No visitor attendance records available in database yet.
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between pb-3 border-b border-[#E2D6C5]">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2B1B12]">Popularity Leaderboard</h3>
                    <p className="text-xs text-[#6E5445]">Ranked by expected / actual visitors</p>
                  </div>
                  <ChartBarIcon className="h-5 w-5 text-smrmp-gold" />
                </div>
                <div className="mt-4 space-y-3.5">
                  {exhibitions.slice(0, 5).map((ex, idx) => {
                    const maxCount = Math.max(...exhibitions.map((e) => e.visitorCount || 1), 1);
                    const pct = Math.min(100, Math.round((ex.visitorCount / maxCount) * 100));
                    return (
                      <div key={ex.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2B1B12] truncate max-w-[170px]">
                            {idx + 1}. {ex.title}
                          </span>
                          <span className="text-[#6E5445] font-medium">{formatVisitorCount(ex.visitorCount)}</span>
                        </div>
                        <div className="h-2 w-full bg-[#EFE5D8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-smrmp-gold rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {exhibitions.length === 0 && (
                    <p className="text-xs text-center text-[#7C4A2D] py-6">No exhibitions in database</p>
                  )}
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
            {/* Search & Filter Toolbar */}
            <Card className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <Input
                      placeholder="Search title, curator, or hall..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={MagnifyingGlassIcon}
                      className="w-full sm:w-72"
                    />
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
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
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryModal(true)}
                        title="Add New Category"
                        className="rounded-xl border border-[#D6C5AE] bg-[#EFE3D1] p-2 text-[#4A3525] hover:bg-[#E2D6C5] transition"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
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

                  <div className="flex items-center gap-2 border-t border-[#E2D6C5] pt-2 sm:border-0 sm:pt-0">
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

                {/* Active Filter Pills Bar */}
                {isAnyFilterActive && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2D6C5]/60 text-xs">
                    <span className="font-bold text-[#7C4A2D] flex items-center gap-1">
                      <FunnelIcon className="h-3.5 w-3.5" /> Active Filters:
                    </span>

                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF0D8] px-2.5 py-0.5 font-semibold text-[#7C4A2D] border border-[#D4A017]/40">
                        Search: "{searchTerm}"
                        <button type="button" onClick={() => setSearchTerm('')} className="hover:text-black">
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {categoryFilter && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF0D8] px-2.5 py-0.5 font-semibold text-[#7C4A2D] border border-[#D4A017]/40">
                        Category: {categoryFilter}
                        <button type="button" onClick={() => setCategoryFilter('')} className="hover:text-black">
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {statusFilter && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF0D8] px-2.5 py-0.5 font-semibold text-[#7C4A2D] border border-[#D4A017]/40">
                        Status: {statusFilter}
                        <button type="button" onClick={() => setStatusFilter('')} className="hover:text-black">
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="ml-auto text-xs font-bold text-smrmp-green hover:underline"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Bulk Actions Toolbar */}
            {selectedExhibitionIds.length > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-[#FAF0D8] p-3 border border-[#D4A017]/50 text-xs font-bold text-[#7C4A2D]">
                <span>{selectedExhibitionIds.length} exhibitions selected</span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="xs" onClick={() => handleBulkStatusChange('Active')}>
                    Mark Active
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => handleBulkStatusChange('Completed')}>
                    Mark Completed
                  </Button>
                  <Button variant="danger" size="xs" onClick={() => setSelectedExhibitionIds([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            {/* List Table View */}
            {viewMode === 'table' ? (
              <Card padding={false} className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6F0] border-b border-[#E2D6C5] font-bold text-[#5C4233] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-3 w-8 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredExhibitions.length > 0 &&
                              selectedExhibitionIds.length === filteredExhibitions.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExhibitionIds(filteredExhibitions.map((ex) => ex.id));
                              } else {
                                setSelectedExhibitionIds([]);
                              }
                            }}
                            className="rounded border-stone-300 text-smrmp-gold"
                          />
                        </th>
                        <th className="px-4 py-3">Exhibition</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Dates &amp; Schedule</th>
                        <th className="px-4 py-3">Hall Location</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Artifacts</th>
                        <th className="px-4 py-3">Visitors</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2D6C5]/60 text-[#2B1B12]">
                      {filteredExhibitions.map((ex) => {
                        const isSelected = selectedExhibitionIds.includes(ex.id);
                        return (
                          <tr
                            key={ex.id}
                            className={`transition-colors ${
                              isSelected ? 'bg-[#FAF0D8]/60' : 'hover:bg-[#FAF0E4]/50'
                            }`}
                          >
                            <td className="px-3 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedExhibitionIds((prev) => [...prev, ex.id]);
                                  } else {
                                    setSelectedExhibitionIds((prev) => prev.filter((id) => id !== ex.id));
                                  }
                                }}
                                className="rounded border-stone-300 text-smrmp-gold"
                              />
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              <div className="flex items-center gap-3">
                                <img
                                  src={ex.coverImage}
                                  alt={ex.title}
                                  className="h-10 w-12 rounded-lg object-cover border border-[#E2D6C5]"
                                />
                                <div>
                                  <p className="font-bold text-[#2B1B12]">{ex.title}</p>
                                  <p className="text-[10px] text-[#6E5445] truncate max-w-xs">{ex.subtitle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-[#5C4233]">{ex.category}</td>
                            <td className="px-4 py-3 text-[#5C4233] whitespace-nowrap">
                              <p className="font-medium">{ex.startDate} → {ex.endDate}</p>
                              <p className="text-[10px] text-[#7C4A2D]">{ex.openingTime} - {ex.closingTime}</p>
                            </td>
                            <td className="px-4 py-3 text-[#5C4233]">
                              <p className="font-bold text-[#2B1B12]">{ex.hall}</p>
                              <p className="text-[10px] text-[#7C4A2D]">{ex.roomNumber}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {getStatusBadge(ex.status)}
                                <select
                                  value={ex.status}
                                  onChange={(e) => handleQuickStatusChange(ex.id, e.target.value)}
                                  className="text-[10px] bg-transparent border-0 font-bold text-[#7C4A2D] cursor-pointer focus:ring-0"
                                  title="Quick change status"
                                >
                                  <option value="Draft">Draft</option>
                                  <option value="Active">Active</option>
                                  <option value="Upcoming">Upcoming</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-smrmp-green">
                              <button
                                type="button"
                                onClick={() => navigate(`/exhibitions/${ex.id}/edit`)}
                                className="hover:underline flex items-center gap-1"
                              >
                                <span>{ex.assignedArtifactIds?.length || 0} items</span>
                                <FolderOpenIcon className="h-3.5 w-3.5" />
                              </button>
                            </td>
                            <td className="px-4 py-3 font-semibold text-[#2B1B12]">
                              {formatVisitorCount(ex.visitorCount)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  title="View Details & QR"
                                  onClick={() => setDetailExhibition(ex)}
                                  className="p-1.5 text-[#5C4233] hover:text-smrmp-green hover:bg-[#FAF0E4] rounded-lg transition"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Edit Exhibition"
                                  onClick={() => navigate(`/exhibitions/${ex.id}/edit`)}
                                  className="p-1.5 text-[#5C4233] hover:text-smrmp-gold hover:bg-[#FAF0E4] rounded-lg transition"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Duplicate"
                                  onClick={() => handleDuplicateExhibition(ex)}
                                  className="p-1.5 text-[#5C4233] hover:text-blue-700 hover:bg-[#FAF0E4] rounded-lg transition"
                                >
                                  <DocumentDuplicateIcon className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Delete Record"
                                  onClick={() => setDeletingExhibition(ex)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredExhibitions.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-12 text-center text-smrmp-subtle space-y-2">
                            <ArchiveBoxIcon className="mx-auto h-8 w-8 text-[#A89485]" />
                            <p className="font-bold text-sm text-[#2B1B12]">No exhibitions match your search or filters</p>
                            <p className="text-xs text-[#6E5445]">Try clearing search terms or status filters.</p>
                            <Button variant="gold" size="xs" onClick={clearAllFilters} className="mt-2">
                              Reset Search Filters
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              /* Grid Card View */
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredExhibitions.map((ex) => (
                  <Card key={ex.id} padding={false} className="overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div className="relative h-44">
                      <img src={ex.coverImage} alt={ex.title} className="h-full w-full object-cover" />
                      <div className="absolute top-2 left-2 flex gap-1">
                        {getStatusBadge(ex.status)}
                        {ex.featured && <Badge variant="fair">Featured</Badge>}
                      </div>
                    </div>
                    <div className="p-4 space-y-2 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-smrmp-gold">{ex.category}</p>
                      <h3 className="font-display text-base font-bold text-[#2B1B12] leading-tight">{ex.title}</h3>
                      <p className="text-xs text-[#6E5445] line-clamp-2">{ex.description}</p>
                      <div className="pt-2 text-xs text-[#5C4233] space-y-1">
                        <p className="flex items-center gap-1.5">
                          <MapPinIcon className="h-3.5 w-3.5 text-smrmp-gold" />
                          {ex.hall} ({ex.roomNumber})
                        </p>
                        <p className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="h-3.5 w-3.5 text-smrmp-gold" />
                          {ex.startDate} → {ex.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-[#E2D6C5] bg-[#FAF6F0] p-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#5C4233]">
                        {ex.assignedArtifactIds?.length || 0} Artifacts
                      </span>
                      <div className="flex gap-1.5">
                        <Button variant="secondary" size="xs" onClick={() => setDetailExhibition(ex)}>
                          Details
                        </Button>
                        <Button variant="primary" size="xs" onClick={() => navigate(`/exhibitions/${ex.id}/edit`)}>
                          Edit Planner
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
        {/* TAB 3: MEDIA GALLERY */}
        {/* ========================================================================= */}
        {activeTab === 'gallery' && (
          <Card className="p-5 sm:p-7 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2D6C5] pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#2B1B12]">Exhibition Media Gallery</h2>
                <p className="text-xs text-[#6E5445]">Media items sourced directly from database exhibition records</p>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={galleryFilterExhibitionId}
                  onChange={(e) => setGalleryFilterExhibitionId(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Exhibitions' },
                    ...exhibitions.map((ex) => ({ value: ex.id, label: ex.title })),
                  ]}
                  className="w-full sm:w-60"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGalleryItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-xl border border-[#E2D6C5] bg-black cursor-pointer h-48"
                  onClick={() => setFullscreenImage(item.url)}
                >
                  <img
                    src={item.url}
                    alt={item.exhibitionTitle}
                    className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-3 flex flex-col justify-end text-white">
                    <p className="text-xs font-bold text-smrmp-gold">{item.exhibitionTitle}</p>
                    <p className="text-[10px] text-white/80">Click to view full resolution</p>
                  </div>
                </div>
              ))}
              {filteredGalleryItems.length === 0 && (
                <div className="col-span-full py-12 text-center text-xs text-[#7C4A2D]">
                  No gallery images available for the selected exhibition filter.
                </div>
              )}
            </div>
          </Card>
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
                className="h-48 w-full rounded-xl object-cover border border-[#E2D6C5]"
              />
              <div className="flex items-center justify-between">
                <Badge variant="fair">{detailExhibition.category}</Badge>
                {getStatusBadge(detailExhibition.status)}
              </div>
              <p className="text-sm text-[#5C4233] leading-relaxed">{detailExhibition.description}</p>

              <div className="grid grid-cols-2 gap-3 bg-[#FAF6F0] p-3 rounded-xl border border-[#E2D6C5]">
                <p>
                  <strong>Hall:</strong> {detailExhibition.hall} ({detailExhibition.roomNumber})
                </p>
                <p>
                  <strong>Curator:</strong> {detailExhibition.curator || 'Curatorial Team'}
                </p>
                <p>
                  <strong>Dates:</strong> {detailExhibition.startDate} → {detailExhibition.endDate}
                </p>
                <p>
                  <strong>Expected Visitors:</strong> {formatVisitorCount(detailExhibition.visitorCount)}
                </p>
              </div>

              {detailExhibition.artifacts && detailExhibition.artifacts.length > 0 && (
                <div>
                  <strong className="block mb-1 text-xs text-[#7C4A2D]">Assigned Artifacts from DB:</strong>
                  <ul className="list-disc list-inside space-y-1 text-[#5C4233]">
                    {detailExhibition.artifacts.map((a) => (
                      <li key={a.id}>
                        <span className="font-bold">{a.name}</span> ({a.category})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-[#E2D6C5] pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCodeIcon className="h-6 w-6 text-smrmp-gold" />
                  <div>
                    <p className="font-bold text-xs">Public QR Code: {detailExhibition.qrCode}</p>
                    <p className="text-[10px] text-[#7C4A2D]">Scan tag at exhibition entrance</p>
                  </div>
                </div>
                <Button
                  variant="gold"
                  size="xs"
                  onClick={() => handleCopyPublicUrl(detailExhibition.publicUrl)}
                >
                  Copy Public Link
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
              <div className="flex items-center gap-3 text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <ExclamationTriangleIcon className="h-6 w-6 shrink-0" />
                <p className="text-xs font-semibold">
                  Are you sure you want to delete "{deletingExhibition.title}"? This action cannot be undone and will delete the record from the database.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setDeletingExhibition(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={deleteExhibitionMutation.isPending}
                  onClick={() => handleDeleteExhibition(deletingExhibition.id)}
                >
                  Delete Record
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

        {/* Fullscreen Image Preview */}
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
            <img
              src={fullscreenImage}
              alt="Fullscreen preview"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            />
          </div>
        )}
      </div>
    </PrivateLayout>
  );
}
