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
  Radio,
  Send,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Activity,
  Code
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: IngestionStatus | null;
  onStatusChange: (newStatus: IngestionStatus) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onStatusChange,
}) => {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Price Ingestion Pipeline & Settings" maxWidth="xl">
      <div className="space-y-6 text-xs text-slate-300">
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
    </Modal>
  );
};
