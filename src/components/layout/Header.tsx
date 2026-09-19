import React from 'react';
import {
  Wallet,
  RefreshCw,
  Eye,
  EyeOff,
  PlusCircle,
  Settings as SettingsIcon,
  Radio
} from 'lucide-react';
import { IngestionStatus } from '../../types/prices';

interface HeaderProps {
  baseCurrency: 'toman' | 'usd';
  onToggleCurrency: () => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  priceStatus: IngestionStatus | null;
  onRefreshPrices: () => void;
  isRefreshing: boolean;
  onOpenAddTransaction: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  baseCurrency,
  onToggleCurrency,
  privacyMode,
  onTogglePrivacy,
  priceStatus,
  onRefreshPrices,
  isRefreshing,
  onOpenAddTransaction,
  onOpenSettings,
}) => {
  const getSourceLabel = (src?: string) => {
    if (src === 'tgju') return 'TGJU Live';
    if (src === 'telegram') return 'Telegram Feed';
    if (src === 'crypto_api') return 'Binance / Public';
    return 'TGJU';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-dark-950/80 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AssetPulse
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Portfolio Intelligence & Multi-Asset Hub
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Active Price Source Badge & Refresh */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Source:</span>
            <span className="font-semibold text-slate-200">
              {getSourceLabel(priceStatus?.active_source)}
            </span>
            <button
              onClick={onRefreshPrices}
              disabled={isRefreshing}
              title="Sync latest market rates"
              className="p-1 hover:text-white text-slate-400 hover:bg-white/10 rounded-lg transition-colors ml-1"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-brand-500' : ''} />
            </button>
          </div>

          {/* Currency Toggle */}
          <button
            onClick={onToggleCurrency}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-dark-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 transition-all shadow-sm"
          >
            <span className={baseCurrency === 'toman' ? 'text-amber-400 font-bold' : 'text-slate-400'}>
              تومان
            </span>
            <span className="text-slate-600">/</span>
            <span className={baseCurrency === 'usd' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              USD
            </span>
          </button>

          {/* Privacy Toggle */}
          <button
            onClick={onTogglePrivacy}
            title={privacyMode ? 'Show Balances' : 'Hide Balances (Privacy Mode)'}
            className="p-2 rounded-xl bg-dark-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-colors"
          >
            {privacyMode ? <EyeOff size={16} className="text-amber-400" /> : <Eye size={16} />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Configure Price Ingestion & App Settings"
            className="p-2 rounded-xl bg-dark-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <SettingsIcon size={16} />
          </button>

          {/* Add Transaction Primary Button */}
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-dark-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <PlusCircle size={15} />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
