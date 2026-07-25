import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import {
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlusIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ChartBarIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BellIcon,
  UserPlusIcon,
  BuildingOffice2Icon,
  CpuChipIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
  ChevronRightIcon,
  FolderOpenIcon,
  GlobeAltIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import useAuthStore from '../../store/authStore';
import {
  MAINTENANCE_TRANSLATIONS,
  ISSUE_CATEGORIES,
  PRIORITY_LEVELS,
  STATUS_STAGES,
  DEPARTMENTS_AND_TEAMS,
  BUILDINGS,
  INITIAL_MAINTENANCE_REQUESTS,
  ARTIFACT_DAMAGE_REPORTS,
  EQUIPMENT_ITEMS,
  FACILITY_ITEMS,
  EMERGENCY_INCIDENTS,
  EMERGENCY_CONTACTS,
  MAINTENANCE_CALENDAR_EVENTS,
  MAINTENANCE_ANALYTICS_DATA,
} from './maintenanceData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const defaultFormData = {
  title: '',
  category: 'Facility Issue',
  priority: 'Medium',
  description: '',
  building: BUILDINGS[0],
  floor: 'Ground Floor',
  room: 'Main Hall',
  hall: 'Victory Wing',
  artifactId: '',
  artifactName: '',
  equipmentId: '',
  equipmentName: '',
  attachments: [],
};

export default function MaintenanceDashboardPage() {
  const { user } = useAuthStore();
  const [lang, setLang] = useState('en');
  const t = MAINTENANCE_TRANSLATIONS[lang] || MAINTENANCE_TRANSLATIONS.en;

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Maintenance Requests State
  const [requests, setRequests] = useState(INITIAL_MAINTENANCE_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [buildingFilter, setBuildingFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState({});

  // Artifact Damage & Equipment & Facility States
  const [artifactDamageList] = useState(ARTIFACT_DAMAGE_REPORTS);
  const [equipmentList] = useState(EQUIPMENT_ITEMS);
  const [facilityList] = useState(FACILITY_ITEMS);
  const [emergencyIncidentsList, setEmergencyIncidentsList] = useState(EMERGENCY_INCIDENTS);
  const [calendarView, setCalendarView] = useState('Month'); // Day | Week | Month | Year

  // Modals State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetRequest, setAssignModalTarget] = useState(null);
  const [assignedDept, setAssignedDept] = useState(DEPARTMENTS_AND_TEAMS[0].name);
  const [assignedLead, setAssignedLead] = useState(DEPARTMENTS_AND_TEAMS[0].lead);
  const [estCompletionDate, setEstCompletionDate] = useState('2026-07-28');
  const [assignNotes, setAssignNotes] = useState('');

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [approvalDecision, setApprovalDecision] = useState('Approve'); // 'Approve' | 'Reject'
  const [approvalNotes, setApprovalNotes] = useState('');

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeTargetRequest, setCloseTargetRequest] = useState(null);
  const [closeNotes, setCloseNotes] = useState('');

  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyTitle, setEmergencyModalTitle] = useState('');
  const [emergencyType, setEmergencyType] = useState('Electrical Hazard');
  const [emergencyDesc, setEmergencyDesc] = useState('');

  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  // ---------------------------------------------------------------------------
  // KPI Calculations
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    const total = requests.length;
    const newReqs = requests.filter((r) => r.status === 'New').length;
    const pendingAppr = requests.filter((r) => r.status === 'Pending Review').length;
    const assigned = requests.filter((r) => r.status === 'Assigned').length;
    const inProgress = requests.filter((r) => r.status === 'In Progress' || r.status === 'Waiting for Parts').length;
    const completed = requests.filter((r) => r.status === 'Completed' || r.status === 'Verified' || r.status === 'Closed').length;
    const emergency = requests.filter((r) => r.isEmergency || r.priority === 'Critical').length;
    const highPriority = requests.filter((r) => r.priority === 'High').length;

    return {
      total,
      newReqs,
      pendingAppr,
      assigned,
      inProgress,
      completed,
      emergency,
      highPriority,
    };
  }, [requests]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.building && req.building.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (req.reportedBy && req.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (req.assignedTo && req.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'All' || req.category === categoryFilter;
      const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      const matchesBuilding = buildingFilter === 'All' || req.building === buildingFilter;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesBuilding;
    });
  }, [requests, searchTerm, categoryFilter, priorityFilter, statusFilter, buildingFilter]);

  // Assigned Tasks list
  const assignedTasks = useMemo(() => {
    return requests.filter((r) => r.status === 'Assigned' || r.status === 'In Progress' || r.status === 'Waiting for Parts');
  }, [requests]);

  // History list
  const repairHistoryList = useMemo(() => {
    return requests.filter((r) => r.status === 'Completed' || r.status === 'Verified' || r.status === 'Closed');
  }, [requests]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleSaveRequest = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Issue Title is required';
    if (!formData.description.trim()) errors.description = 'Detailed description is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please complete all required fields.');
      return;
    }

    if (editingRequest) {
      setRequests((prev) =>
        prev.map((r) => (r.id === editingRequest.id ? { ...r, ...formData, lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ') } : r))
      );
      toast.success(`Maintenance Request ${editingRequest.id} updated successfully!`);
      setEditingRequest(null);
    } else {
      const newId = `MNT-2026-00${requests.length + 1}`;
      const newReq = {
        id: newId,
        ...formData,
        status: 'Pending Review',
        reportedBy: user?.name ? `${user.name} (${user.role})` : 'Maintenance Officer',
        reportDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
        lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
        assignedTo: 'Unassigned',
        department: 'Pending Dispatch',
        estimatedCompletion: 'Pending',
        isEmergency: formData.priority === 'Critical',
        attachments: formData.attachments || [],
        timeline: [
          {
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            action: 'Request Submitted',
            user: user?.name || 'Maintenance Officer',
            note: 'Request created and sent for review.',
          },
        ],
        comments: [],
      };

      setRequests((prev) => [newReq, ...prev]);
      toast.success(`Maintenance Request ${newId} created successfully!`);
    }

    setFormData(defaultFormData);
    setFormErrors({});
    setActiveTab('requests');
  };

  const handleEditClick = (req) => {
    setEditingRequest(req);
    setFormData({
      title: req.title,
      category: req.category,
      priority: req.priority,
      description: req.description,
      building: req.building || BUILDINGS[0],
      floor: req.floor || 'Ground Floor',
      room: req.room || 'Main Hall',
      hall: req.hall || '',
      artifactId: req.artifactId || '',
      artifactName: req.artifactName || '',
      equipmentId: req.equipmentId || '',
      equipmentName: req.equipmentName || '',
      attachments: req.attachments || [],
    });
    setActiveTab('requests');
  };

  const handleOpenAssignModal = (req) => {
    setAssignModalTarget(req);
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!assignTargetRequest) return;
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== assignTargetRequest.id) return r;
        return {
          ...r,
          status: 'Assigned',
          assignedTo: `${assignedLead} (${assignedDept})`,
          department: assignedDept,
          estimatedCompletion: estCompletionDate,
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
          timeline: [
            ...r.timeline,
            {
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              action: 'Task Assigned',
              user: user?.name || 'Maintenance Officer',
              note: `Assigned to ${assignedDept}. Note: ${assignNotes || 'Standard priority repair work order.'}`,
            },
          ],
        };
      })
    );

    toast.success(`Assigned ${assignTargetRequest.id} to ${assignedDept}`);
    setAssignModalOpen(false);
    setAssignNotes('');
  };

  const handleOpenApprovalModal = (req, decision) => {
    setApprovalTarget(req);
    setApprovalDecision(decision);
    setApprovalModalOpen(true);
  };

  const handleConfirmApproval = () => {
    if (!approvalTarget) return;
    const newStatus = approvalDecision === 'Approve' ? 'Approved' : 'Rejected';
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== approvalTarget.id) return r;
        return {
          ...r,
          status: newStatus,
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
          timeline: [
            ...r.timeline,
            {
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              action: `Request ${newStatus}`,
              user: user?.name || 'Maintenance Officer',
              note: approvalNotes || `Maintenance Officer marked request as ${newStatus.toLowerCase()}.`,
            },
          ],
        };
      })
    );

    toast.success(`Request ${approvalTarget.id} marked as ${newStatus}`);
    setApprovalModalOpen(false);
    setApprovalNotes('');
  };

  const handleOpenCloseModal = (req) => {
    setCloseTargetRequest(req);
    setCloseModalOpen(true);
  };

  const handleConfirmCloseRequest = () => {
    if (!closeTargetRequest) return;
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== closeTargetRequest.id) return r;
        return {
          ...r,
          status: 'Closed',
          lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
          timeline: [
            ...r.timeline,
            {
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              action: 'Request Closed & Verified',
              user: user?.name || 'Maintenance Officer',
              note: closeNotes || 'Verification inspection completed. Request officially closed.',
            },
          ],
        };
      })
    );

    toast.success(`Request ${closeTargetRequest.id} successfully closed & verified!`);
    setCloseModalOpen(false);
    setCloseNotes('');
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedRequest) return;
    const newComment = {
      id: `c-${Date.now()}`,
      user: user?.name ? `${user.name} (Officer)` : 'Maintenance Officer',
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      text: commentText,
    };

    setRequests((prev) =>
      prev.map((r) => (r.id === selectedRequest.id ? { ...r, comments: [...r.comments, newComment] } : r))
    );

    setSelectedRequest((prev) => (prev ? { ...prev, comments: [...prev.comments, newComment] } : null));
    setCommentText('');
    toast.success('Comment logged');
  };

  const handleTriggerEmergencyAlert = (e) => {
    e.preventDefault();
    if (!emergencyTitle.trim()) return;

    const emgId = `EMG-2026-0${emergencyIncidentsList.length + 1}`;
    const newEmg = {
      id: emgId,
      type: emergencyType,
      title: emergencyTitle,
      severity: 'Critical',
      building: 'Main Memorial Building',
      reportedBy: user?.name || 'Maintenance Officer',
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'Active Alert',
      description: emergencyDesc || 'High priority incident logged via Maintenance Officer Control Center.',
      actionsTaken: 'Emergency notifications dispatched to Response Units.',
    };

    setEmergencyIncidentsList((prev) => [newEmg, ...prev]);
    toast.error(`EMERGENCY BROADCAST ACTIVATED: ${emgId}`);
    setEmergencyModalOpen(false);
    setEmergencyModalTitle('');
    setEmergencyDesc('');
  };

  const getPriorityBadgeVariant = (p) => {
    if (p === 'Critical') return 'danger';
    if (p === 'High') return 'warning';
    if (p === 'Medium') return 'info';
    return 'neutral';
  };

  const getStatusBadgeVariant = (s) => {
    if (s === 'Completed' || s === 'Verified' || s === 'Closed') return 'success';
    if (s === 'In Progress' || s === 'Approved' || s === 'Assigned') return 'gold';
    if (s === 'Rejected') return 'danger';
    return 'warning';
  };

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-smrmp-parchment text-[#2B1B12] p-2 sm:p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
        {/* ========================================================================= */}
        {/* HEADER & PORTAL BANNER */}
        {/* ========================================================================= */}
        <header className="rounded-3xl border border-[#D4A017]/40 bg-[#FAF0D8] p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4A017] bg-smrmp-gold px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-black">
                  <WrenchScrewdriverIcon className="h-3.5 w-3.5" />
                  {t.portal}
                </span>
                <span className="text-[11px] font-bold tracking-widest text-[#7C4A2D]">
                  ADWA VICTORY MEMORIAL MUSEUM
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#2B1B12] sm:text-4xl">
                {t.title}
              </h1>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-[#6E5445] max-w-3xl">
                {t.subtitle}
              </p>
            </div>

            {/* Language Selector & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl border border-[#D4A017]/60 bg-[#FFFDF9] p-1 text-xs font-bold shadow-2xs">
                <GlobeAltIcon className="ml-2 h-4 w-4 text-[#7C4A2D]" />
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`rounded-lg px-2.5 py-1 transition ${lang === 'en' ? 'bg-smrmp-gold font-black text-black' : 'text-[#7C4A2D] hover:bg-[#FAF0E4]'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('om')}
                  className={`rounded-lg px-2.5 py-1 transition ${lang === 'om' ? 'bg-smrmp-gold font-black text-black' : 'text-[#7C4A2D] hover:bg-[#FAF0E4]'}`}
                >
                  OM
                </button>
                <button
                  type="button"
                  onClick={() => setLang('am')}
                  className={`rounded-lg px-2.5 py-1 transition ${lang === 'am' ? 'bg-smrmp-gold font-black text-black' : 'text-[#7C4A2D] hover:bg-[#FAF0E4]'}`}
                >
                  AM
                </button>
              </div>

              <button
                type="button"
                onClick={() => setNotificationDrawerOpen(true)}
                className="relative rounded-xl border border-[#D4A017]/60 bg-[#FFFDF9] p-2 text-[#7C4A2D] hover:bg-smrmp-gold hover:text-black transition shadow-2xs"
                title="Notifications"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                  3
                </span>
              </button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => setEmergencyModalOpen(true)}
                className="animate-pulse font-extrabold shadow-sm"
              >
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>{t.quickEmergency}</span>
              </Button>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <nav aria-label="Maintenance tabs" className="mt-6 flex flex-wrap gap-1.5 border-t border-[#D4A017]/30 pt-4">
            {[
              { id: 'dashboard', label: t.dashboard, icon: ChartBarIcon },
              { id: 'artifact_damage', label: t.artifactDamage, icon: ArchiveBoxIcon },
              { id: 'equipment', label: t.equipment, icon: CpuChipIcon },
              { id: 'facility', label: t.facility, icon: BuildingOffice2Icon },
              { id: 'emergency', label: t.emergency, icon: ShieldExclamationIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'details') setSelectedRequest(null);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-smrmp-gold text-black shadow-md font-extrabold scale-[1.02]'
                      : 'bg-[#FFFDF9] text-[#5C4233] hover:bg-[#FAF0E4] hover:text-[#2B1B12] border border-[#E2D6C5]'
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
        {/* TAB 1: DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-8">
              <Card padding={false} className="p-3.5 border-t-2 border-t-smrmp-gold bg-[#FFFDF9]">
                <p className="text-[10px] font-bold text-smrmp-subtle uppercase">{t.totalRequests}</p>
                <p className="mt-1 font-display text-2xl font-black text-[#2B1B12]">{stats.total}</p>
                <p className="mt-0.5 text-[9px] font-bold text-smrmp-green">All Work Orders</p>
              </Card>

              <Card padding={false} className="p-3.5 border-t-2 border-t-blue-500 bg-[#FFFDF9]">
                <p className="text-[10px] font-bold text-smrmp-subtle uppercase">{t.newRequests}</p>
                <p className="mt-1 font-display text-2xl font-black text-blue-700">{stats.newReqs}</p>
                <p className="mt-0.5 text-[9px] font-bold text-blue-600">Fresh Submissions</p>
              </Card>

              <Card padding={false} className="p-3.5 border-t-2 border-t-purple-500 bg-[#FFFDF9]">
                <p className="text-[10px] font-bold text-smrmp-subtle uppercase">{t.pendingApproval}</p>
                <p className="mt-1 font-display text-2xl font-black text-purple-700">{stats.pendingAppr}</p>
                <p className="mt-0.5 text-[9px] font-bold text-purple-600">Needs Review</p>
              </Card>

              <Card padding={false} className="p-3.5 border-t-2 border-t-indigo-500 bg-[#FFFDF9]">
                <p className="text-[10px] font-bold text-smrmp-subtle uppercase">{t.assignedRequests}</p>
                <p className="mt-1 font-display text-2xl font-black text-indigo-700">{stats.assigned}</p>
                <p className="mt-0.5 text-[9px] font-bold text-indigo-600">Dispatched Teams</p>
              </Card>

              <Card padding={false} className="p-3.5 border-t-2 border-t-amber-500 bg-[#FFFDF9]">
                <p className="text-[10px] font-bold text-smrmp-subtle uppercase">{t.inProgress}</p>
                <p className="mt-1 font-display text-2xl font-black text-amber-700">{stats.inProgress}</p>
                <p className="mt-0.5 text-[9px] font-bold text-amber-600">Under Repair</p>
              </Card>

              <Card padding={false} className="p-3.5 border-t-2 border-t-emerald-500 bg-[#FFFDF9]">
                <p className="text-[10px] font-bold text-smrmp-subtle uppercase">{t.completedRepairs}</p>
                <p className="mt-1 font-display text-2xl font-black text-emerald-700">{stats.completed}</p>
                <p className="mt-0.5 text-[9px] font-bold text-emerald-600">Verified & Resolved</p>
              </Card>

              <Card padding={false} className="p-3.5 border-t-2 border-t-rose-600 bg-[#FFFDF9]">
                <p className="text-[10px] font-bold text-smrmp-subtle uppercase">{t.emergencyRequests}</p>
                <p className="mt-1 font-display text-2xl font-black text-rose-700">{stats.emergency}</p>
                <p className="mt-0.5 text-[9px] font-bold text-rose-600">Immediate Action</p>
              </Card>

              <Card padding={false} className="p-3.5 border-t-2 border-t-amber-600 bg-[#FFFDF9]">
                <p className="text-[10px] font-bold text-smrmp-subtle uppercase">{t.highPriority}</p>
                <p className="mt-1 font-display text-2xl font-black text-amber-800">{stats.highPriority}</p>
                <p className="mt-0.5 text-[9px] font-bold text-amber-700">Urgent Attention</p>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="p-5 lg:col-span-2 bg-[#FFFDF9]">
                <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-3 mb-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2B1B12]">Monthly Requests & Completion Rate</h3>
                    <p className="text-xs text-[#6E5445]">Work orders submitted vs successfully completed repairs</p>
                  </div>
                  <Badge variant="gold">2026 Analytics</Badge>
                </div>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: MAINTENANCE_ANALYTICS_DATA.monthlyRequests.map((d) => d.month),
                      datasets: [
                        {
                          label: 'Requests Submitted',
                          data: MAINTENANCE_ANALYTICS_DATA.monthlyRequests.map((d) => d.requests),
                          backgroundColor: '#7C4A2D',
                        },
                        {
                          label: 'Completed Repairs',
                          data: MAINTENANCE_ANALYTICS_DATA.monthlyRequests.map((d) => d.completed),
                          backgroundColor: '#D4A017',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } },
                    }}
                  />
                </div>
              </Card>

              <Card className="p-5 bg-[#FFFDF9]">
                <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-3 mb-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2B1B12]">Request Categories</h3>
                    <p className="text-xs text-[#6E5445]">Volume breakdown by issue type</p>
                  </div>
                  <Badge variant="info">Category Share</Badge>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: MAINTENANCE_ANALYTICS_DATA.categoryBreakdown.map((d) => d.category),
                      datasets: [
                        {
                          data: MAINTENANCE_ANALYTICS_DATA.categoryBreakdown.map((d) => d.count),
                          backgroundColor: ['#7C4A2D', '#D4A017', '#374B07', '#1A4568', '#5B21B6', '#92400E'],
                          borderColor: '#FFFDF9',
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
                    }}
                  />
                </div>
              </Card>
            </div>

            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Quick Actions */}
              <Card className="p-5 bg-[#FAF6F0]">
                <h3 className="font-display text-base font-bold text-[#2B1B12] mb-3">Quick Actions</h3>
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('artifact_damage')}
                    className="flex w-full items-center justify-between rounded-xl border border-[#D4A017]/40 bg-[#FFFDF9] p-3 text-left transition hover:bg-[#FAF0D8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF0D8] text-smrmp-brown">
                        <ArchiveBoxIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2B1B12]">Artifact Damage</p>
                        <p className="text-[10px] text-[#6E5445]">Inspect artifact repairs and conditions</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-[#7C4A2D]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('equipment')}
                    className="flex w-full items-center justify-between rounded-xl border border-[#D4A017]/40 bg-[#FFFDF9] p-3 text-left transition hover:bg-[#FAF0D8]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-900">
                        <CpuChipIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2B1B12]">Equipment Issues</p>
                        <p className="text-[10px] text-[#6E5445]">Monitor hardware, HVAC and projectors</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-[#7C4A2D]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('emergency')}
                    className="flex w-full items-center justify-between rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-left transition hover:bg-rose-100/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 text-white">
                        <ShieldExclamationIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-rose-900">View Emergency Cases</p>
                        <p className="text-[10px] text-rose-700">Urgent hazards, fire, leaks, security</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-rose-700" />
                  </button>
                </div>
              </Card>

              {/* Recently Submitted Requests */}
              <Card className="p-5 lg:col-span-2 bg-[#FFFDF9]">
                <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-3 mb-3">
                  <h3 className="font-display text-base font-bold text-[#2B1B12]">Recently Submitted Requests</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('facility')}
                    className="text-xs font-bold text-[#7C4A2D] hover:underline"
                  >
                    View Facility →
                  </button>
                </div>
                <div className="divide-y divide-[#E2D6C5]">
                  {requests.slice(0, 4).map((req) => (
                    <div key={req.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#7C4A2D]">{req.id}</span>
                          <Badge variant={getPriorityBadgeVariant(req.priority)} size="sm">
                            {req.priority}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(req.status)} size="sm">
                            {req.status}
                          </Badge>
                        </div>
                        <p className="truncate text-xs font-bold text-[#2B1B12] mt-1">{req.title}</p>
                        <p className="text-[11px] text-[#6E5445] truncate">
                          {req.building} • {req.reportedBy}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => {
                          setSelectedRequest(req);
                          setActiveTab('details');
                        }}
                      >
                        Inspect
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REQUEST LIST */}
        {/* ========================================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <Card className="p-4 bg-[#FFFDF9]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Search input */}
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#7C4A2D]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search request ID, title, building, reporter or assigned technician..."
                    className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] pl-9 pr-4 py-2 text-xs font-semibold text-[#2B1B12] focus:border-smrmp-gold focus:outline-none"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12]"
                  >
                    <option value="All">All Categories</option>
                    {ISSUE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12]"
                  >
                    <option value="All">All Priorities</option>
                    {PRIORITY_LEVELS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12]"
                  >
                    <option value="All">All Statuses</option>
                    {STATUS_STAGES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-smrmp-gold text-black' : 'text-[#7C4A2D]'}`}
                      title="Table View"
                    >
                      <TableCellsIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-smrmp-gold text-black' : 'text-[#7C4A2D]'}`}
                      title="Grid View"
                    >
                      <Squares2X2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* List Content */}
            {viewMode === 'table' ? (
              <Card padding={false} className="overflow-hidden bg-[#FFFDF9]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E2D6C5] bg-[#FAF6F0] font-display text-[11px] font-bold uppercase tracking-wider text-[#7C4A2D]">
                      <tr>
                        <th className="px-4 py-3">Request ID</th>
                        <th className="px-4 py-3">Issue Title</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Reported By</th>
                        <th className="px-4 py-3">Assigned To</th>
                        <th className="px-4 py-3">Report Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2D6C5]">
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-[#FAF0E4]/60 transition">
                          <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-[#7C4A2D]">
                            {req.id}
                          </td>
                          <td className="px-4 py-3 font-bold text-[#2B1B12] max-w-xs truncate">
                            {req.title}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#5C4233]">
                            {req.category}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <Badge variant={getPriorityBadgeVariant(req.priority)} size="sm">
                              {req.priority}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <Badge variant={getStatusBadgeVariant(req.status)} size="sm">
                              {req.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-[#5C4233] max-w-xs truncate">
                            {req.reportedBy}
                          </td>
                          <td className="px-4 py-3 text-[#5C4233] max-w-xs truncate">
                            {req.assignedTo}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[#7C6657]">
                            {req.reportDate}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setActiveTab('details');
                                }}
                                className="rounded-lg p-1.5 text-[#7C4A2D] hover:bg-smrmp-gold hover:text-black transition"
                                title="View Details"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditClick(req)}
                                className="rounded-lg p-1.5 text-[#7C4A2D] hover:bg-smrmp-gold hover:text-black transition"
                                title="Edit Request"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenApprovalModal(req, 'Approve')}
                                className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100 transition"
                                title="Approve Request"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(req)}
                                className="rounded-lg p-1.5 text-indigo-700 hover:bg-indigo-100 transition"
                                title="Assign Technician"
                              >
                                <UserPlusIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredRequests.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-xs font-semibold text-[#7C6657]">
                            No maintenance requests match the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRequests.map((req) => (
                  <Card key={req.id} className="p-4 bg-[#FFFDF9] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#7C4A2D]">{req.id}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant={getPriorityBadgeVariant(req.priority)} size="sm">
                            {req.priority}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(req.status)} size="sm">
                            {req.status}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="mt-2 font-display text-sm font-bold text-[#2B1B12]">{req.title}</h4>
                      <p className="mt-1 text-xs text-[#6E5445] line-clamp-2">{req.description}</p>
                      <div className="mt-3 text-[11px] text-[#5C4233] space-y-1 bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E2D6C5]">
                        <p><strong>Building:</strong> {req.building} ({req.room})</p>
                        <p><strong>Assigned:</strong> {req.assignedTo}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E2D6C5]">
                      <span className="text-[10px] text-[#7C6657]">{req.reportDate}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => {
                            setSelectedRequest(req);
                            setActiveTab('details');
                          }}
                        >
                          Details
                        </Button>
                        <Button variant="gold" size="xs" onClick={() => handleOpenAssignModal(req)}>
                          Assign
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
        {/* TAB 3: CREATE / EDIT REQUEST */}
        {/* ========================================================================= */}
        {activeTab === 'create' && (
          <Card className="p-6 bg-[#FFFDF9] max-w-4xl mx-auto space-y-6">
            <div className="border-b border-[#E2D6C5] pb-4">
              <h2 className="font-display text-xl font-bold text-[#2B1B12]">
                {editingRequest ? `Edit Maintenance Request (${editingRequest.id})` : 'Create Maintenance Request'}
              </h2>
              <p className="text-xs text-[#6E5445]">
                Submit detailed maintenance report for artifact damage, facility defect, equipment failure or security hazard.
              </p>
            </div>

            <form onSubmit={handleSaveRequest} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Issue Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Water Leakage near Vault Display Case #4"
                  error={formErrors.title}
                />

                <Select
                  label="Issue Category *"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={ISSUE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                />

                <Select
                  label="Priority Level *"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  options={PRIORITY_LEVELS.map((p) => ({ value: p.value, label: p.label }))}
                />

                <Select
                  label="Building *"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  options={BUILDINGS.map((b) => ({ value: b, label: b }))}
                />

                <Input
                  label="Floor"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g. Ground Floor / Basement 1"
                />

                <Input
                  label="Room / Hall"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="e.g. Gallery A - Display Room 2"
                />

                <Input
                  label="Artifact ID (Optional)"
                  value={formData.artifactId}
                  onChange={(e) => setFormData({ ...formData, artifactId: e.target.value })}
                  placeholder="e.g. ART-FCY7WO1C"
                />

                <Input
                  label="Equipment ID (Optional)"
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                  placeholder="e.g. EQP-HVAC-02"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1B12] mb-1">
                  Issue Description & Diagnostic Details *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe observed damage, symptoms, risks to museum artifacts or visitors..."
                  className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-3 text-xs font-semibold text-[#2B1B12] focus:border-smrmp-gold focus:outline-none"
                />
                {formErrors.description && <p className="mt-1 text-xs text-rose-600 font-bold">{formErrors.description}</p>}
              </div>

              {/* Attachments Section */}
              <div className="rounded-2xl border border-dashed border-[#D4A017] bg-[#FAF0D8]/40 p-4 text-center">
                <PaperClipIcon className="mx-auto h-8 w-8 text-[#7C4A2D]" />
                <p className="mt-2 text-xs font-bold text-[#2B1B12]">Upload Inspection Media & Attachments</p>
                <p className="text-[10px] text-[#6E5445]">Supports photos (PNG, JPG), Videos (MP4) and PDF reports up to 25MB.</p>
                <input
                  type="file"
                  multiple
                  className="mt-3 text-xs text-[#7C4A2D] file:mr-2 file:rounded-xl file:border-0 file:bg-smrmp-gold file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-black hover:file:bg-amber-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2D6C5]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setFormData(defaultFormData);
                    setActiveTab('requests');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gold">
                  {editingRequest ? 'Update Request' : 'Submit Maintenance Request'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REQUEST DETAILS VIEW */}
        {/* ========================================================================= */}
        {activeTab === 'details' && selectedRequest && (
          <div className="space-y-6">
            <Card className="p-6 bg-[#FFFDF9] space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2D6C5] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#7C4A2D]">{selectedRequest.id}</span>
                    <Badge variant={getPriorityBadgeVariant(selectedRequest.priority)}>
                      {selectedRequest.priority} Priority
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-bold text-[#2B1B12]">{selectedRequest.title}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleOpenApprovalModal(selectedRequest, 'Approve')}>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Approve</span>
                  </Button>
                  <Button variant="gold" size="sm" onClick={() => handleOpenAssignModal(selectedRequest)}>
                    <UserPlusIcon className="h-4 w-4" />
                    <span>Assign Technician</span>
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleOpenCloseModal(selectedRequest)}>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Verify & Close</span>
                  </Button>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 bg-[#FAF6F0] p-4 rounded-2xl border border-[#E2D6C5] text-xs">
                <div>
                  <p className="text-[#7C6657] font-semibold">Reported By:</p>
                  <p className="font-bold text-[#2B1B12] mt-0.5">{selectedRequest.reportedBy}</p>
                </div>
                <div>
                  <p className="text-[#7C6657] font-semibold">Assigned Technician:</p>
                  <p className="font-bold text-[#2B1B12] mt-0.5">{selectedRequest.assignedTo}</p>
                </div>
                <div>
                  <p className="text-[#7C6657] font-semibold">Location:</p>
                  <p className="font-bold text-[#2B1B12] mt-0.5">{selectedRequest.building} ({selectedRequest.room})</p>
                </div>
                <div>
                  <p className="text-[#7C6657] font-semibold">Report Date / Updated:</p>
                  <p className="font-bold text-[#2B1B12] mt-0.5">{selectedRequest.reportDate}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-display text-sm font-bold text-[#2B1B12] mb-1">Issue Description</h3>
                <p className="text-xs text-[#5C4233] leading-relaxed bg-[#FAF6F0] p-4 rounded-xl border border-[#E2D6C5]">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Attachments / Media Gallery */}
              {selectedRequest.attachments?.length > 0 && (
                <div>
                  <h3 className="font-display text-sm font-bold text-[#2B1B12] mb-2">Attached Inspection Photos & Media</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedRequest.attachments.map((att) => (
                      <div key={att.id} className="relative overflow-hidden rounded-xl border border-[#E2D6C5] bg-white p-2">
                        {att.type === 'image' ? (
                          <img src={att.url} alt={att.name} className="h-28 w-40 object-cover rounded-lg" />
                        ) : (
                          <div className="flex h-28 w-40 flex-col items-center justify-center bg-[#FAF0D8] p-2 text-center text-xs font-bold text-[#7C4A2D]">
                            <PaperClipIcon className="h-6 w-6" />
                            <span className="truncate w-full">{att.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow Timeline */}
              <div>
                <h3 className="font-display text-sm font-bold text-[#2B1B12] mb-3">Workflow Timeline</h3>
                <div className="space-y-3 border-l-2 border-smrmp-gold pl-4 ml-2">
                  {selectedRequest.timeline?.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-smrmp-gold ring-4 ring-[#FFFDF9]" />
                      <p className="text-xs font-bold text-[#2B1B12]">{step.action} — <span className="text-[#7C4A2D]">{step.user}</span></p>
                      <p className="text-[11px] text-[#6E5445]">{step.note}</p>
                      <p className="text-[10px] text-[#7C6657] mt-0.5">{step.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-[#E2D6C5] pt-4 space-y-3">
                <h3 className="font-display text-sm font-bold text-[#2B1B12]">Officer Comments & Work Log</h3>
                <div className="space-y-2">
                  {selectedRequest.comments?.map((c) => (
                    <div key={c.id} className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E2D6C5] text-xs">
                      <div className="flex justify-between font-bold text-[#7C4A2D]">
                        <span>{c.user}</span>
                        <span className="text-[10px] text-[#7C6657]">{c.date}</span>
                      </div>
                      <p className="mt-1 text-[#2B1B12]">{c.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add work log comment..."
                    className="flex-1 rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#2B1B12] focus:border-smrmp-gold focus:outline-none"
                  />
                  <Button type="submit" variant="gold" size="sm">
                    Log Comment
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ASSIGNED TASKS */}
        {/* ========================================================================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <Card className="p-4 bg-[#FFFDF9] flex justify-between items-center">
              <div>
                <h2 className="font-display text-lg font-bold text-[#2B1B12]">Assigned Maintenance Tasks</h2>
                <p className="text-xs text-[#6E5445]">Monitor task dispatches across specialist technician teams.</p>
              </div>
              <Badge variant="gold">{assignedTasks.length} Dispatched Tasks</Badge>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assignedTasks.map((task) => (
                <Card key={task.id} className="p-4 bg-[#FFFDF9] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#7C4A2D]">{task.id}</span>
                    <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
                      {task.status}
                    </Badge>
                  </div>
                  <h4 className="font-display text-sm font-bold text-[#2B1B12]">{task.title}</h4>
                  <div className="text-xs text-[#5C4233] bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E2D6C5] space-y-1">
                    <p><strong>Department:</strong> {task.department}</p>
                    <p><strong>Technician:</strong> {task.assignedTo}</p>
                    <p><strong>Est. Completion:</strong> {task.estimatedCompletion}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="xs"
                      className="flex-1"
                      onClick={() => {
                        setSelectedRequest(task);
                        setActiveTab('details');
                      }}
                    >
                      Inspect Task
                    </Button>
                    <Button
                      variant="gold"
                      size="xs"
                      onClick={() => handleOpenCloseModal(task)}
                    >
                      Complete Work
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ARTIFACT DAMAGE MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'artifact_damage' && (
          <div className="space-y-4">
            <Card className="p-4 bg-[#FFFDF9] flex justify-between items-center">
              <div>
                <h2 className="font-display text-lg font-bold text-[#2B1B12]">Artifact Damage Reports</h2>
                <p className="text-xs text-[#6E5445]">Specialized condition reports and conservation repair recommendations.</p>
              </div>
              <Badge variant="warning">{artifactDamageList.length} Damage Reports</Badge>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {artifactDamageList.map((adm) => (
                <Card key={adm.id} className="p-5 bg-[#FFFDF9] space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-2">
                      <span className="font-mono text-xs font-bold text-[#7C4A2D]">{adm.id}</span>
                      <Badge variant={adm.severity === 'High' ? 'danger' : 'warning'} size="sm">
                        Severity: {adm.severity}
                      </Badge>
                    </div>

                    <h4 className="mt-3 font-display text-base font-bold text-[#2B1B12]">{adm.artifactName}</h4>
                    <p className="text-xs text-[#7C4A2D] font-mono">{adm.artifactId} • {adm.category}</p>

                    <div className="mt-3 text-xs bg-[#FAF6F0] p-3 rounded-xl border border-[#E2D6C5] space-y-1.5">
                      <p><strong>Damage Type:</strong> {adm.damageType}</p>
                      <p><strong>Location:</strong> {adm.location}</p>
                      <p><strong>Inspection Notes:</strong> {adm.inspectionNotes}</p>
                      <p><strong>Recommendation:</strong> {adm.repairRecommendation}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-[#E2D6C5]">
                    <span className="text-[11px] font-bold text-amber-800">{adm.status}</span>
                    <Button variant="gold" size="xs" onClick={() => setActiveTab('requests')}>
                      View Work Orders
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: EQUIPMENT ISSUES */}
        {/* ========================================================================= */}
        {activeTab === 'equipment' && (
          <div className="space-y-4">
            <Card className="p-4 bg-[#FFFDF9] flex justify-between items-center">
              <div>
                <h2 className="font-display text-lg font-bold text-[#2B1B12]">Equipment Maintenance Inventory</h2>
                <p className="text-xs text-[#6E5445]">Track computers, projectors, audio guides, servers, and display screens.</p>
              </div>
              <Badge variant="gold">{equipmentList.length} Equipment Assets</Badge>
            </Card>

            <Card padding={false} className="overflow-hidden bg-[#FFFDF9]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E2D6C5] bg-[#FAF6F0] font-display text-[11px] font-bold uppercase tracking-wider text-[#7C4A2D]">
                  <tr>
                    <th className="px-4 py-3">Asset ID</th>
                    <th className="px-4 py-3">Equipment Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Service</th>
                    <th className="px-4 py-3">Next Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D6C5]">
                  {equipmentList.map((eq) => (
                    <tr key={eq.id} className="hover:bg-[#FAF0E4]/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-[#7C4A2D]">{eq.id}</td>
                      <td className="px-4 py-3 font-bold text-[#2B1B12]">{eq.name}</td>
                      <td className="px-4 py-3 text-[#5C4233]">{eq.category}</td>
                      <td className="px-4 py-3 text-[#5C4233]">{eq.location}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={eq.status === 'Operational' ? 'success' : eq.status === 'Under Maintenance' ? 'warning' : 'danger'}
                          size="sm"
                        >
                          {eq.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[#7C6657]">{eq.lastService}</td>
                      <td className="px-4 py-3 font-bold text-[#7C4A2D]">{eq.nextService}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: FACILITY ISSUES */}
        {/* ========================================================================= */}
        {activeTab === 'facility' && (
          <div className="space-y-4">
            <Card className="p-4 bg-[#FFFDF9] flex justify-between items-center">
              <div>
                <h2 className="font-display text-lg font-bold text-[#2B1B12]">Facility Infrastructure Status</h2>
                <p className="text-xs text-[#6E5445]">Building systems: Lighting, HVAC, Doors, Plumbing, Electrical, Roof.</p>
              </div>
              <Badge variant="gold">{facilityList.length} Building Systems</Badge>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {facilityList.map((fac) => (
                <Card key={fac.id} className="p-4 bg-[#FFFDF9] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-[#7C4A2D]">{fac.id}</span>
                    <Badge variant={fac.condition === 'Excellent' || fac.condition === 'Good' ? 'success' : 'warning'} size="sm">
                      {fac.condition}
                    </Badge>
                  </div>
                  <h4 className="font-display text-sm font-bold text-[#2B1B12]">{fac.system}</h4>
                  <p className="text-xs text-[#6E5445]">{fac.location}</p>
                  <p className="text-[11px] text-[#5C4233] bg-[#FAF6F0] p-2 rounded-xl border border-[#E2D6C5]">{fac.notes}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: EMERGENCY INCIDENTS */}
        {/* ========================================================================= */}
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            <Card className="p-5 bg-rose-50 border-rose-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
                  <ShieldExclamationIcon className="h-5 w-5 animate-bounce" />
                  <span>EMERGENCY INCIDENT CONTROL CENTER</span>
                </div>
                <p className="text-xs text-rose-700 mt-1">
                  Active hazards, fire warnings, water leaks, security breaches, or artifact theft alerts.
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setEmergencyModalOpen(true)}>
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>Broadcast Emergency Alert</span>
              </Button>
            </Card>

            {/* Emergency Contacts Table */}
            <Card className="p-5 bg-[#FFFDF9] space-y-3">
              <h3 className="font-display text-base font-bold text-[#2B1B12]">Museum Emergency Contacts</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {EMERGENCY_CONTACTS.map((c, idx) => (
                  <div key={idx} className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E2D6C5] text-xs">
                    <p className="font-bold text-[#2B1B12]">{c.name}</p>
                    <p className="text-[10px] text-[#7C4A2D] font-semibold">{c.role}</p>
                    <p className="mt-1 font-mono font-bold text-[#2B1B12] flex items-center gap-1">
                      <PhoneIcon className="h-3.5 w-3.5 text-rose-600" />
                      {c.phone}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Incidents List */}
            <div className="space-y-3">
              <h3 className="font-display text-base font-bold text-[#2B1B12]">Recent Emergency Incidents</h3>
              {emergencyIncidentsList.map((emg) => (
                <Card key={emg.id} className="p-4 bg-[#FFFDF9] border-l-4 border-l-rose-600">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-rose-800">{emg.id} • {emg.type}</span>
                    <Badge variant={emg.status === 'Resolved' ? 'success' : 'danger'}>{emg.status}</Badge>
                  </div>
                  <h4 className="mt-1 font-display text-sm font-bold text-[#2B1B12]">{emg.title}</h4>
                  <p className="text-xs text-[#5C4233] mt-1">{emg.description}</p>
                  <p className="text-xs font-bold text-emerald-800 mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    Actions Taken: {emg.actionsTaken}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 10: MAINTENANCE CALENDAR */}
        {/* ========================================================================= */}
        {activeTab === 'calendar' && (
          <Card className="p-6 bg-[#FFFDF9] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2D6C5] pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#2B1B12]">Maintenance Schedule & Calendar</h2>
                <p className="text-xs text-[#6E5445]">Scheduled inspections, filter replacements, and maintenance deadlines.</p>
              </div>

              <div className="flex items-center rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-1 text-xs font-bold">
                {['Day', 'Week', 'Month', 'Year'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCalendarView(v)}
                    className={`rounded-lg px-3 py-1 transition ${calendarView === v ? 'bg-smrmp-gold text-black font-extrabold' : 'text-[#7C4A2D] hover:bg-[#FAF0E4]'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {MAINTENANCE_CALENDAR_EVENTS.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between p-4 rounded-xl border border-[#E2D6C5] bg-[#FAF6F0]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-12 flex-col items-center justify-center rounded-lg bg-smrmp-gold text-black font-extrabold text-xs">
                      <span>{ev.date.slice(8)}</span>
                      <span className="text-[9px] uppercase">JUL</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2B1B12]">{ev.title}</p>
                      <p className="text-[11px] text-[#7C4A2D]">{ev.department} • {ev.type}</p>
                    </div>
                  </div>
                  <Badge variant={ev.priority === 'Critical' ? 'danger' : 'gold'}>{ev.priority}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* TAB 11: REPAIR HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <Card padding={false} className="overflow-hidden bg-[#FFFDF9]">
            <div className="p-4 border-b border-[#E2D6C5] bg-[#FAF6F0]">
              <h2 className="font-display text-base font-bold text-[#2B1B12]">Completed & Verified Repair Logs</h2>
              <p className="text-xs text-[#6E5445]">Archived record of all closed maintenance work orders.</p>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2D6C5] bg-[#FAF6F0] font-display text-[11px] font-bold uppercase tracking-wider text-[#7C4A2D]">
                <tr>
                  <th className="px-4 py-3">Work Order ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Building</th>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3">Closed Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D6C5]">
                {repairHistoryList.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF0E4]/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-[#7C4A2D]">{r.id}</td>
                    <td className="px-4 py-3 font-bold text-[#2B1B12]">{r.title}</td>
                    <td className="px-4 py-3 text-[#5C4233]">{r.building}</td>
                    <td className="px-4 py-3 text-[#5C4233]">{r.assignedTo}</td>
                    <td className="px-4 py-3 text-[#7C6657]">{r.lastUpdated}</td>
                    <td className="px-4 py-3">
                      <Badge variant="success" size="sm">{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* TAB 12: REPORTS & ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === 'reports' && (
          <Card className="p-6 bg-[#FFFDF9] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2D6C5] pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#2B1B12]">Maintenance Reports & Analytics</h2>
                <p className="text-xs text-[#6E5445]">Generate PDF/Excel reports for executive leadership and museum board.</p>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => window.print()}>
                  <PrinterIcon className="h-4 w-4" />
                  <span>Print</span>
                </Button>
                <Button variant="gold" size="sm" onClick={() => toast.success('Report exported to Excel (.xlsx)')}>
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Export Excel</span>
                </Button>
              </div>
            </div>

            {/* Reports Catalog Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Monthly Maintenance Overview', desc: 'Summary of work orders, completion times, and costs.', type: 'Monthly' },
                { title: 'Artifact Repair & Conservation Log', desc: 'Detailed damage reports for museum artifact collection.', type: 'Artifact' },
                { title: 'Equipment Asset Health Report', desc: 'Service intervals for HVAC, servers, projectors, scanners.', type: 'Equipment' },
                { title: 'Facility Infrastructure Report', desc: 'Condition report for roof, doors, plumbing, electrical.', type: 'Facility' },
                { title: 'Emergency Incident Audit Report', desc: 'Logs of hazards, security alerts, and fire drills.', type: 'Emergency' },
                { title: 'Technician Performance Summary', desc: 'Assigned vs completed tasks and resolution efficiency.', type: 'Performance' },
              ].map((rep, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] space-y-2">
                  <Badge variant="gold" size="sm">{rep.type}</Badge>
                  <h4 className="font-display text-sm font-bold text-[#2B1B12]">{rep.title}</h4>
                  <p className="text-xs text-[#6E5445]">{rep.desc}</p>
                  <Button
                    variant="secondary"
                    size="xs"
                    className="w-full mt-2"
                    onClick={() => toast.success(`Generated ${rep.title}`)}
                  >
                    Generate Report
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: ASSIGN TECHNICIAN MODAL */}
        {/* ========================================================================= */}
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Technician / Department (${assignTargetRequest?.id || ''})`}
        >
          <div className="space-y-4 text-xs">
            <p className="font-semibold text-[#6E5445]">
              Select specialist team and target completion date for: <strong>{assignTargetRequest?.title}</strong>
            </p>

            <Select
              label="Assigned Team / Department *"
              value={assignedDept}
              onChange={(e) => {
                setAssignedDept(e.target.value);
                const deptObj = DEPARTMENTS_AND_TEAMS.find((d) => d.name === e.target.value);
                if (deptObj) setAssignedLead(deptObj.lead);
              }}
              options={DEPARTMENTS_AND_TEAMS.map((d) => ({ value: d.name, label: `${d.name} (${d.lead})` }))}
            />

            <Input
              label="Estimated Completion Date *"
              type="date"
              value={estCompletionDate}
              onChange={(e) => setEstCompletionDate(e.target.value)}
            />

            <div>
              <label className="block text-xs font-bold text-[#2B1B12] mb-1">Dispatch Instructions</label>
              <textarea
                rows={3}
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                placeholder="Specific instructions for technician team..."
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-2.5 text-xs text-[#2B1B12]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={handleConfirmAssign}>
                Confirm Dispatch
              </Button>
            </div>
          </div>
        </Modal>

        {/* ========================================================================= */}
        {/* MODAL 2: APPROVAL MODAL */}
        {/* ========================================================================= */}
        <Modal
          isOpen={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
          title={`Officer Review (${approvalTarget?.id || ''})`}
        >
          <div className="space-y-4 text-xs">
            <p className="font-semibold text-[#6E5445]">
              Set approval decision for: <strong>{approvalTarget?.title}</strong>
            </p>

            <Select
              label="Decision *"
              value={approvalDecision}
              onChange={(e) => setApprovalDecision(e.target.value)}
              options={[
                { value: 'Approve', label: 'Approve Request' },
                { value: 'Reject', label: 'Reject Request' },
              ]}
            />

            <div>
              <label className="block text-xs font-bold text-[#2B1B12] mb-1">Reviewer Notes</label>
              <textarea
                rows={3}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Reasoning or notes..."
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-2.5 text-xs text-[#2B1B12]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setApprovalModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={handleConfirmApproval}>
                Submit Decision
              </Button>
            </div>
          </div>
        </Modal>

        {/* ========================================================================= */}
        {/* MODAL 3: VERIFY & CLOSE MODAL */}
        {/* ========================================================================= */}
        <Modal
          isOpen={closeModalOpen}
          onClose={() => setCloseModalOpen(false)}
          title={`Verify & Close Request (${closeTargetRequest?.id || ''})`}
        >
          <div className="space-y-4 text-xs">
            <p className="font-semibold text-[#6E5445]">
              Verify repair quality and close work order for: <strong>{closeTargetRequest?.title}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-[#2B1B12] mb-1">Verification Inspection Notes</label>
              <textarea
                rows={3}
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                placeholder="Confirm repair test results and artifact safety..."
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-2.5 text-xs text-[#2B1B12]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setCloseModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={handleConfirmCloseRequest}>
                Verify & Close
              </Button>
            </div>
          </div>
        </Modal>

        {/* ========================================================================= */}
        {/* MODAL 4: EMERGENCY ALERT MODAL */}
        {/* ========================================================================= */}
        <Modal
          isOpen={emergencyModalOpen}
          onClose={() => setEmergencyModalOpen(false)}
          title="Broadcast Museum Emergency Alert"
        >
          <form onSubmit={handleTriggerEmergencyAlert} className="space-y-4 text-xs">
            <Input
              label="Emergency Title *"
              value={emergencyTitle}
              onChange={(e) => setEmergencyModalTitle(e.target.value)}
              placeholder="e.g. Substation Arcing / Main Vault Water Leak"
            />

            <Select
              label="Hazard Type *"
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              options={[
                { value: 'Fire Incident', label: 'Fire Incident' },
                { value: 'Flood / Leak', label: 'Flood / Water Leakage' },
                { value: 'Electrical Hazard', label: 'Electrical Hazard' },
                { value: 'Broken Display Case', label: 'Broken Display Case' },
                { value: 'Security Breach', label: 'Security Breach' },
                { value: 'Artifact Theft', label: 'Artifact Theft' },
              ]}
            />

            <div>
              <label className="block text-xs font-bold text-[#2B1B12] mb-1">Incident Summary</label>
              <textarea
                rows={3}
                value={emergencyDesc}
                onChange={(e) => setEmergencyDesc(e.target.value)}
                placeholder="Immediate risk summary..."
                className="w-full rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-2.5 text-xs text-[#2B1B12]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setEmergencyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm">
                Broadcast Alert Now
              </Button>
            </div>
          </form>
        </Modal>

        {/* ========================================================================= */}
        {/* MODAL 5: NOTIFICATIONS DRAWER */}
        {/* ========================================================================= */}
        <Modal
          isOpen={notificationDrawerOpen}
          onClose={() => setNotificationDrawerOpen(false)}
          title="Maintenance Officer Notifications"
        >
          <div className="space-y-3 text-xs">
            {[
              { title: 'New Critical Request', desc: 'Humidity fluctuation in Vault Room B-04', time: '10m ago', urgent: true },
              { title: 'High Priority Task Dispatched', desc: 'Display case glass fracture assigned to Building Team', time: '1h ago', urgent: false },
              { title: 'Repair Verified', desc: 'Restroom B2 pipe leakage closed', time: '3h ago', urgent: false },
            ].map((n, idx) => (
              <div key={idx} className={`p-3 rounded-xl border ${n.urgent ? 'bg-rose-50 border-rose-300' : 'bg-[#FAF6F0] border-[#E2D6C5]'}`}>
                <div className="flex justify-between font-bold">
                  <span className={n.urgent ? 'text-rose-900' : 'text-[#2B1B12]'}>{n.title}</span>
                  <span className="text-[10px] text-[#7C6657]">{n.time}</span>
                </div>
                <p className="mt-1 text-[11px] text-[#5C4233]">{n.desc}</p>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    </div>
    </PrivateLayout>
  );
}
