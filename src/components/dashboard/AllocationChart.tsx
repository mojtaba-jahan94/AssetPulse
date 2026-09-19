import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { GlassCard } from '../common/GlassCard';
import { CategoryAllocation } from '../../types/portfolio';
import { formatCurrency } from '../../services/formatters';
import { PieChart as PieIcon } from 'lucide-react';

interface AllocationChartProps {
  allocations: CategoryAllocation[];
  baseCurrency: 'toman' | 'usd';
  privacyMode: boolean;
}

export const AllocationChart: React.FC<AllocationChartProps> = ({
  allocations,
  baseCurrency,
  privacyMode,
}) => {
  const activeAllocations = allocations.filter((a) => a.percentage > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: CategoryAllocation = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-xl shadow-xl text-xs space-y-1 border border-white/10">
          <p className="font-bold text-white flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: data.color }}
            />
            <span>{data.label}</span>
          </p>
          <p className="text-slate-300">
            {baseCurrency === 'toman'
              ? formatCurrency(data.value_toman, 'toman', privacyMode)
              : formatCurrency(data.value_usd, 'usd', privacyMode)}
          </p>
          <p className="text-amber-400 font-bold">{data.percentage}% of Portfolio</p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <PieIcon size={16} className="text-amber-400" />
          <h3 className="font-bold text-sm text-slate-200">Asset Allocation</h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Donut Chart */}
        <div className="w-full sm:w-1/2 h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeAllocations}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="percentage"
              >
                {activeAllocations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List */}
        <div className="w-full sm:w-1/2 space-y-2.5">
          {activeAllocations.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
            >
              <div className="flex items-center space-x-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-300">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-white mr-1.5">{item.percentage}%</span>
                <span className="text-[11px] text-slate-400">
                  (
                  {baseCurrency === 'toman'
                    ? formatCurrency(item.value_toman, 'toman', privacyMode)
                    : formatCurrency(item.value_usd, 'usd', privacyMode)}
                  )
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};
