import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { PriceTicker } from './components/layout/PriceTicker';
import { NetWorthCard } from './components/dashboard/NetWorthCard';
import { QuickStats } from './components/dashboard/QuickStats';
import { AllocationChart } from './components/dashboard/AllocationChart';
import { PerformanceChart } from './components/dashboard/PerformanceChart';
import { AssetList } from './components/assets/AssetList';
import { TransactionHistory, TxWithAsset } from './components/transactions/TransactionHistory';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { InstallPromptModal } from './components/common/InstallPromptModal';

import {
  fetchPortfolioSummary,
  fetchPortfolioPerformance,
  fetchAssets,
  fetchTransactions,
  fetchLatestPrices,
  fetchPriceStatus,
  refreshPrices,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from './services/api';

import { PortfolioSummary, CategoryAllocation, HistoricalPerformancePoint } from './types/portfolio';
import { Asset, Transaction, LatestPrice } from './types/database';
import { IngestionStatus } from './types/prices';
import { Smartphone, Palette, Settings as SettingsIcon } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [baseCurrency, setBaseCurrency] = useState<'toman' | 'usd'>(() => {
    return (localStorage.getItem('assetpulse_currency') as 'toman' | 'usd') || 'toman';
  });
  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    return localStorage.getItem('assetpulse_privacy') === 'true';
  });

  const [summary, setSummary] = useState<(PortfolioSummary & { allocations: CategoryAllocation[] }) | null>(null);
  const [performance, setPerformance] = useState<HistoricalPerformancePoint[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<TxWithAsset[]>([]);
  const [latestPrices, setLatestPrices] = useState<(LatestPrice & { symbol: string; name_en: string; name_fa: string; category: string })[]>([]);
  const [priceStatus, setPriceStatus] = useState<IngestionStatus | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TxWithAsset | null>(null);
  const [preselectedAssetId, setPreselectedAssetId] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      const [sumData, perfData, assetsData, txData, pricesData, statusData] = await Promise.all([
        fetchPortfolioSummary(),
        fetchPortfolioPerformance(),
        fetchAssets(),
        fetchTransactions(),
        fetchLatestPrices(),
        fetchPriceStatus(),
      ]);

      setSummary(sumData);
      setPerformance(perfData);
      setAssets(assetsData);
      setTransactions(txData);
      setLatestPrices(pricesData);
      setPriceStatus(statusData);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleToggleCurrency = () => {
    const next = baseCurrency === 'toman' ? 'usd' : 'toman';
    setBaseCurrency(next);
    localStorage.setItem('assetpulse_currency', next);
  };

  const handleTogglePrivacy = () => {
    const next = !privacyMode;
    setPrivacyMode(next);
    localStorage.setItem('assetpulse_privacy', String(next));
  };

  const handleManualRefreshPrices = async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshPrices();
      if (res.success) {
        showToast(`قیمت‌ها با ${res.data?.quotesCount || 0} داده جدید به‌روز شدند!`);
      } else {
        showToast('قیمت‌ها با کش انعطاف‌پذیر به‌روزرسانی شدند', 'success');
      }
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'خطا در دریافت نرخ‌های جدید', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTransactionSubmit = async (txData: any) => {
    try {
      if (txData.id) {
        await updateTransaction(txData.id, txData);
        showToast('تراکنش با موفقیت ویرایش و در پورتفوی اعمال شد!');
      } else {
        await createTransaction(txData);
        showToast('تراکنش جدید با موفقیت ثبت شد!');
      }
      setEditingTx(null);
      setIsAddTxOpen(false);
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'خطا در ثبت یا ویرایش تراکنش', 'error');
    }
  };

  const handleOpenEditTransaction = (tx: TxWithAsset) => {
    setEditingTx(tx);
    setPreselectedAssetId(tx.asset_id);
    setIsAddTxOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      showToast('تراکنش با موفقیت حذف شد و محاسبات پورتفوی به‌روز شد.');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف تراکنش', 'error');
    }
  };

  const handleOpenAddForAsset = (assetId: string) => {
    setEditingTx(null);
    setPreselectedAssetId(assetId);
    setIsAddTxOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100 selection:bg-amber-500 selection:text-dark-950 transition-colors duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center space-x-2 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 backdrop-blur-xl'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/40 backdrop-blur-xl'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        baseCurrency={baseCurrency}
        onToggleCurrency={handleToggleCurrency}
        privacyMode={privacyMode}
        onTogglePrivacy={handleTogglePrivacy}
        priceStatus={priceStatus}
        onRefreshPrices={handleManualRefreshPrices}
        isRefreshing={isRefreshing}
        onOpenAddTransaction={() => {
          setEditingTx(null);
          setPreselectedAssetId(undefined);
          setIsAddTxOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Rolling Price Ticker */}
      <PriceTicker
        prices={latestPrices}
        baseCurrency={baseCurrency}
        privacyMode={privacyMode}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-8">
        {/* Desktop Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {summary ? (
            <>
              {currentTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Top Net Worth Card */}
                  <NetWorthCard
                    summary={summary}
                    baseCurrency={baseCurrency}
                    privacyMode={privacyMode}
                  />

                  {/* Fast Insight Stats */}
                  <QuickStats
                    summary={summary}
                    baseCurrency={baseCurrency}
                    privacyMode={privacyMode}
                  />

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AllocationChart
                      allocations={summary.allocations || []}
                      baseCurrency={baseCurrency}
                      privacyMode={privacyMode}
                    />
                    <PerformanceChart
                      data={performance}
                      baseCurrency={baseCurrency}
                      privacyMode={privacyMode}
                    />
                  </div>

                  {/* Top Holdings Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        دارایی‌های سبد سرمایه‌گذاری (Core Asset Holdings)
                      </h3>
                      <button
                        onClick={() => setCurrentTab('assets')}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                      >
                        مشاهده همه دارایی‌ها ←
                      </button>
                    </div>

                    <AssetList
                      holdings={summary.holdings}
                      baseCurrency={baseCurrency}
                      privacyMode={privacyMode}
                      onAddTransactionForAsset={handleOpenAddForAsset}
                    />
                  </div>
                </div>
              )}

              {currentTab === 'assets' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-white">فهرست و ارزش‌گذاری دارایی‌ها</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      موقعیت لحظه‌ای و سود و زیان تجمیعی در طلا، سکه، ارزهای جهانی و رمزارزها.
                    </p>
                  </div>
                  <AssetList
                    holdings={summary.holdings}
                    baseCurrency={baseCurrency}
                    privacyMode={privacyMode}
                    onAddTransactionForAsset={handleOpenAddForAsset}
                  />
                </div>
              )}

              {currentTab === 'transactions' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-white">دفتر کل تراکنش‌ها (Ledger)</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        امکان ثبت، جستجو، ویرایش جزئیات و حذف قطعی تمام معاملات خرید و فروش.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingTx(null);
                        setPreselectedAssetId(undefined);
                        setIsAddTxOpen(true);
                      }}
                      className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                    >
                      + ثبت تراکنش جدید
                    </button>
                  </div>

                  <TransactionHistory
                    transactions={transactions}
                    baseCurrency={baseCurrency}
                    privacyMode={privacyMode}
                    onEditTransaction={handleOpenEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                  />
                </div>
              )}

              {currentTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-white">تنظیمات، شخصی‌سازی ظاهر و وب‌اپلیکیشن</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      پیکربندی رنگ‌های شاخص، تم OLED و مشکی عمیق، منابع قیمت و نصب روی گوشی.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Appearance & Themes card */}
                    <div className="p-6 rounded-3xl glass-panel space-y-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                          <Palette size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">شخصی‌سازی ظاهر و رنگ‌ها</h3>
                          <p className="text-[11px] text-slate-400">انتخاب پالت رنگ، تم تاریک OLED، شدت شیشه‌ای و چیدمان فشرده</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
                      >
                        تنظیم تم و رنگ‌بندی رابط کاربری
                      </button>
                    </div>

                    {/* Mobile PWA Install Card */}
                    <div className="p-6 rounded-3xl glass-panel space-y-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">نصب وب‌اپلیکیشن روی گوشی (PWA)</h3>
                          <p className="text-[11px] text-slate-400">نصب مستقیم روی صفحه اصلی آیفون و اندروید بدون نوار مرورگر</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsInstallModalOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs transition-all"
                      >
                        راهنما و نصب روی موبایل
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-slate-400 text-sm">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p>در حال بارگذاری اطلاعات دارایی‌ها و موتور AssetPulse...</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => {
          setIsAddTxOpen(false);
          setEditingTx(null);
        }}
        assets={assets}
        latestPrices={latestPrices}
        preselectedAssetId={preselectedAssetId}
        initialTransaction={editingTx}
        onSubmit={handleTransactionSubmit}
      />

      {/* Settings & UI Customization Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={priceStatus}
        onStatusChange={(newStatus) => setPriceStatus(newStatus)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* PWA Mobile Install Modal */}
      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstalled={() => {
          showToast('اپلیکیشن با موفقیت روی دستگاه شما نصب شد!');
        }}
      />
    </div>
  );
};
