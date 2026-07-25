import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCodeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UsersIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  NoSymbolIcon,
  ChartBarIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import QuickCheckInModal from '../../components/visitors/QuickCheckInModal';
import { useVisitors, useVisitorAnalyticsSummary } from '../../hooks/useVisitors';
import { VISITOR_TYPES, VISITOR_TYPE_BADGE } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import getApiErrorMessage from '../../utils/apiError';
import useAuthStore from '../../store/authStore';

export default function VisitorsPage() {
  const navigate = useNavigate();
  const { can } = useAuthStore();
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [filters, setFilters] = useState({ search: '', visitor_type: '', page: 1 });

  const { data, isLoading, isError, error, refetch } = useVisitors({
    page: filters.page,
    limit: 20,
    search: filters.search || undefined,
    visitor_type: filters.visitor_type || undefined,
  });
  const { data: summary } = useVisitorAnalyticsSummary();

  const visitors = data?.visitors || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 0 };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const hasActiveFilters = Boolean(filters.search || filters.visitor_type);

  const columns = [
    {
      key: 'name',
      label: 'Visitor',
      render: (row) => (
        <div>
          <p className="font-bold text-[#2B1B12] text-sm">
            {row.first_name} {row.last_name}
          </p>
          <p className="text-xs text-[#6E5445]">{row.email || row.phone || 'No contact info'}</p>
        </div>
      ),
    },
    {
      key: 'visitor_type',
      label: 'Type',
      render: (row) => (
        <Badge variant={VISITOR_TYPE_BADGE[row.visitor_type] || 'default'}>{row.visitor_type}</Badge>
      ),
    },
    {
      key: 'total_visits',
      label: 'Total Visits',
      render: (row) => <span className="font-semibold text-[#2B1B12]">{row.total_visits}</span>,
    },
    {
      key: 'last_visit_at',
      label: 'Last Visit',
      render: (row) => (
        <span className="text-xs text-[#6E5445]">
          {row.last_visit_at ? formatDate(row.last_visit_at) : 'Never'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) =>
        row.is_blacklisted ? (
          <Badge variant="critical">Blacklisted</Badge>
        ) : (
          <Badge variant="excellent">Active</Badge>
        ),
    },
  ];

  return (
    <PrivateLayout>
      <PageHeader
        title="Visitor Relations"
        description="Monitor visitor activity, admissions, and CRM records. Visitors manage their own accounts in the Visitor Portal."
        badge="Curator"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => navigate('/visitors/analytics')}>
              <ChartBarIcon className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
            {can('visitors.checkin') && (
              <Button variant="secondary" onClick={() => setShowCheckInModal(true)}>
                <QrCodeIcon className="h-4 w-4" />
                <span>Staff Check-In</span>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#FFFDF9] to-[#FAF6F0]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF0D8] text-[#7C4A2D] border border-[#D4A017]/40">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Total Visitors</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{summary?.total_visitors ?? '—'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#FFFDF9] to-[#FAF6F0]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CalendarDaysIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Visitors Today</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{summary?.visitors_today ?? '—'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#FFFDF9] to-[#FAF6F0]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF0D8] text-[#D4A017] border border-[#D4A017]/40">
            <IdentificationIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Active Memberships</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{summary?.active_memberships ?? '—'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 bg-gradient-to-br from-[#FFFDF9] to-[#FAF6F0]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-800 border border-rose-200">
            <NoSymbolIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Blacklisted</p>
            <p className="font-display text-2xl font-bold text-[#2B1B12]">{summary?.blacklisted_visitors ?? '—'}</p>
          </div>
        </Card>
      </div>

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Search by name, email, phone..."
              icon={MagnifyingGlassIcon}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Select
              icon={FunnelIcon}
              placeholder="All Visitor Types"
              options={[{ value: '', label: 'All Visitor Types' }, ...VISITOR_TYPES]}
              value={filters.visitor_type}
              onChange={(e) => handleFilterChange('visitor_type', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={() => setFilters({ search: '', visitor_type: '', page: 1 })}>
                Reset Filters
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <ArrowPathIcon className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </Card>

      {isError ? (
        <Card className="p-8 text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h3 className="font-bold text-[#2B1B12] text-lg">Unable to load visitor records</h3>
          <p className="mt-1 text-sm text-[#6E5445]">{getApiErrorMessage(error, 'An unexpected error occurred')}</p>
          <Button variant="secondary" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </Card>
      ) : (
        <>
          <Table
            columns={columns}
            data={visitors}
            loading={isLoading}
            onRowClick={(row) => navigate(`/visitors/${row.id}`)}
            emptyMessage={
              hasActiveFilters
                ? 'No visitors match your filter criteria.'
                : 'No visitor records yet. Visitors appear here after they register through the Visitor Portal.'
            }
          />
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs text-[#6E5445]">
              <span>
                Page {pagination.page} of {pagination.totalPages} — {pagination.total} total visitors
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <QuickCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSuccess={() => refetch()}
      />
    </PrivateLayout>
  );
}
