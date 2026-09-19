import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { PortfolioSummary } from '../../types/portfolio';
import { formatCurrency, formatPercent } from '../../services/formatters';
import { Layers, Award, Sparkles, CircleDollarSign } from 'lucide-react';

interface QuickStatsProps {
  summary: PortfolioSummary;
  baseCurrency: 'toman' | 'usd';
  privacyMode: boolean;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  summary,
  baseCurrency,
  privacyMode,
}) => {
  // Find top gainer by unrealized pnl %
  let topGainer = summary.holdings[0];
  for (const h of summary.holdings) {
    if (!topGainer || h.unrealized_pnl_percent > topGainer.unrealized_pnl_percent) {
      topGainer = h;
    }
  }

  // Calculate total gold equivalent weight held
  const goldHoldings = summary.holdings.filter((h) => h.asset.category === 'gold');
  const totalGoldVal = goldHoldings.reduce((sum, h) => sum + h.current_value_toman, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Stat 1: Total Active Positions */}
      <GlassCard className="p-4 flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Layers size={18} />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Tracked Assets</span>
          <span className="text-base font-bold text-white font-mono">
            {summary.asset_count} Active
          </span>
        </div>
      </GlassCard>

      {/* Stat 2: Top Gainer Position */}
      <GlassCard className="p-4 flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
          <Award size={18} />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Top Performer</span>
          <span className="text-base font-bold text-emerald-400 font-mono">
            {topGainer ? `${topGainer.asset.symbol} (${formatPercent(topGainer.unrealized_pnl_percent)})` : '—'}
          </span>
        </div>
      </GlassCard>

      {/* Stat 3: Precious Metals Total */}
      <GlassCard className="p-4 flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
          <Sparkles size={18} />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Gold & Coins Value</span>
          <span className="text-base font-bold text-amber-400 font-mono">
            {baseCurrency === 'toman'
              ? formatCurrency(totalGoldVal, 'toman', privacyMode)
              : formatCurrency(totalGoldVal / summary.usd_toman_rate, 'usd', privacyMode)}
          </span>
        </div>
      </GlassCard>

      {/* Stat 4: Market USD Benchmark */}
      <GlassCard className="p-4 flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
          <CircleDollarSign size={18} />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">USD Benchmark</span>
          <span className="text-base font-bold text-white font-mono">
            {Math.round(summary.usd_toman_rate).toLocaleString()} تومان
          </span>
        </div>
      </GlassCard>
    </div>
  );
};
