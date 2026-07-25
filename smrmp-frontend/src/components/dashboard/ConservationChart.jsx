import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CONDITION_COLORS = {
  excellent: '#374B07',
  good: '#1A4568',
  fair: '#D4A017',
  poor: '#8C3A10',
  critical: '#8B1E1E',
};

export default function ConservationChart({ data, loading }) {
  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="font-display text-sm font-bold text-[#2B1B12] mb-2">Conservation Health</h3>
        <Spinner className="py-8" />
      </Card>
    );
  }

  const criticalCount = data?.find((d) => d.condition_status === 'critical')?.count || 0;
  const poorCount = data?.find((d) => d.condition_status === 'poor')?.count || 0;
  const totalAlerts = criticalCount + poorCount;

  const chartData = {
    labels: data?.map((d) => d.condition_status) || [],
    datasets: [
      {
        label: 'Artifacts',
        data: data?.map((d) => d.count) || [],
        backgroundColor: data?.map((d) => CONDITION_COLORS[d.condition_status] || '#7C4A2D') || [],
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 22,
      },
    ],
  };

  return (
    <Card hover className="p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-3 mb-3">
          <div>
            <h3 className="font-display text-sm font-bold text-[#2B1B12]">Conservation Health</h3>
            <p className="text-[11px] text-[#6E5445]">Condition monitoring & alerts</p>
          </div>

          {totalAlerts > 0 ? (
            <span className="flex items-center gap-1 rounded-full bg-[#FCE4E4] px-2 py-0.5 text-xs font-bold text-[#8B1E1E] border border-[#F2A8A8] animate-pulse">
              <ShieldExclamationIcon className="h-3.5 w-3.5" />
              {totalAlerts} Alert{totalAlerts > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="rounded-full bg-[#E4EEDC] px-2 py-0.5 text-xs font-bold text-[#243205] border border-[#B8D4A0]">
              Optimal
            </span>
          )}
        </div>

        {data?.length ? (
          <div className="h-44">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#1C120B',
                    titleFont: { size: 11, weight: 'bold' },
                    bodyFont: { size: 11 },
                    padding: 8,
                    cornerRadius: 8,
                    callbacks: {
                      title: (items) => `Condition: ${items[0].label.toUpperCase()}`,
                      label: (context) => ` Artifacts: ${context.parsed.y}`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      font: { size: 10, weight: '600' },
                      color: '#5C4233',
                      callback: function (val) {
                        const label = this.getLabelForValue(val);
                        return label.charAt(0).toUpperCase() + label.slice(1);
                      },
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: '#EAE0D2' },
                    ticks: { stepSize: 1, font: { size: 10 }, color: '#6E5445' },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="py-8 text-center text-xs font-medium text-[#6E5445]">No conservation data</p>
        )}
      </div>

      {totalAlerts > 0 && (
        <div className="mt-2 rounded-lg bg-[#FAF0D8] p-2 border border-[#D4A017]/40 text-[11px] text-[#7C4A2D]">
          ⚠️ {totalAlerts} artifact(s) require review or restoration.
        </div>
      )}
    </Card>
  );
}
