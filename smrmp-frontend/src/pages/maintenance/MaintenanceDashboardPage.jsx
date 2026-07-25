import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { MAINTENANCE_TRANSLATIONS } from './maintenanceData';
import { getPriorityBadgeVariant, getStatusBadgeVariant } from './maintenanceUtils';
import { useMaintenanceDashboard } from '../../hooks/useMaintenance';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const t = MAINTENANCE_TRANSLATIONS.en;

export default function MaintenanceDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useMaintenanceDashboard();

  const stats = data?.stats || {};
  const recentRequests = data?.recent_requests || [];
  const assignedTasks = data?.assigned_tasks || [];
  const analytics = data?.analytics || { monthly_requests: [], category_breakdown: [] };

  if (isLoading) {
    return (
      <PrivateLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PrivateLayout>
    );
  }

  if (isError) {
    return (
      <PrivateLayout>
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="font-display text-lg font-bold text-rose-900">Failed to load maintenance dashboard</p>
          <p className="mt-2 text-sm text-rose-700">{error?.response?.data?.message || error.message}</p>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-smrmp-parchment p-2 text-[#2B1B12] sm:p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="rounded-3xl border border-[#D4A017]/40 bg-[#FAF0D8] p-6 shadow-sm">
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
              <p className="mt-1 max-w-3xl text-xs font-semibold leading-relaxed text-[#6E5445]">
                {t.subtitle}
              </p>
            </div>
          </header>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-8">
              <Card padding={false} className="border-t-2 border-t-smrmp-gold bg-[#FFFDF9] p-3.5">
                <p className="text-[10px] font-bold uppercase text-smrmp-subtle">{t.totalRequests}</p>
                <p className="mt-1 font-display text-2xl font-black text-[#2B1B12]">{stats.total ?? 0}</p>
                <p className="mt-0.5 text-[9px] font-bold text-smrmp-green">All Work Orders</p>
              </Card>

              <Card padding={false} className="border-t-2 border-t-blue-500 bg-[#FFFDF9] p-3.5">
                <p className="text-[10px] font-bold uppercase text-smrmp-subtle">{t.newRequests}</p>
                <p className="mt-1 font-display text-2xl font-black text-blue-700">{stats.new ?? 0}</p>
                <p className="mt-0.5 text-[9px] font-bold text-blue-600">Fresh Submissions</p>
              </Card>

              <Card padding={false} className="border-t-2 border-t-purple-500 bg-[#FFFDF9] p-3.5">
                <p className="text-[10px] font-bold uppercase text-smrmp-subtle">{t.pendingApproval}</p>
                <p className="mt-1 font-display text-2xl font-black text-purple-700">{stats.pending_approval ?? 0}</p>
                <p className="mt-0.5 text-[9px] font-bold text-purple-600">Needs Review</p>
              </Card>

              <button
                type="button"
                onClick={() => navigate('/maintenance/tasks')}
                className="text-left transition hover:scale-[1.02]"
              >
                <Card padding={false} className="border-t-2 border-t-indigo-500 bg-[#FFFDF9] p-3.5 hover:bg-indigo-50/40">
                  <p className="text-[10px] font-bold uppercase text-smrmp-subtle">{t.assignedRequests}</p>
                  <p className="mt-1 font-display text-2xl font-black text-indigo-700">{stats.assigned ?? 0}</p>
                  <p className="mt-0.5 text-[9px] font-bold text-indigo-600">Active Dispatches</p>
                </Card>
              </button>

              <Card padding={false} className="border-t-2 border-t-amber-500 bg-[#FFFDF9] p-3.5">
                <p className="text-[10px] font-bold uppercase text-smrmp-subtle">{t.inProgress}</p>
                <p className="mt-1 font-display text-2xl font-black text-amber-700">{stats.in_progress ?? 0}</p>
                <p className="mt-0.5 text-[9px] font-bold text-amber-600">Under Repair</p>
              </Card>

              <Card padding={false} className="border-t-2 border-t-emerald-500 bg-[#FFFDF9] p-3.5">
                <p className="text-[10px] font-bold uppercase text-smrmp-subtle">{t.completedRepairs}</p>
                <p className="mt-1 font-display text-2xl font-black text-emerald-700">{stats.completed ?? 0}</p>
                <p className="mt-0.5 text-[9px] font-bold text-emerald-600">Verified & Resolved</p>
              </Card>

              <Card padding={false} className="border-t-2 border-t-rose-600 bg-[#FFFDF9] p-3.5">
                <p className="text-[10px] font-bold uppercase text-smrmp-subtle">{t.emergencyRequests}</p>
                <p className="mt-1 font-display text-2xl font-black text-rose-700">{stats.emergency ?? 0}</p>
                <p className="mt-0.5 text-[9px] font-bold text-rose-600">Immediate Action</p>
              </Card>

              <Card padding={false} className="border-t-2 border-t-amber-600 bg-[#FFFDF9] p-3.5">
                <p className="text-[10px] font-bold uppercase text-smrmp-subtle">{t.highPriority}</p>
                <p className="mt-1 font-display text-2xl font-black text-amber-800">{stats.high_priority ?? 0}</p>
                <p className="mt-0.5 text-[9px] font-bold text-amber-700">Urgent Attention</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="bg-[#FFFDF9] p-5 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between border-b border-[#E2D6C5] pb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2B1B12]">Monthly Requests & Completion Rate</h3>
                    <p className="text-xs text-[#6E5445]">Work orders submitted vs successfully completed repairs</p>
                  </div>
                  <Badge variant="gold">2026 Analytics</Badge>
                </div>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: analytics.monthly_requests.map((item) => item.month),
                      datasets: [
                        {
                          label: 'Requests Submitted',
                          data: analytics.monthly_requests.map((item) => item.requests),
                          backgroundColor: '#7C4A2D',
                        },
                        {
                          label: 'Completed Repairs',
                          data: analytics.monthly_requests.map((item) => item.completed),
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

              <Card className="bg-[#FFFDF9] p-5">
                <div className="mb-4 flex items-center justify-between border-b border-[#E2D6C5] pb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#2B1B12]">Request Categories</h3>
                    <p className="text-xs text-[#6E5445]">Volume breakdown by issue type</p>
                  </div>
                  <Badge variant="info">Category Share</Badge>
                </div>
                <div className="flex h-64 items-center justify-center">
                  <Doughnut
                    data={{
                      labels: analytics.category_breakdown.map((item) => item.category),
                      datasets: [
                        {
                          data: analytics.category_breakdown.map((item) => item.count),
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="bg-[#FAF6F0] p-5">
                <h3 className="mb-3 font-display text-base font-bold text-[#2B1B12]">Quick Actions</h3>
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/maintenance/tasks')}
                    className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-left transition hover:bg-indigo-100/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <ClipboardDocumentCheckIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-900">{t.assignedTasks}</p>
                        <p className="text-[10px] text-indigo-700">{assignedTasks.length} tasks dispatched to teams</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-indigo-700" />
                  </button>
                </div>
              </Card>

              <Card className="bg-[#FFFDF9] p-5 lg:col-span-2">
                <div className="mb-3 flex items-center justify-between border-b border-[#E2D6C5] pb-3">
                  <h3 className="font-display text-base font-bold text-[#2B1B12]">Recently Submitted Requests</h3>
                </div>
                <div className="divide-y divide-[#E2D6C5]">
                  {recentRequests.length === 0 ? (
                    <p className="py-6 text-center text-sm text-[#6E5445]">No maintenance requests yet.</p>
                  ) : (
                    recentRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between gap-3 py-3">
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
                          <p className="mt-1 truncate text-xs font-bold text-[#2B1B12]">{req.title}</p>
                          <p className="truncate text-[11px] text-[#6E5445]">
                            {req.building} • {req.reportedBy}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            <Card className="bg-[#FFFDF9] p-5">
              <div className="mb-3 flex items-center justify-between border-b border-[#E2D6C5] pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-[#2B1B12]">{t.assignedTasks}</h3>
                  <p className="text-xs text-[#6E5445]">Tasks currently assigned to technician teams</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/maintenance/tasks')}
                  className="text-xs font-bold text-[#7C4A2D] hover:underline"
                >
                  View All →
                </button>
              </div>

              {assignedTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E2D6C5] bg-[#FAF6F0] p-6 text-center">
                  <ClipboardDocumentCheckIcon className="mx-auto h-8 w-8 text-[#7C4A2D]/40" />
                  <p className="mt-2 text-sm font-bold text-[#5C4233]">No assigned tasks yet</p>
                  <p className="mt-1 text-xs text-[#6E5445]">
                    Approved requests will appear here once dispatched to a team.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {assignedTasks.slice(0, 6).map((task) => (
                    <div
                      key={task.id}
                      className="space-y-2 rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] p-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#7C4A2D]">{task.id}</span>
                        <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
                          {task.status}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-xs font-bold text-[#2B1B12]">{task.title}</p>
                      <div className="space-y-0.5 text-[11px] text-[#6E5445]">
                        <p><strong>Technician:</strong> {task.assignedTo}</p>
                        <p><strong>Department:</strong> {task.department}</p>
                        <p><strong>Est. Completion:</strong> {task.estimatedCompletion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
