import Badge from '../ui/Badge';
import { formatDate } from '../../utils/formatters';
import { ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/outline';

const categoryIcons = {
  weapon: '⚔️',
  textile: '🧵',
  document: '📜',
  ceramic: '🏺',
  jewelry: '👑',
  ceremonial: '🚩',
  photograph: '📷',
  coin: '🪙',
  other: '🏛️',
};

export default function ArtifactTable({ artifacts, loading, onRowClick }) {
  const columns = [
    {
      key: 'name',
      label: 'Artifact Name',
      render: (row) => {
        const icon = categoryIcons[row.category?.toLowerCase()] || '🏛️';
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFE5D8] text-base border border-[#D8C8B8]">
              {icon}
            </div>
            <div>
              <p className="font-bold text-[#2B1B12]">{row.name}</p>
              {row.historical_period && (
                <p className="text-[11px] text-[#6E5445] font-medium">{row.historical_period}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="capitalize font-medium text-[#5C3C2C] bg-[#EFE5D8] px-2.5 py-1 rounded-lg text-xs border border-[#D8C8B8]">
          {row.category}
        </span>
      ),
    },
    {
      key: 'location',
      label: 'Gallery Location',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-[#5C4233] font-medium">
          <MapPinIcon className="h-3.5 w-3.5 text-[#7C4A2D]" />
          <span>{row.location || 'Storage Archive'}</span>
        </div>
      ),
    },
    {
      key: 'condition_status',
      label: 'Condition / Status',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={row.condition_status}>{row.condition_status}</Badge>
          {row.is_on_loan && <Badge variant="on_loan">On Loan</Badge>}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Registered Date',
      render: (row) => (
        <span className="text-xs text-[#6E5445] font-medium">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'action',
      label: '',
      render: () => (
        <ArrowRightIcon className="h-4 w-4 text-[#A08878] group-hover:text-[#374B07] group-hover:translate-x-1 transition-all" />
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] shadow-2xs">
      <table className="min-w-full divide-y divide-[#F0E6D8]">
        <thead className="bg-[#EFE5D8]/90">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5C4233]"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0E6D8] bg-[#FFFDF9]">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-smrmp-green border-t-transparent" />
                <p className="mt-3 text-xs font-semibold text-[#6E5445]">Loading catalog records...</p>
              </td>
            </tr>
          ) : !artifacts?.length ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center text-sm text-[#6E5445]">
                <span className="text-3xl block mb-2">🔍</span>
                No artifact records found matching filters
              </td>
            </tr>
          ) : (
            artifacts.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className="group cursor-pointer hover:bg-[#FAF0E4] transition-colors"
              >
                {columns.map((col, idx) => (
                  <td key={col.key || idx} className="whitespace-nowrap px-5 py-3.5 text-sm text-[#2B1B12]">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
