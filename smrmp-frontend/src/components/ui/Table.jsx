import Spinner from './Spinner';

export default function Table({ columns, data, loading, onRowClick, emptyMessage = 'No records found' }) {
  if (loading) {
    return (
      <div className="py-12">
        <Spinner className="mx-auto" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="py-12 text-center text-sm font-medium text-[#6E5445]">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] shadow-2xs">
      <table className="min-w-full divide-y divide-[#F0E6D8]">
        <thead className="bg-[#EFE5D8]/90">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5C4233]"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0E6D8] bg-[#FFFDF9]">
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-[#FAF0E4]' : ''
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-5 py-3.5 text-sm text-[#2B1B12]">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
