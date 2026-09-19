import React from 'react';
import { LatestPrice } from '../../types/database';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../services/formatters';

interface PriceTickerProps {
  prices: (LatestPrice & { symbol: string; name_en: string; name_fa: string; category: string })[];
  baseCurrency: 'toman' | 'usd';
  privacyMode: boolean;
}

export const PriceTicker: React.FC<PriceTickerProps> = ({
  prices,
  baseCurrency,
  privacyMode,
}) => {
  if (!prices || prices.length === 0) return null;

  // Duplicate list to create a seamless infinite scroll loop
  const displayPrices = [...prices, ...prices];

  return (
    <div className="w-full bg-dark-900/90 border-y border-white/5 py-2.5 overflow-hidden select-none">
      <div className="animate-ticker flex items-center space-x-8">
        {displayPrices.map((item, index) => {
          const isUp = (item.change_24h || 0) >= 0;
          return (
            <div
              key={`${item.asset_id}-${index}`}
              className="flex items-center space-x-2.5 px-3 py-1 rounded-full glass-pill text-xs whitespace-nowrap hover:bg-white/10 transition-colors"
            >
              <span className="font-semibold text-slate-200">{item.name_fa}</span>
              <span className="text-slate-400 font-mono">({item.symbol})</span>
              <span className="font-medium text-white">
                {baseCurrency === 'toman'
                  ? formatCurrency(item.price_toman, 'toman', privacyMode)
                  : formatCurrency(item.price_usd, 'usd', privacyMode)}
              </span>
              <span
                className={`flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                  isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {isUp ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                {formatPercent(item.change_24h || 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
