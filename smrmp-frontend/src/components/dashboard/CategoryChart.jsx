import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  '#374B07',
  '#D4A017',
  '#7C4A2D',
  '#243205',
  '#92400E',
  '#1A4568',
  '#5B21B6',
  '#8C3A10',
  '#A07028',
];

export default function CategoryChart({ data, loading }) {
  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="font-display text-sm font-bold text-[#2B1B12] mb-2">Artifacts by Category</h3>
        <Spinner className="py-8" />
      </Card>
    );
  }

  const totalCount = data?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;

  const chartData = {
    labels: data?.map((d) => d.category) || [],
    datasets: [
      {
        data: data?.map((d) => d.count) || [],
        backgroundColor: PALETTE,
        borderWidth: 2,
        borderColor: '#FAF6F0',
        hoverOffset: 4,
      },
    ],
  };

  return (
    <Card hover className="p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-3 mb-3">
          <div>
            <h3 className="font-display text-sm font-bold text-[#2B1B12]">Collection Breakdown</h3>
            <p className="text-[11px] text-[#6E5445]">Distribution across categories</p>
          </div>
          <span className="rounded-full bg-[#FAF0D8] px-2.5 py-0.5 text-xs font-bold text-[#7C4A2D] border border-[#D4A017]/40">
            {totalCount} Total
          </span>
        </div>

        {data?.length ? (
          <div className="relative mx-auto my-1 max-w-[170px]">
            <Doughnut
              data={chartData}
              options={{
                cutout: '72%',
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#1C120B',
                    titleFont: { size: 11, weight: 'bold' },
                    bodyFont: { size: 11 },
                    padding: 8,
                    cornerRadius: 8,
                    callbacks: {
                      label: (context) => {
                        const val = context.parsed;
                        const pct = totalCount ? Math.round((val / totalCount) * 100) : 0;
                        return ` ${val} items (${pct}%)`;
                      },
                    },
                  },
                },
                maintainAspectRatio: true,
              }}
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold font-display text-[#2B1B12]">{totalCount}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#6E5445]">Items</span>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-xs font-medium text-[#6E5445]">No categorization data</p>
        )}
      </div>

      {data?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#E2D6C5] grid grid-cols-2 gap-1.5 text-xs">
          {data.slice(0, 4).map((item, idx) => {
            const pct = totalCount ? Math.round((item.count / totalCount) * 100) : 0;
            return (
              <div key={item.category} className="flex items-center justify-between gap-1 rounded-lg bg-[#FFFDF9] p-1.5 text-[11px] border border-[#E2D6C5]/60">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                  />
                  <span className="truncate font-medium capitalize text-[#2B1B12]">{item.category}</span>
                </div>
                <span className="font-bold text-[#374B07]">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
