import React, { useState, useEffect } from 'react';
import { LatestPrice, Asset } from '../../types/database';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { formatCurrency, formatPercent } from '../../services/formatters';
import {
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Plus,
  Coins,
  DollarSign,
  Euro,
  Banknote,
  Bitcoin,
  CircleDollarSign,
  BadgePercent,
  Zap,
  Layers,
  Sparkles,
  Flame,
  LayoutGrid,
  List,
  Check,
  RotateCcw,
  CheckSquare,
  Square
} from 'lucide-react';
import { clsx } from 'clsx';

export type LatestPriceWithAsset = LatestPrice & {
  symbol: string;
  name_en: string;
  name_fa: string;
  category: string;
  icon?: string;
};

interface DashboardPricePanelProps {
  prices: LatestPriceWithAsset[];
  baseCurrency: 'toman' | 'usd';
  privacyMode: boolean;
  onAddTransactionForAsset: (assetId: string) => void;
}

const STORAGE_KEY_PINNED_PRICES = 'assetpulse_dashboard_price_pins';
const STORAGE_KEY_PRICE_VIEW_MODE = 'assetpulse_price_view_mode';

const DEFAULT_PINNED_IDS = [
  'gold_emami',
  'gold_18k',
  'gold_melted',
  'fiat_usd',
  'fiat_eur',
  'fiat_aed',
  'crypto_usdt',
  'crypto_btc',
  'crypto_eth',
  'crypto_sol'
];

export const DashboardPricePanel: React.FC<DashboardPricePanelProps> = ({
  prices,
  baseCurrency,
  privacyMode,
  onAddTransactionForAsset,
}) => {
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PINNED_PRICES);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_PINNED_IDS;
  });

  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    return (localStorage.getItem(STORAGE_KEY_PRICE_VIEW_MODE) as 'grid' | 'table') || 'grid';
  });

  const [activeCategory, setActiveCategory] = useState<'all' | 'gold' | 'fiat' | 'crypto'>('all');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Save pinned IDs on change
  const handleTogglePin = (assetId: string) => {
    let next: string[];
    if (pinnedIds.includes(assetId)) {
      next = pinnedIds.filter((id) => id !== assetId);
    } else {
      next = [...pinnedIds, assetId];
    }
    setPinnedIds(next);
    localStorage.setItem(STORAGE_KEY_PINNED_PRICES, JSON.stringify(next));
  };

  const handleSelectAll = () => {
    const allIds = prices.map((p) => p.asset_id);
    setPinnedIds(allIds);
    localStorage.setItem(STORAGE_KEY_PINNED_PRICES, JSON.stringify(allIds));
  };

  const handleDeselectAll = () => {
    setPinnedIds([]);
    localStorage.setItem(STORAGE_KEY_PINNED_PRICES, JSON.stringify([]));
  };

  const handleResetDefaults = () => {
    setPinnedIds(DEFAULT_PINNED_IDS);
    localStorage.setItem(STORAGE_KEY_PINNED_PRICES, JSON.stringify(DEFAULT_PINNED_IDS));
  };

  const handleToggleViewMode = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY_PRICE_VIEW_MODE, mode);
  };

  // Filter visible prices for display on dashboard
  const displayedPrices = prices.filter((p) => {
    const isPinned = pinnedIds.includes(p.asset_id);
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    return isPinned && matchesCat;
  });

  const getAssetIcon = (iconName?: string, category?: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'Coins':
        return <Coins className="w-4 h-4 text-amber-400" />;
      case 'DollarSign':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'Euro':
        return <Euro className="w-4 h-4 text-emerald-400" />;
      case 'Banknote':
        return <Banknote className="w-4 h-4 text-emerald-400" />;
      case 'Bitcoin':
        return <Bitcoin className="w-4 h-4 text-indigo-400" />;
      case 'CircleDollarSign':
        return <CircleDollarSign className="w-4 h-4 text-indigo-400" />;
      case 'BadgePercent':
        return <BadgePercent className="w-4 h-4 text-teal-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-yellow-400" />;
      default:
        if (category === 'gold') return <Coins className="w-4 h-4 text-amber-400" />;
        if (category === 'fiat') return <DollarSign className="w-4 h-4 text-emerald-400" />;
        if (category === 'crypto') return <Bitcoin className="w-4 h-4 text-indigo-400" />;
        return <Coins className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <h3 className="text-base font-bold text-white tracking-tight">
            تابلو و نرخ‌های لحظه‌ای بازار (Live Market Watchlist)
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
            {displayedPrices.length} نرخ برگزیده
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1 p-1 bg-dark-900 border border-white/10 rounded-xl text-xs overflow-x-auto">
            {[
              { id: 'all', label: 'همه' },
              { id: 'gold', label: 'طلا و سکه' },
              { id: 'fiat', label: 'ارزها' },
              { id: 'crypto', label: 'کریپتو' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                  activeCategory === tab.id
                    ? 'bg-amber-500 text-dark-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid / Table View Mode Toggle */}
          <div className="flex items-center p-1 bg-dark-900 border border-white/10 rounded-xl">
            <button
              onClick={() => handleToggleViewMode('grid')}
              title="نمایش کارتی"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => handleToggleViewMode('table')}
              title="نمایش جدولی فشرده"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List size={15} />
            </button>
          </div>

          {/* Customize Button */}
          <button
            onClick={() => setIsCustomizeOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all shadow-sm"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">شخصی‌سازی نرخ‌ها</span>
            <span className="sm:hidden">تنظیم</span>
          </button>
        </div>
      </div>

      {/* Main Prices Display */}
      {displayedPrices.length === 0 ? (
        <GlassCard className="p-8 text-center space-y-3">
          <p className="text-slate-400 text-sm">
            در این دسته‌بندی هیچ نرخی برای نمایش انتخاب نشده است.
          </p>
          <button
            onClick={() => setIsCustomizeOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-md transition-all inline-flex items-center space-x-1.5"
          >
            <SlidersHorizontal size={14} />
            <span>انتخاب نرخ‌های دلخواه برای نمایش</span>
          </button>
        </GlassCard>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {displayedPrices.map((p) => {
            const isUp = p.change_24h >= 0;
            return (
              <GlassCard
                key={p.asset_id}
                hoverEffect
                className="p-3.5 flex flex-col justify-between space-y-2.5 relative group"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-xl bg-white/[0.04] border border-white/5">
                      {getAssetIcon(p.icon, p.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs truncate max-w-[90px] sm:max-w-[110px]" title={p.name_fa}>
                        {p.name_fa}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono block">{p.symbol}</span>
                    </div>
                  </div>

                  {/* Add transaction quick button */}
                  <button
                    onClick={() => onAddTransactionForAsset(p.asset_id)}
                    title={`ثبت معامله ${p.name_fa}`}
                    className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Rates */}
                <div className="space-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono font-extrabold text-sm text-amber-400">
                      {baseCurrency === 'toman'
                        ? formatCurrency(p.price_toman, 'toman', privacyMode)
                        : formatCurrency(p.price_usd, 'usd', privacyMode)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      {baseCurrency === 'toman'
                        ? formatCurrency(p.price_usd, 'usd', privacyMode)
                        : formatCurrency(p.price_toman, 'toman', privacyMode)}
                    </span>

                    <span
                      className={`inline-flex items-center font-bold text-[10px] px-1.5 py-0.2 rounded-md ${
                        isUp
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isUp ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                      {formatPercent(p.change_24h)}
                    </span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <GlassCard className="overflow-x-auto p-0 border border-white/10">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-2.5 px-4">دارایی</th>
                <th className="py-2.5 px-4">قیمت (تومان)</th>
                <th className="py-2.5 px-4">قیمت (دلار)</th>
                <th className="py-2.5 px-4">تغییر ۲۴ ساعته</th>
                <th className="py-2.5 px-4 text-center">معامله</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {displayedPrices.map((p) => {
                const isUp = p.change_24h >= 0;
                return (
                  <tr key={p.asset_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-4 whitespace-nowrap font-sans font-bold text-white flex items-center space-x-2">
                      <div className="p-1 rounded-lg bg-white/5">
                        {getAssetIcon(p.icon, p.category)}
                      </div>
                      <span>{p.name_fa}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({p.symbol})</span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-amber-400 font-bold">
                      {formatCurrency(p.price_toman, 'toman', privacyMode)}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-300">
                      {formatCurrency(p.price_usd, 'usd', privacyMode)}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full ${
                          isUp
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isUp ? <TrendingUp size={11} className="mr-0.5" /> : <TrendingDown size={11} className="mr-0.5" />}
                        {formatPercent(p.change_24h)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-center font-sans">
                      <button
                        onClick={() => onAddTransactionForAsset(p.asset_id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500 hover:text-dark-950 text-slate-300 text-[11px] font-semibold transition-colors inline-flex items-center space-x-1"
                      >
                        <Plus size={12} />
                        <span>معامله</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}

      {/* Customization Modal */}
      <Modal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        title="شخصی‌سازی نرخ‌های نمایشی در داشبورد"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            دارایی‌ها و نرخ‌هایی را که مایلید روی تابلوی قیمت داشبورد نمایش داده شوند، علامت بزنید:
          </p>

          {/* Quick selection bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-dark-900 border border-white/10">
            <span className="font-bold text-white text-xs">
              تعداد انتخاب شده: <strong className="text-amber-400">{pinnedIds.length}</strong> از {prices.length}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
              >
                انتخاب همه
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white text-[11px] font-medium transition-colors"
              >
                حذف همه
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold transition-colors inline-flex items-center space-x-1"
              >
                <RotateCcw size={12} />
                <span>حالت پیش‌فرض</span>
              </button>
            </div>
          </div>

          {/* List of all assets with checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {prices.map((p) => {
              const isChecked = pinnedIds.includes(p.asset_id);
              return (
                <button
                  key={p.asset_id}
                  type="button"
                  onClick={() => handleTogglePin(p.asset_id)}
                  className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isChecked
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-sm ring-1 ring-amber-500/30'
                      : 'bg-dark-900/80 border-white/10 hover:border-white/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="p-1.5 rounded-xl bg-white/5 shrink-0">
                      {getAssetIcon(p.icon, p.category)}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-white text-xs block truncate">{p.name_fa}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {p.name_en} ({p.symbol})
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 mr-2">
                    {isChecked ? (
                      <div className="w-5 h-5 rounded-md bg-amber-500 text-dark-950 flex items-center justify-center font-bold">
                        <Check size={13} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border border-white/20 bg-dark-950" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsCustomizeOpen(false)}
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-md transition-all"
            >
              تایید و اعمال در داشبورد
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
