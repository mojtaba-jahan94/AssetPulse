import React, { useState } from 'react';
import { AssetHolding } from '../../types/portfolio';
import { GlassCard } from '../common/GlassCard';
import { formatCurrency, formatNumber, formatPercent } from '../../services/formatters';
import {
  Coins,
  DollarSign,
  Bitcoin,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { clsx } from 'clsx';

interface AssetListProps {
  holdings: AssetHolding[];
  baseCurrency: 'toman' | 'usd';
  privacyMode: boolean;
  onAddTransactionForAsset: (assetId: string) => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  holdings,
  baseCurrency,
  privacyMode,
  onAddTransactionForAsset,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'gold' | 'fiat' | 'crypto'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHoldings = holdings.filter((h) => {
    const matchesCategory = activeCategory === 'all' || h.asset.category === activeCategory;
    const matchesSearch =
      h.asset.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.asset.name_fa.includes(searchQuery) ||
      h.asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gold':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'fiat':
        return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case 'crypto':
        return <Bitcoin className="w-5 h-5 text-indigo-400" />;
      default:
        return <Coins className="w-5 h-5 text-slate-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'gold':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'fiat':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'crypto':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-1 p-1 bg-dark-900 border border-white/10 rounded-2xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Holdings' },
            { id: 'gold', label: 'Gold & Coins' },
            { id: 'fiat', label: 'Currencies' },
            { id: 'crypto', label: 'Crypto' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                activeCategory === tab.id
                  ? 'bg-amber-500 text-dark-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets or symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Holdings Cards List */}
      {filteredHoldings.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-slate-400 text-sm">No asset holdings match your criteria.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredHoldings.map((h) => {
            const isProfit = h.unrealized_pnl_toman >= 0;
            return (
              <GlassCard
                key={h.asset.id}
                hoverEffect
                className="flex flex-col justify-between space-y-4"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
                      {getCategoryIcon(h.asset.category)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-white">{h.asset.name_fa}</h4>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getCategoryBadgeClass(
                            h.asset.category
                          )}`}
                        >
                          {h.asset.symbol}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{h.asset.name_en}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddTransactionForAsset(h.asset.id)}
                    title="Add buy/sell transaction"
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-dark-950 text-slate-300 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Values and Balance */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Holding Balance</span>
                    <span className="font-bold text-white text-sm font-mono">
                      {privacyMode ? '••••' : `${formatNumber(h.quantity, h.asset.decimals)} ${h.asset.unit}`}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Current Value</span>
                    <span className="font-bold text-amber-400 text-sm font-mono">
                      {baseCurrency === 'toman'
                        ? formatCurrency(h.current_value_toman, 'toman', privacyMode)
                        : formatCurrency(h.current_value_usd, 'usd', privacyMode)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Avg Buy Price (WAC)</span>
                    <span className="text-slate-300 font-mono">
                      {baseCurrency === 'toman'
                        ? formatCurrency(h.weighted_average_cost_toman, 'toman', privacyMode)
                        : formatCurrency(h.weighted_average_cost_usd, 'usd', privacyMode)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Live Market Price</span>
                    <span className="text-slate-300 font-mono">
                      {baseCurrency === 'toman'
                        ? formatCurrency(h.current_price_toman, 'toman', privacyMode)
                        : formatCurrency(h.current_price_usd, 'usd', privacyMode)}
                    </span>
                  </div>
                </div>

                {/* Footer PnL & Allocation */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-400 text-[11px]">Unrealized:</span>
                    <span
                      className={`font-bold inline-flex items-center ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                      {formatPercent(h.unrealized_pnl_percent)}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Portfolio Share: <strong className="text-slate-200">{h.allocation_percentage}%</strong>
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
