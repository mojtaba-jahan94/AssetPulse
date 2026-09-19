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
import { TransactionHistory } from './components/transactions/TransactionHistory';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
import { SettingsModal } from './components/settings/SettingsModal';

import {
  fetchPortfolioSummary,
  fetchPortfolioPerformance,
  fetchAssets,
  fetchTransactions,
  fetchLatestPrices,
  fetchPriceStatus,
  refreshPrices,
  createTransaction,
  deleteTransaction
} from './services/api';

import { PortfolioSummary, CategoryAllocation, HistoricalPerformancePoint } from './types/portfolio';
import { Asset, Transaction, LatestPrice } from './types/database';
import { IngestionStatus } from './types/prices';

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
  const [transactions, setTransactions] = useState<(Transaction & { symbol: string; name_en: string; name_fa: string; category: string })[]>([]);
  const [latestPrices, setLatestPrices] = useState<(LatestPrice & { symbol: string; name_en: string; name_fa: string; category: string })[]>([]);
  const [priceStatus, setPriceStatus] = useState<IngestionStatus | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [preselectedAssetId, setPreselectedAssetId] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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
        showToast(`Market prices updated via ${res.data?.quotesCount || 0} quotes!`);
      } else {
        showToast('Updated with resilient cache fallback', 'success');
      }
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Refresh failed', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddTransactionSubmit = async (txData: any) => {
    await createTransaction(txData);
    showToast('Transaction successfully recorded!');
    await loadAllData();
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    showToast('Transaction removed.');
    await loadAllData();
  };

  const handleOpenAddForAsset = (assetId: string) => {
    setPreselectedAssetId(assetId);
    setIsAddTxOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100 selection:bg-amber-500 selection:text-dark-950">
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
          setPreselectedAssetId(undefined);
          setIsAddTxOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
                        Core Asset Holdings
                      </h3>
                      <button
                        onClick={() => setCurrentTab('assets')}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                      >
                        View All Assets →
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
                    <h2 className="text-xl font-bold text-white">Asset Inventory & Valuations</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Real-time positions across Gold, Coins, Currencies, and Cryptocurrencies.
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
                  <div>
                    <h2 className="text-xl font-bold text-white">Transaction Ledger</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Offline-first audit record of all buys, sells, fees, and timestamps.
                    </p>
                  </div>
                  <TransactionHistory
                    transactions={transactions}
                    baseCurrency={baseCurrency}
                    privacyMode={privacyMode}
                    onDeleteTransaction={handleDeleteTransaction}
                  />
                </div>
              )}

              {currentTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-white">Price Ingestion Engine & System Config</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure your active scraping adapter, scheduled intervals, and inspect diagnostics.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl glass-panel space-y-4">
                    <p className="text-xs text-slate-300">
                      Manage price sources directly via the interactive controller modal:
                    </p>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
                    >
                      Open Pipeline Controller
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-slate-400 text-sm">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p>Connecting to AssetPulse Engine & SQLite Local Cache...</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        assets={assets}
        latestPrices={latestPrices}
        preselectedAssetId={preselectedAssetId}
        onSubmit={handleAddTransactionSubmit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={priceStatus}
        onStatusChange={(newStatus) => setPriceStatus(newStatus)}
      />
    </div>
  );
};
