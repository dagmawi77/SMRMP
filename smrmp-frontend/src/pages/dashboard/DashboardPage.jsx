import PrivateLayout from '../../components/layout/PrivateLayout';
import StatCard from '../../components/dashboard/StatCard';
import CategoryChart from '../../components/dashboard/CategoryChart';
import VisitorChart from '../../components/dashboard/VisitorChart';
import ConservationChart from '../../components/dashboard/ConservationChart';
import RecentArtifacts from '../../components/dashboard/RecentArtifacts';
import AIAssistant from '../../components/ai/AIAssistant';
import AIReportModal from '../../components/ai/AIReportModal';
import { useDashboardStats, useDashboardCharts } from '../../hooks/useDashboard';
import useAuthStore from '../../store/authStore';
import { CalendarIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: chartsData, isLoading: chartsLoading } = useDashboardCharts();

  const stats = statsData?.stats || {};
  const recentArtifacts = statsData?.recent_artifacts || [];

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <PrivateLayout>
      {/* Sleek Heritage Header Banner */}
      <div className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] px-5 py-4 text-smrmp-parchment shadow-md border border-smrmp-gold/30">
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-smrmp-gold/20 text-smrmp-gold ring-1 ring-smrmp-gold/40">
              <BuildingLibraryIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-bold text-white tracking-tight">
                  Welcome back, <span className="text-smrmp-gold">{user?.name || 'Administrator'}</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-smrmp-gold/15 px-2 py-0.5 text-[10px] font-bold text-smrmp-gold border border-smrmp-gold/30">
                  <CalendarIcon className="h-3 w-3" />
                  {todayDate}
                </span>
              </div>
              <p className="text-xs text-smrmp-parchment/70 font-normal mt-0.5">
                Executive Portal — Museum Operations & Archive Oversight
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <AIReportModal />
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="mb-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries({
          total_artifacts: stats.total_artifacts,
          active_exhibitions: stats.active_exhibitions,
          conservation_alerts: stats.conservation_alerts,
          visitors_today: stats.visitors_today,
          tickets_sold_this_month: stats.tickets_sold_this_month,
        }).map(([key, value]) => (
          <StatCard key={key} name={key} value={value} loading={statsLoading} />
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <CategoryChart data={chartsData?.categories} loading={chartsLoading} />
        <ConservationChart data={chartsData?.conservation_status} loading={chartsLoading} />
      </div>

      {/* Secondary Row: Visitor Trend & Recent Artifacts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VisitorChart data={chartsData?.visitor_trend} loading={chartsLoading} />
        </div>
        <div>
          <RecentArtifacts artifacts={recentArtifacts} loading={statsLoading} />
        </div>
      </div>

      {/* Floating AI Assistant */}
      <AIAssistant />
    </PrivateLayout>
  );
}
