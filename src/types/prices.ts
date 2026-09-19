export type PriceSourceType = 'tgju' | 'telegram' | 'crypto_api';

export type RefreshInterval = 'manual' | '1m' | '5m' | '15m' | '1h';

export interface PriceQuote {
  symbol: string;
  asset_id: string;
  price_toman: number;
  price_usd: number;
  change_24h?: number;
  high_24h?: number;
  low_24h?: number;
  source: PriceSourceType | string;
  timestamp: string;
}

export interface IngestionStatus {
  active_source: PriceSourceType;
  last_updated: string | null;
  refresh_interval: RefreshInterval;
  is_updating: boolean;
  last_error: string | null;
  sources_status: {
    tgju: { available: boolean; latency_ms: number; last_success: string | null };
    telegram: { available: boolean; channel_count: number; last_success: string | null };
    crypto_api: { available: boolean; latency_ms: number; last_success: string | null };
  };
}

export interface TelegramChannelConfig {
  channel_id: string;
  name: string;
  enabled: boolean;
  custom_regex_patterns?: Record<string, string>;
}
