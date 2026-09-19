import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { GlassCard } from '../common/GlassCard';
import { HistoricalPerformancePoint } from '../../types/portfolio';
import { formatCurrency } from '../../services/formatters';
import { LineChart as ChartIcon } from 'lucide-react';

interface PerformanceChartProps {
  data: HistoricalPerformancePoint[];
  baseCurrency: 'toman' | 'usd';
  privacyMode: boolean;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  baseCurrency,
  privacyMode,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point: HistoricalPerformancePoint = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-white/10">
          <p className="font-bold text-slate-300">{label}</p>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-amber-400 font-semibold">Portfolio Value:</span>
            <span className="font-bold text-white">
              {baseCurrency === 'toman'
                ? formatCurrency(point.total_value_toman, 'toman', privacyMode)
                : formatCurrency(point.total_value_usd, 'usd', privacyMode)}
            </span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-indigo-400 font-semibold">Invested Basis:</span>
            <span className="font-bold text-slate-300">
              {baseCurrency === 'toman'
                ? formatCurrency(point.total_invested_toman, 'toman', privacyMode)
                : formatCurrency(point.total_invested_toman / 92800, 'usd', privacyMode)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ChartIcon size={16} className="text-amber-400" />
          <h3 className="font-bold text-sm text-slate-200">Portfolio Growth Curve</h3>
        </div>
        <span className="text-xs text-slate-400">14-Day Trajectory</span>
      </div>

      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              hide={true}
              domain={['dataMin * 0.95', 'dataMax * 1.05']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={baseCurrency === 'toman' ? 'total_value_toman' : 'total_value_usd'}
              stroke="#f59e0b"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#valGrad)"
            />
            <Area
              type="monotone"
              dataKey="total_invested_toman"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#invGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
