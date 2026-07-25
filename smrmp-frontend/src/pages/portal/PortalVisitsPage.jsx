import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import PortalPageHeader from '../../components/layout/PortalPageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { usePortalVisits } from '../../hooks/usePortal';
import { ENTRY_METHODS } from '../../utils/constants';

const entryMethodLabel = (value) =>
  ENTRY_METHODS.find((m) => m.value === value)?.label || value || 'Unknown';

export default function PortalVisitsPage() {
  const { data, isLoading } = usePortalVisits();
  const visits = data?.visits || [];

  return (
    <>
      <PortalPageHeader
        showTitle={false}
        icon={CalendarDaysIcon}
        title="Visit history"
        description={`${data?.total_visits ?? 0} recorded visit(s) at the museum.`}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : visits.length === 0 ? (
        <Card>
          <EmptyState
            icon="🏛️"
            title="No visits recorded yet"
            description="Once you check in at the museum, your visit history will appear here."
          />
        </Card>
      ) : (
        <div className="relative space-y-4 border-l-2 border-[#E2D6C5] pl-5">
          {visits.map((visit) => (
            <div key={visit.id} className="relative">
              <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-smrmp-parchment bg-smrmp-green" />
              <Card hover>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#2B1B12]">
                    {new Date(visit.entry_time).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <span className="rounded-full bg-[#FAF0D8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7C4A2D]">
                    {entryMethodLabel(visit.entry_method)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#6E5445]">
                  <span>
                    {visit.visitor_count}
                    {' '}
                    visitor(s)
                  </span>
                  {visit.exit_time ? (
                    <span>
                      Exited
                      {' '}
                      {new Date(visit.exit_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  ) : null}
                  {visit.purpose ? (
                    <span>
                      Purpose:
                      {' '}
                      {visit.purpose}
                    </span>
                  ) : null}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
