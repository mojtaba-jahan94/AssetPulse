export type AssetCategory = 'gold' | 'fiat' | 'crypto';

export type TransactionType = 'buy' | 'sell';

export type PriceCurrency = 'toman' | 'usd';

export interface Asset {
  id: string;
  symbol: string;
  name_en: string;
  name_fa: string;
  category: AssetCategory;
  unit: string;
  decimals: number;
  icon: string;
  is_active: number; // 0 or 1
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  asset_id: string;
  type: TransactionType;
  quantity: number;
  unit_price: number;
  currency: PriceCurrency;
  fee: number;
  fee_currency: PriceCurrency;
  transaction_date: string;
  notes?: string;
  created_at?: string;
}

export interface PriceHistory {
  id?: number;
  asset_id: string;
  price_toman: number;
  price_usd: number;
  source: string;
  timestamp: string;
}

export interface LatestPrice {
  asset_id: string;
  price_toman: number;
  price_usd: number;
  change_24h: number;
  high_24h?: number;
  low_24h?: number;
  source: string;
  last_updated: string;
}

export interface AppConfig {
  key: string;
  value: string;
  updated_at?: string;
}

export interface PortfolioSnapshot {
  id?: number;
  total_value_toman: number;
  total_value_usd: number;
  total_invested_toman: number;
  total_pnl_toman: number;
  timestamp: string;
}
