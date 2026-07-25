import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import ArtifactTable from '../../components/artifacts/ArtifactTable';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { useArtifacts } from '../../hooks/useArtifacts';
import useAuthStore from '../../store/authStore';
import { ARTIFACT_CATEGORIES, CONDITION_STATUSES } from '../../utils/constants';

export default function ArtifactsPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuthStore();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    condition_status: '',
    page: 1,
  });

  const { data, isLoading } = useArtifacts(filters);
  const artifacts = data?.artifacts || data || [];
  const pagination = data?.pagination;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleReset = () => {
    setFilters({ search: '', category: '', condition_status: '', page: 1 });
  };

  return (
    <PrivateLayout>
      <PageHeader
        title="Artifact Catalog"
        description="Comprehensive repository of registered museum assets, provenance, and conservation metrics"
        badge="Archive Registry"
        action={
          hasRole('admin', 'curator') && (
            <Button variant="primary" onClick={() => navigate('/artifacts/new')}>
              <PlusIcon className="h-4 w-4" />
              <span>Add Artifact</span>
            </Button>
          )
        }
      />

      {/* Search & Filter Bar */}
      <Card hover className="mb-6">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-[#5C4233]">
          <FunnelIcon className="h-4 w-4 text-[#374B07]" />
          <span>Filter Archive</span>
        </div>

        <div className="grid gap-4 md:grid-cols-4 items-end">
          <Input
            icon={MagnifyingGlassIcon}
            placeholder="Search by name, origin, ID..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <Select
            options={ARTIFACT_CATEGORIES}
            placeholder="All Categories"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          />
          <Select
            options={CONDITION_STATUSES}
            placeholder="All Conditions"
            value={filters.condition_status}
            onChange={(e) => handleFilterChange('condition_status', e.target.value)}
          />
          <Button variant="secondary" onClick={handleReset}>
            <ArrowPathIcon className="h-4 w-4" />
            <span>Reset Filters</span>
          </Button>
        </div>
      </Card>

      {/* Artifact Table */}
      <ArtifactTable
        artifacts={Array.isArray(artifacts) ? artifacts : []}
        loading={isLoading}
        onRowClick={(row) => navigate(`/artifacts/${row.id}`)}
      />

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-4 shadow-2xs">
          <p className="text-xs font-semibold text-[#6E5445]">
            Showing Page <span className="text-[#2B1B12]">{pagination.page}</span> of{' '}
            <span className="text-[#2B1B12]">{pagination.totalPages}</span> ({pagination.total} total artifacts)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </PrivateLayout>
  );
}
