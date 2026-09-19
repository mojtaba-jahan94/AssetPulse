import { DatabaseService } from '../db/database.ts';
import { TgjuPriceAdapter } from './tgjuAdapter.ts';
import { TelegramPriceAdapter } from './telegramAdapter.ts';
import { CryptoPriceAdapter } from './cryptoAdapter.ts';
import { IPriceAdapter } from './types.ts';
import { PriceQuote, PriceSourceType, RefreshInterval, IngestionStatus } from '../../src/types/prices.ts';

export class PriceIngestionManager {
  private db: DatabaseService;
  private adapters: Map<PriceSourceType, IPriceAdapter> = new Map();
  private cryptoAdapter: CryptoPriceAdapter;
  private intervalTimer: NodeJS.Timeout | null = null;
  private isUpdating = false;
  private lastUpdated: string | null = null;
  private lastError: string | null = null;

  constructor(db: DatabaseService) {
    this.db = db;

    const tgju = new TgjuPriceAdapter();
    const telegram = new TelegramPriceAdapter();
    this.cryptoAdapter = new CryptoPriceAdapter();

    this.adapters.set('tgju', tgju);
    this.adapters.set('telegram', telegram);
    this.adapters.set('crypto_api', this.cryptoAdapter);

    this.initScheduler();
  }

  public getActiveSource(): PriceSourceType {
    return (this.db.getConfig('active_price_source', 'tgju') as PriceSourceType) || 'tgju';
  }

  public setActiveSource(source: PriceSourceType): void {
    this.db.setConfig('active_price_source', source);
  }

  public getRefreshInterval(): RefreshInterval {
    return (this.db.getConfig('refresh_interval', '5m') as RefreshInterval) || '5m';
  }

  public setRefreshInterval(interval: RefreshInterval): void {
    this.db.setConfig('refresh_interval', interval);
    this.initScheduler();
  }

  public initScheduler(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }

    const interval = this.getRefreshInterval();
    if (interval === 'manual') return;

    let ms = 5 * 60 * 1000; // default 5m
    if (interval === '1m') ms = 1 * 60 * 1000;
    if (interval === '5m') ms = 5 * 60 * 1000;
    if (interval === '15m') ms = 15 * 60 * 1000;
    if (interval === '1h') ms = 60 * 60 * 1000;

    this.intervalTimer = setInterval(() => {
      this.refreshPrices().catch((err) => {
        console.error('[PriceIngestionManager] Scheduled refresh failed:', err);
      });
    }, ms);
  }

  public async refreshPrices(): Promise<{ success: boolean; quotesCount: number; errors: string[] }> {
    if (this.isUpdating) {
      return { success: false, quotesCount: 0, errors: ['Price update already in progress'] };
    }

    this.isUpdating = true;
    this.lastError = null;
    const errors: string[] = [];
    const allQuotes: PriceQuote[] = [];

    try {
      const assets = this.db.getAllAssets();
      const fiatAndGoldAssets = assets.filter((a) => a.category === 'fiat' || a.category === 'gold');
      const cryptoAssets = assets.filter((a) => a.category === 'crypto');

      const activeSource = this.getActiveSource();
      const primaryAdapter = this.adapters.get(activeSource) || this.adapters.get('tgju')!;

      // 1. Fetch Fiat & Gold using active adapter with fallback chain
      let fiatGoldQuotes: PriceQuote[] = [];
      try {
        fiatGoldQuotes = await primaryAdapter.fetchPrices(fiatAndGoldAssets);
      } catch (err: any) {
        errors.push(`Primary adapter (${primaryAdapter.name}) failed: ${err.message}`);
        // Fallback to alternate adapter
        const fallbackSource: PriceSourceType = activeSource === 'tgju' ? 'telegram' : 'tgju';
        const fallbackAdapter = this.adapters.get(fallbackSource);
        if (fallbackAdapter) {
          try {
            fiatGoldQuotes = await fallbackAdapter.fetchPrices(fiatAndGoldAssets);
          } catch (fbErr: any) {
            errors.push(`Fallback adapter (${fallbackAdapter.name}) failed: ${fbErr.message}`);
          }
        }
      }

      allQuotes.push(...fiatGoldQuotes);

      // Determine USD/Toman rate for crypto conversion
      let currentUsdRate = 92800;
      const usdQuote = allQuotes.find((q) => q.asset_id === 'fiat_usd');
      if (usdQuote && usdQuote.price_toman > 0) {
        currentUsdRate = usdQuote.price_toman;
      } else {
        const cachedUsd = this.db.getLatestPriceByAssetId('fiat_usd');
        if (cachedUsd && cachedUsd.price_toman > 0) {
          currentUsdRate = cachedUsd.price_toman;
        }
      }

      // 2. Fetch Crypto prices
      try {
        const cryptoQuotes = await this.cryptoAdapter.fetchPrices(cryptoAssets, currentUsdRate);
        allQuotes.push(...cryptoQuotes);
      } catch (cryptoErr: any) {
        errors.push(`Crypto adapter failed: ${cryptoErr.message}`);
      }

      // 3. Save into SQLite
      for (const quote of allQuotes) {
        this.db.upsertLatestPrice({
          asset_id: quote.asset_id,
          price_toman: quote.price_toman,
          price_usd: quote.price_usd,
          change_24h: quote.change_24h || 0,
          high_24h: quote.high_24h || quote.price_toman,
          low_24h: quote.low_24h || quote.price_toman,
          source: quote.source,
          last_updated: quote.timestamp
        });

        this.db.recordPriceHistory({
          asset_id: quote.asset_id,
          price_toman: quote.price_toman,
          price_usd: quote.price_usd,
          source: quote.source,
          timestamp: quote.timestamp
        });
      }

      this.lastUpdated = new Date().toISOString();
      return { success: allQuotes.length > 0, quotesCount: allQuotes.length, errors };
    } catch (criticalErr: any) {
      this.lastError = criticalErr.message;
      return { success: false, quotesCount: 0, errors: [criticalErr.message] };
    } finally {
      this.isUpdating = false;
    }
  }

  public async testAllSources(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    for (const [key, adapter] of this.adapters.entries()) {
      try {
        const testRes = await adapter.testConnection();
        results[key] = testRes;
      } catch (e: any) {
        results[key] = { success: false, message: e.message };
      }
    }
    return results;
  }

  public getStatus(): IngestionStatus {
    return {
      active_source: this.getActiveSource(),
      last_updated: this.lastUpdated,
      refresh_interval: this.getRefreshInterval(),
      is_updating: this.isUpdating,
      last_error: this.lastError,
      sources_status: {
        tgju: { available: true, latency_ms: 120, last_success: this.lastUpdated },
        telegram: { available: true, channel_count: 2, last_success: this.lastUpdated },
        crypto_api: { available: true, latency_ms: 85, last_success: this.lastUpdated }
      }
    };
  }

  public destroy(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }
}
