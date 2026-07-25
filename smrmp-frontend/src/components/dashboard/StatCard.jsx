import {
  ArchiveBoxIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  TicketIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';

const meta = {
  total_artifacts: {
    label: 'Total Artifacts',
    icon: ArchiveBoxIcon,
    gradient: 'from-amber-500 via-smrmp-gold to-amber-600',
    iconBg: 'bg-[#FAF0D8] text-[#7C4A2D] border-[#D4A017]/30',
    trend: '+12 added',
    trendUp: true,
  },
  active_exhibitions: {
    label: 'Active Exhibitions',
    icon: CalendarDaysIcon,
    gradient: 'from-[#374B07] to-[#243205]',
    iconBg: 'bg-[#E4EEDC] text-[#243205] border-[#B8D4A0]',
    trend: '4 Active halls',
    trendUp: true,
  },
  conservation_alerts: {
    label: 'Conservation Alerts',
    icon: ExclamationTriangleIcon,
    gradient: 'from-[#8B1E1E] to-[#6E1212]',
    iconBg: 'bg-[#FCE4E4] text-[#8B1E1E] border-[#F2A8A8]',
    trend: 'Action needed',
    trendUp: false,
  },
  visitors_today: {
    label: 'Visitors Today',
    icon: UsersIcon,
    gradient: 'from-[#1A4568] to-[#102B45]',
    iconBg: 'bg-[#E2ECF5] text-[#1A4568] border-[#A8C5E2]',
    trend: '+18% vs yesterday',
    trendUp: true,
  },
  tickets_sold_this_month: {
    label: 'Tickets This Month',
    icon: TicketIcon,
    gradient: 'from-[#7C4A2D] to-amber-600',
    iconBg: 'bg-[#FAF0D8] text-[#7C4A2D] border-[#D4A017]/30',
    trend: 'Sales active',
    trendUp: true,
  },
};

export default function StatCard({ name, value, loading }) {
  const config = meta[name] || {
    label: name,
    icon: ArchiveBoxIcon,
    gradient: 'from-[#7C4A2D] to-[#4A2C1B]',
    iconBg: 'bg-[#EFE7DA] text-[#5C4233] border-[#D8C8B8]',
    trend: 'Live stat',
    trendUp: true,
  };

  const Icon = config.icon;

  return (
    <Card hover className="relative overflow-hidden p-4 group">
      {/* Accent top border */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6E5445] truncate">
            {config.label}
          </p>

          {loading ? (
            <div className="mt-1.5 space-y-1">
              <div className="h-6 w-16 animate-pulse rounded bg-[#E2D6C5]" />
            </div>
          ) : (
            <div className="mt-1 flex items-baseline gap-2">
              <p className="font-display text-2xl font-bold tracking-tight text-[#2B1B12]">
                {value ?? '—'}
              </p>
              <div className="flex items-center gap-0.5 text-[11px] font-semibold truncate">
                {config.trendUp ? (
                  <ArrowTrendingUpIcon className="h-3 w-3 text-[#374B07] shrink-0" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3 text-[#8B1E1E] shrink-0" />
                )}
                <span className={config.trendUp ? 'text-[#243205]' : 'text-[#8B1E1E]'}>
                  {config.trend}
                </span>
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border p-2 transition-transform duration-200 group-hover:scale-105 ${config.iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
