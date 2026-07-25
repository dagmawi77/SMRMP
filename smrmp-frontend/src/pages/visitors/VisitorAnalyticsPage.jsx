import {
  UsersIcon,
  CalendarDaysIcon,
  TicketIcon,
  IdentificationIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import VisitorChart from '../../components/dashboard/VisitorChart';
import CategoryChart from '../../components/dashboard/CategoryChart';
import {
  useVisitorAnalyticsSummary,
  useVisitorAnalyticsTrends,
  useVisitorAnalyticsSegments,
  useVisitorAnalyticsFeedback,
} from '../../hooks/useVisitors';

export default function VisitorAnalyticsPage() {
  const { data: summary, isLoading: loadingSummary } = useVisitorAnalyticsSummary();
  const { data: trend, isLoading: loadingTrend } = useVisitorAnalyticsTrends(30);
  const { data: segments, isLoading: loadingSegments } = useVisitorAnalyticsSegments();
  const { data: feedbackStats, isLoading: loadingFeedback } = useVisitorAnalyticsFeedback();

  const trendChartData = (trend || []).map((t) => ({ date: t.date, count: t.visitors }));
  const byVisitorType = (segments?.by_visitor_type || []).map((s) => ({ category: s.visitor_type, count: s.count }));
  const byEntryMethod = (segments?.by_entry_method || []).map((s) => ({ category: s.entry_method?.replace('_', ' '), count: s.count }));

  return (
    <PrivateLayout>
      <PageHeader
        title="Visitor Analytics"
        description="Curator monitoring — attendance trends, segmentation, and feedback sentiment."
        badge="Module 8"
        backPath="/visitors"
        showBack
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-[#7C4A2D]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Total Visitors</p>
            <p className="font-display text-xl font-bold text-[#2B1B12]">{loadingSummary ? '—' : summary?.total_visitors}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <CalendarDaysIcon className="h-8 w-8 text-[#7C4A2D]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Today</p>
            <p className="font-display text-xl font-bold text-[#2B1B12]">{loadingSummary ? '—' : summary?.visitors_today}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <TicketIcon className="h-8 w-8 text-[#7C4A2D]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Total Visits</p>
            <p className="font-display text-xl font-bold text-[#2B1B12]">{loadingSummary ? '—' : summary?.total_visits}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <IdentificationIcon className="h-8 w-8 text-[#7C4A2D]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Active Members</p>
            <p className="font-display text-xl font-bold text-[#2B1B12]">{loadingSummary ? '—' : summary?.active_memberships}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <StarIcon className="h-8 w-8 text-[#D4A017]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Avg. Rating</p>
            <p className="font-display text-xl font-bold text-[#2B1B12]">
              {loadingFeedback ? '—' : feedbackStats?.average_rating || 'N/A'}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VisitorChart data={trendChartData} loading={loadingTrend} />
        </div>
        <CategoryChart data={byVisitorType} loading={loadingSegments} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryChart data={byEntryMethod} loading={loadingSegments} />

        <Card>
          <div className="mb-4 border-b border-[#E2D6C5] pb-3">
            <h3 className="font-display text-sm font-bold text-[#2B1B12]">Feedback Sentiment Breakdown</h3>
            <p className="text-[11px] text-[#6E5445]">{feedbackStats?.total_feedback || 0} total feedback submissions</p>
          </div>
          {loadingFeedback ? (
            <p className="py-8 text-center text-xs text-[#6E5445]">Loading sentiment data...</p>
          ) : !feedbackStats?.by_sentiment?.length ? (
            <p className="py-8 text-center text-xs text-[#6E5445]">No sentiment data available yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbackStats.by_sentiment.map((s) => (
                <div key={s.sentiment} className="flex items-center justify-between rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] px-4 py-2.5">
                  <Badge
                    variant={s.sentiment === 'positive' ? 'excellent' : s.sentiment === 'negative' ? 'critical' : 'fair'}
                    className="capitalize"
                  >
                    {s.sentiment}
                  </Badge>
                  <span className="font-bold text-[#2B1B12]">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PrivateLayout>
  );
}
