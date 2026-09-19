import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { PortfolioSummary } from '../../types/portfolio';
import { formatCurrency, formatPercent } from '../../services/formatters';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight } from 'lucide-react';

interface NetWorthCardProps {
  summary: PortfolioSummary;
  baseCurrency: 'toman' | 'usd';
  privacyMode: boolean;
}

export const NetWorthCard: React.FC<NetWorthCardProps> = ({
  summary,
  baseCurrency,
  privacyMode,
}) => {
  const is24hUp = summary.change_24h_percent >= 0;
  const isUnrealizedUp = summary.unrealized_pnl_percent >= 0;

  return (
    <GlassCard glow="gold" className="relative overflow-hidden">
      {/* Subtle background gradient glow */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Wallet size={15} className="text-amber-400" />
            <span>Total Portfolio Net Worth</span>
          </div>

          <div className="flex items-baseline space-x-3">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
              {baseCurrency === 'toman'
                ? formatCurrency(summary.total_value_toman, 'toman', privacyMode)
                : formatCurrency(summary.total_value_usd, 'usd', privacyMode)}
            </h2>

            {/* 24h Change Badge */}
            <div
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                is24hUp
                  ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                  : 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
              }`}
            >
              {is24hUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{formatPercent(summary.change_24h_percent)} (24h)</span>
            </div>
          </div>

          {/* Secondary Currency Equivalent */}
          <div className="mt-2 text-sm text-slate-400 flex items-center space-x-2">
            <span>Equivalent:</span>
            <span className="font-semibold text-slate-200">
              {baseCurrency === 'toman'
                ? formatCurrency(summary.total_value_usd, 'usd', privacyMode)
                : formatCurrency(summary.total_value_toman, 'toman', privacyMode)}
            </span>
            <span className="text-xs text-slate-500">
              (1 USD ≈ {Math.round(summary.usd_toman_rate).toLocaleString()} تومان)
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
          {/* Invested */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[11px] text-slate-400">Total Invested</span>
            <span className="text-sm font-bold text-white mt-1">
              {baseCurrency === 'toman'
                ? formatCurrency(summary.total_invested_toman, 'toman', privacyMode)
                : formatCurrency(summary.total_invested_usd, 'usd', privacyMode)}
            </span>
          </div>

          {/* Unrealized PnL */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[11px] text-slate-400">Unrealized Profit</span>
            <span
              className={`text-sm font-bold mt-1 ${
                isUnrealizedUp ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {baseCurrency === 'toman'
                ? formatCurrency(summary.unrealized_pnl_toman, 'toman', privacyMode)
                : formatCurrency(summary.unrealized_pnl_usd, 'usd', privacyMode)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {formatPercent(summary.unrealized_pnl_percent)}
            </span>
          </div>

          {/* Realized PnL */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400">Realized PnL</span>
            <span
              className={`text-sm font-bold mt-1 ${
                summary.realized_pnl_toman >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {baseCurrency === 'toman'
                ? formatCurrency(summary.realized_pnl_toman, 'toman', privacyMode)
                : formatCurrency(summary.realized_pnl_usd, 'usd', privacyMode)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">from sold positions</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
