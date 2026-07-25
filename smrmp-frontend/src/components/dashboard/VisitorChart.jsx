import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { formatDate } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function VisitorChart({ data, loading }) {
  const [timeframe, setTimeframe] = useState('30D');

  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="font-display text-sm font-bold text-[#2B1B12] mb-2">Visitor Trend</h3>
        <Spinner className="py-8" />
      </Card>
    );
  }

  const filteredData = Array.isArray(data)
    ? timeframe === '7D'
      ? data.slice(-7)
      : timeframe === '14D'
      ? data.slice(-14)
      : data
    : [];

  const chartData = {
    labels: filteredData.map((d) => formatDate(d.date)) || [],
    datasets: [
      {
        label: 'Visitors',
        data: filteredData.map((d) => d.count) || [],
        borderColor: '#374B07',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 180);
          gradient.addColorStop(0, 'rgba(55, 75, 7, 0.25)');
          gradient.addColorStop(1, 'rgba(55, 75, 7, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#D4A017',
        pointBorderColor: '#374B07',
        pointBorderWidth: 2,
      },
    ],
  };

  const totalVisitors = filteredData.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const peakVisitors = filteredData.reduce((max, curr) => Math.max(max, curr.count || 0), 0);

  return (
    <Card hover className="p-4 flex flex-col justify-between">
      <div className="mb-3 flex items-center justify-between border-b border-[#E2D6C5] pb-3">
        <div>
          <h3 className="font-display text-sm font-bold text-[#2B1B12]">Visitor Trend Analytics</h3>
          <p className="text-[11px] text-[#6E5445]">Attendance throughput over time</p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-[#EFE5D8] p-1 border border-[#D8C8B8]">
          {['7D', '14D', '30D'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`rounded px-2 py-0.5 text-[11px] font-bold transition-all ${
                timeframe === tf
                  ? 'bg-[#FFFDF9] text-[#2B1B12] shadow-2xs'
                  : 'text-[#6E5445] hover:text-[#2B1B12]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 rounded-lg bg-[#FFFDF9] p-2.5 border border-[#E2D6C5] text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Total Period Visitors</p>
          <p className="text-sm font-bold text-[#2B1B12] mt-0.5">{totalVisitors.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Peak Daily Attendance</p>
          <p className="text-sm font-bold text-[#374B07] mt-0.5">{peakVisitors.toLocaleString()}</p>
        </div>
      </div>

      {filteredData.length ? (
        <div className="h-44">
          <Line
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
                  displayColors: false,
                  callbacks: {
                    label: (context) => `Visitors: ${context.parsed.y}`,
                  },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { size: 10 }, color: '#5C4233' },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: '#EAE0D2' },
                  ticks: { stepSize: 10, font: { size: 10 }, color: '#6E5445' },
                },
              },
            }}
          />
        </div>
      ) : (
        <p className="py-8 text-center text-xs font-medium text-[#6E5445]">No visitor data recorded</p>
      )}
    </Card>
  );
}
