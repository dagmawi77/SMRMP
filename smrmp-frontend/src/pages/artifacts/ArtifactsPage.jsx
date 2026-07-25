import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  QrCodeIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import PrivateLayout from '../../components/layout/PrivateLayout';
import PageHeader from '../../components/layout/PageHeader';
import ArtifactGrid from '../../components/artifacts/ArtifactGrid';
import ArtifactTable from '../../components/artifacts/ArtifactTable';
import QRScannerModal from '../../components/artifacts/QRScannerModal';
import DuplicateDetectorModal from '../../components/artifacts/DuplicateDetectorModal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { useArtifacts } from '../../hooks/useArtifacts';
import useAuthStore from '../../store/authStore';
import { aiApi } from '../../api/aiApi';
import { ARTIFACT_CATEGORIES, CONDITION_STATUSES } from '../../utils/constants';
import getApiErrorMessage from '../../utils/apiError';
import toast from 'react-hot-toast';

export default function ArtifactsPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuthStore();
  const [showScanner, setShowScanner] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    condition_status: '',
    page: 1,
  });

  const { data, isLoading, isError, error, refetch } = useArtifacts(filters);
  const artifacts = data?.artifacts || data || [];
  const pagination = data?.pagination;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleAiSearch = async () => {
    if (!filters.search.trim()) {
      toast.error('Please enter a natural language search query first');
      return;
    }

    setIsAiSearching(true);
    try {
      const res = await aiApi.search(filters.search);
      const dataObj = res.data.data;
      setAiInterpretation(dataObj.interpretation || `Natural language interpretation for "${filters.search}"`);
      if (dataObj.artifacts) {
        setAiResults(dataObj.artifacts);
      }
      setIsAiMode(true);
      if (dataObj.filters?.category) {
        setFilters((prev) => ({ ...prev, category: dataObj.filters.category }));
      }
      if (dataObj.filters?.condition_status) {
        setFilters((prev) => ({ ...prev, condition_status: dataObj.filters.condition_status }));
      }
      toast.success('AI Natural Language Search completed');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'AI search failed'));
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleReset = () => {
    setFilters({ search: '', category: '', condition_status: '', page: 1 });
    setIsAiMode(false);
    setAiResults(null);
    setAiInterpretation('');
  };

  const displayedArtifacts = isAiMode && aiResults !== null ? aiResults : (Array.isArray(artifacts) ? artifacts : []);

  return (
    <PrivateLayout>
      <PageHeader
        title="Artifact Catalog"
        description="Comprehensive repository of registered museum assets, provenance, and conservation metrics"
        badge="Archive Registry"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="gold" onClick={() => setShowScanner(true)}>
              <QrCodeIcon className="h-4 w-4" />
              <span>Scan Tag</span>
            </Button>
            <Button variant="secondary" onClick={() => setShowDuplicateModal(true)}>
              <DocumentDuplicateIcon className="h-4 w-4" />
              <span>Check Duplicates</span>
            </Button>
            {hasRole('admin', 'curator') && (
              <Button variant="primary" onClick={() => navigate('/artifacts/new')}>
                <PlusIcon className="h-4 w-4" />
                <span>Add Artifact</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Search & Filter Bar */}
      <Card hover className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C4233]">
            <FunnelIcon className="h-4 w-4 text-[#374B07]" />
            <span>Filter Archive</span>
          </div>

          <Button
            variant="gold"
            size="sm"
            loading={isAiSearching}
            onClick={handleAiSearch}
          >
            <SparklesIcon className="h-4 w-4" />
            <span>AI Natural Search</span>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4 items-end">
          <Input
            icon={MagnifyingGlassIcon}
            placeholder="e.g. 'Show ceremonial weapons in fair condition'..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
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

        {isAiMode && aiInterpretation && (
          <Alert variant="ai" className="text-xs">
            <span className="font-bold">AI Intent Interpretation: </span>
            {aiInterpretation}
          </Alert>
        )}
      </Card>

      {/* Header Bar with Catalog Stats & View Switcher */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E2D6C5] bg-[#FAF6F0] px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#5C4233] uppercase tracking-wider">
            Showing Catalog Assets
          </span>
          <span className="rounded-full bg-[#EFE5D8] px-2.5 py-0.5 text-xs font-bold text-[#374B07] border border-[#D8C8B8]">
            {displayedArtifacts.length} {displayedArtifacts.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-[#EFE5D8] p-1 border border-[#D8C8B8]">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-[#374B07] text-white shadow-2xs'
                : 'text-[#6E5445] hover:text-[#2B1B12] hover:bg-[#FAF6F0]/60'
            }`}
            title="Grid View (Default)"
          >
            <Squares2X2Icon className="h-4 w-4" />
            <span>Grid Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-[#374B07] text-white shadow-2xs'
                : 'text-[#6E5445] hover:text-[#2B1B12] hover:bg-[#FAF6F0]/60'
            }`}
            title="Table View"
          >
            <TableCellsIcon className="h-4 w-4" />
            <span>Table List</span>
          </button>
        </div>
      </div>

      {isError && !isLoading && (
        <Alert variant="error" className="mb-4 text-xs">
          <span className="font-bold">Could not load artifacts: </span>
          {getApiErrorMessage(error, 'Failed to load artifact catalog')}
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-2 underline font-semibold"
          >
            Retry
          </button>
        </Alert>
      )}

      {/* Catalog View: Grid (Default) or Table */}
      {viewMode === 'grid' ? (
        <ArtifactGrid
          artifacts={displayedArtifacts}
          loading={isLoading || isAiSearching}
          onCardClick={(artifact) => navigate(`/artifacts/${artifact.id}`)}
        />
      ) : (
        <ArtifactTable
          artifacts={displayedArtifacts}
          loading={isLoading || isAiSearching}
          onRowClick={(row) => navigate(`/artifacts/${row.id}`)}
        />
      )}

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

      <QRScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
      <DuplicateDetectorModal isOpen={showDuplicateModal} onClose={() => setShowDuplicateModal(false)} />
    </PrivateLayout>
  );
}
