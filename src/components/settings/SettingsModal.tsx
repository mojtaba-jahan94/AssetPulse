import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { GlassCard } from '../common/GlassCard';
import { PriceSourceType, RefreshInterval, IngestionStatus } from '../../types/prices';
import {
  updatePriceSource,
  updateRefreshInterval,
  testPriceAdapters,
  parseTelegramPost
} from '../../services/api';
import {
  getStoredThemeConfig,
  applyThemeConfig,
  ThemeConfig,
  ACCENT_PALETTES,
  THEME_PRESETS,
  AccentColor,
  BackgroundTheme,
  GlassLevel,
  LayoutDensity,
  FontFamily
} from '../../services/themeManager';
import {
  Radio,
  Clock,
  CheckCircle2,
  Play,
  Activity,
  Code,
  Palette,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Eye
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: IngestionStatus | null;
  onStatusChange: (newStatus: IngestionStatus) => void;
  onOpenInstallModal?: () => void;
  onThemeChange?: (themeConfig: ThemeConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onStatusChange,
  onOpenInstallModal,
  onThemeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'pipeline'>('appearance');

  // Theme Settings State
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => getStoredThemeConfig());

  const updateTheme = (partial: Partial<ThemeConfig>) => {
    const updated = { ...themeConfig, ...partial };
    setThemeConfig(updated);
    applyThemeConfig(updated);
    if (onThemeChange) onThemeChange(updated);
  };

  // Price Ingestion State
  const [activeSource, setActiveSource] = useState<PriceSourceType>(
    status?.active_source || 'tgju'
  );
  const [interval, setInterval] = useState<RefreshInterval>(
    status?.refresh_interval || '5m'
  );
  const [testResults, setTestResults] = useState<Record<string, any> | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Telegram Live Regex Sandbox
  const [sampleTelegramPost, setSampleTelegramPost] = useState(
    `📢 نرخ لحظه‌ای بازار ارز و سکه تهران:
💵 دلار سبزه: ۹۲,۹۵۰ تومان
💶 یورو: ۱۰۰,۴۰۰ تومان
🇦🇪 درهم: ۲۵,۳۲۰ تومان
🪙 سکه امامی: ۵۴,۸۰۰,۰۰۰ تومان
🪙 نیم سکه: ۲۹,۳۰۰,۰۰۰ تومان
🪙 ربع سکه: ۱۸,۹۵۰,۰۰۰ تومان
✨ طلای ۱۸ عیار: ۴,۶۴۰,۰۰۰ تومان
🔥 مثقال آبشده: ۲۰,۱۰۰,۰۰۰ تومان
⚡ تتر: ۹۳,۴۰۰ تومان`
  );
  const [parsedTelegramRates, setParsedTelegramRates] = useState<Record<string, number> | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleSourceChange = async (src: PriceSourceType) => {
    setActiveSource(src);
    try {
      await updatePriceSource(src);
      if (status) {
        onStatusChange({ ...status, active_source: src });
      }
    } catch (err) {
      console.error('Failed to update source:', err);
    }
  };

  const handleIntervalChange = async (newInterval: RefreshInterval) => {
    setInterval(newInterval);
    try {
      await updateRefreshInterval(newInterval);
      if (status) {
        onStatusChange({ ...status, refresh_interval: newInterval });
      }
    } catch (err) {
      console.error('Failed to update interval:', err);
    }
  };

  const handleTestAdapters = async () => {
    try {
      setIsTesting(true);
      const results = await testPriceAdapters();
      setTestResults(results);
    } catch (err) {
      console.error('Diagnostic test failed:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestTelegramParse = async () => {
    try {
      setIsParsing(true);
      const result = await parseTelegramPost(sampleTelegramPost);
      setParsedTelegramRates(result);
    } catch (err) {
      console.error('Parse test failed:', err);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تنظیمات سامانه و شخصی‌سازی" maxWidth="xl">
      <div className="space-y-6 text-xs text-slate-300">
        {/* Top Tab Bar */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all text-xs ${
              activeTab === 'appearance'
                ? 'bg-amber-500 text-dark-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette size={15} />
            <span>شخصی‌سازی ظاهر و تم (Appearance)</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all text-xs ${
              activeTab === 'pipeline'
                ? 'bg-amber-500 text-dark-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio size={15} />
            <span>خط دریافت قیمت‌ها (Data Feeds)</span>
          </button>
        </div>

        {/* ================= TAB 1: APPEARANCE & UI ================= */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Section 1: Accent Colors */}
            <div>
              <h4 className="text-sm font-bold text-white mb-1.5 flex items-center space-x-2">
                <Sparkles size={16} className="text-amber-400" />
                <span>رنگ شاخص و هایلایت‌ها (Accent Color)</span>
              </h4>
              <p className="text-slate-400 mb-3 text-[11px]">
                رنگ اصلی دکمه‌ها، آیکون‌ها، نمودارها، و هایلایت‌های پورتفوی را انتخاب کنید:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.entries(ACCENT_PALETTES) as [AccentColor, typeof ACCENT_PALETTES[AccentColor]][]).map(
                  ([key, pal]) => {
                    const isSelected = themeConfig.accent === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateTheme({ accent: key })}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-white/40 bg-white/[0.07] shadow-lg'
                            : 'border-white/10 bg-dark-900/80 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span
                            className="w-4 h-4 rounded-full shadow-md shrink-0"
                            style={{ backgroundColor: pal.primary }}
                          />
                          <div>
                            <span className="block font-bold text-white text-[11px]">{pal.name_fa}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{pal.name_en}</span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Section 2: Background Themes */}
            <div className="pt-3 border-t border-white/10">
              <h4 className="text-sm font-bold text-white mb-1.5 flex items-center space-x-2">
                <Moon size={16} className="text-amber-400" />
                <span>پوسته و تم پس‌زمینه (Background Theme)</span>
              </h4>
              <p className="text-slate-400 mb-3 text-[11px]">
                حالت مناسب دستگاه خود را انتخاب کنید (مشکی خالص OLED برای صرفه‌جویی شدید باتری در گوشی):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.entries(THEME_PRESETS) as [BackgroundTheme, typeof THEME_PRESETS[BackgroundTheme]][]).map(
                  ([key, preset]) => {
                    const isSelected = themeConfig.theme === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateTheme({ theme: key })}
                        className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 shadow-md'
                            : 'border-white/10 bg-dark-900/80 hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-3.5 h-3.5 rounded-md border border-white/20"
                              style={{ backgroundColor: preset.bgHex }}
                            />
                            <span className="font-bold text-white text-xs">{preset.name_fa}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{preset.desc}</p>
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Section 3: Glassmorphism & Layout Density */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Glass Level */}
              <div>
                <h5 className="font-bold text-white text-xs mb-1.5">شدت افکت شیشه‌ای (Glassmorphism)</h5>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-dark-900 border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => updateTheme({ glass: 'vision' })}
                    className={`py-1.5 rounded-lg font-medium text-[11px] transition-all ${
                      themeConfig.glass === 'vision' ? 'bg-amber-500 text-dark-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    بلور قوی (Vision)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTheme({ glass: 'subtle' })}
                    className={`py-1.5 rounded-lg font-medium text-[11px] transition-all ${
                      themeConfig.glass === 'subtle' ? 'bg-amber-500 text-dark-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    متعادل
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTheme({ glass: 'flat' })}
                    className={`py-1.5 rounded-lg font-medium text-[11px] transition-all ${
                      themeConfig.glass === 'flat' ? 'bg-amber-500 text-dark-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    مات (سریع)
                  </button>
                </div>
              </div>

              {/* Layout Density */}
              <div>
                <h5 className="font-bold text-white text-xs mb-1.5">تراکم چیدمان (Layout Density)</h5>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-dark-900 border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => updateTheme({ density: 'normal' })}
                    className={`py-1.5 rounded-lg font-medium text-[11px] transition-all ${
                      themeConfig.density === 'normal' ? 'bg-amber-500 text-dark-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    استاندارد (راحت)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTheme({ density: 'compact' })}
                    className={`py-1.5 rounded-lg font-medium text-[11px] transition-all ${
                      themeConfig.density === 'compact' ? 'bg-amber-500 text-dark-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    فشرده (نمایش بیشتر در موبایل)
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Font & Digits */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Font Family */}
              <div>
                <h5 className="font-bold text-white text-xs mb-1.5">فونت و قلم (Typography)</h5>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-dark-900 border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => updateTheme({ font: 'vazirmatn' })}
                    className={`py-1.5 rounded-lg font-medium text-[11px] transition-all ${
                      themeConfig.font === 'vazirmatn' ? 'bg-amber-500 text-dark-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    وزیرمتن (فارسی)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTheme({ font: 'inter' })}
                    className={`py-1.5 rounded-lg font-medium text-[11px] transition-all ${
                      themeConfig.font === 'inter' ? 'bg-amber-500 text-dark-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Inter (بین‌المللی)
                  </button>
                </div>
              </div>

              {/* PWA Direct Installation Card */}
              <div>
                <h5 className="font-bold text-white text-xs mb-1.5">وب‌اپلیکیشن موبایل (PWA)</h5>
                {onOpenInstallModal && (
                  <button
                    type="button"
                    onClick={onOpenInstallModal}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-brand-500/20 hover:from-amber-500/30 hover:to-brand-500/30 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                  >
                    <Smartphone size={15} />
                    <span>راهنما و دکمه نصب روی گوشی</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRICE PIPELINE ================= */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Section 1: Active Ingestion Adapter Selector */}
            <div>
              <h4 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                <Radio size={16} className="text-amber-400" />
                <span>Active Price Source Adapter</span>
              </h4>
              <p className="text-slate-400 mb-3 text-[11px]">
                Select which pipeline source acts as the primary feed for precious metals and fiat rates:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Adapter A: TGJU */}
                <button
                  type="button"
                  onClick={() => handleSourceChange('tgju')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    activeSource === 'tgju'
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-dark-900 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Adapter A: TGJU</span>
                      {activeSource === 'tgju' && (
                        <CheckCircle2 size={15} className="text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Scrapes official Tehran Gold & Jewelry Union website with anti-ban delay.
                    </p>
                  </div>
                  <span className="inline-block mt-3 text-[10px] font-bold text-amber-400 uppercase">
                    Web Scraper / API
                  </span>
                </button>

                {/* Adapter B: Telegram */}
                <button
                  type="button"
                  onClick={() => handleSourceChange('telegram')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    activeSource === 'telegram'
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-dark-900 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Adapter B: Telegram</span>
                      {activeSource === 'telegram' && (
                        <CheckCircle2 size={15} className="text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Parses real-time market signals from Telegram channels via regex.
                    </p>
                  </div>
                  <span className="inline-block mt-3 text-[10px] font-bold text-amber-400 uppercase">
                    Regex Signal Scraper
                  </span>
                </button>

                {/* Adapter C: Crypto */}
                <button
                  type="button"
                  onClick={() => handleSourceChange('crypto_api')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    activeSource === 'crypto_api'
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-dark-900 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Adapter C: Crypto APIs</span>
                      {activeSource === 'crypto_api' && (
                        <CheckCircle2 size={15} className="text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Binance 24hr Tickers & CoinGecko fallback with Toman cross-conversion.
                    </p>
                  </div>
                  <span className="inline-block mt-3 text-[10px] font-bold text-amber-400 uppercase">
                    Direct WebSocket/REST
                  </span>
                </button>
              </div>
            </div>

            {/* Section 2: Refresh Interval Scheduler */}
            <div className="pt-2 border-t border-white/10">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                <Clock size={16} className="text-amber-400" />
                <span>Scheduled Refresh Interval</span>
              </h4>
              <p className="text-slate-400 mb-3 text-[11px]">
                Automated background polling cadence with zero-latency local caching:
              </p>

              <div className="grid grid-cols-5 gap-2">
                {(['manual', '1m', '5m', '15m', '1h'] as RefreshInterval[]).map((int) => (
                  <button
                    key={int}
                    type="button"
                    onClick={() => handleIntervalChange(int)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      interval === int
                        ? 'bg-amber-500 text-dark-950 font-bold border-amber-400 shadow-sm'
                        : 'bg-dark-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {int === 'manual' ? 'Manual' : `Every ${int}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Telegram Regex Sandbox / Live Tester */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Code size={16} className="text-amber-400" />
                  <span>Telegram Regex Parser Sandbox</span>
                </h4>
                <button
                  onClick={handleTestTelegramParse}
                  disabled={isParsing}
                  className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all text-xs"
                >
                  <Play size={12} />
                  <span>{isParsing ? 'Parsing...' : 'Test Regex'}</span>
                </button>
              </div>
              <p className="text-slate-400 mb-2 text-[11px]">
                Paste any Telegram channel post or signal to verify Persian & English price extraction:
              </p>

              <textarea
                value={sampleTelegramPost}
                onChange={(e) => setSampleTelegramPost(e.target.value)}
                rows={5}
                className="w-full bg-dark-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
              />

              {parsedTelegramRates && (
                <div className="mt-3 p-3 rounded-xl bg-dark-900/90 border border-emerald-500/20">
                  <span className="font-bold text-emerald-400 block mb-2 text-xs">
                    Parsed {Object.keys(parsedTelegramRates).length} Assets Successfully:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(parsedTelegramRates).map(([assetId, rate]) => (
                      <div key={assetId} className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-slate-400 block text-[10px]">{assetId}</span>
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {rate.toLocaleString()} تومان
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: System Diagnostic Connection Test */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Activity size={16} className="text-emerald-400" />
                  <span>Pipeline Health Diagnostics</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Verify network connectivity and latency across all 3 ingestion adapters.
                </p>
              </div>
              <button
                onClick={handleTestAdapters}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all text-xs"
              >
                {isTesting ? 'Running Ping...' : 'Run Diagnostics'}
              </button>
            </div>

            {testResults && (
              <div className="p-3 rounded-2xl bg-dark-900 border border-white/10 space-y-2">
                {Object.entries(testResults).map(([key, result]) => (
                  <div key={key} className="flex items-center justify-between py-1 px-2 text-xs">
                    <span className="font-bold uppercase text-slate-300">{key}:</span>
                    <span
                      className={`font-semibold ${
                        result.success ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.success
                        ? `Operational (${result.latency_ms || 120}ms latency)`
                        : `Unavailable: ${result.message || 'Timeout'}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
