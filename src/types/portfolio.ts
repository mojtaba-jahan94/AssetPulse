import { Asset, LatestPrice, AssetCategory } from './database';

export interface AssetHolding {
  asset: Asset;
  quantity: number;
  weighted_average_cost_toman: number;
  weighted_average_cost_usd: number;
  total_invested_toman: number;
  total_invested_usd: number;
  current_price_toman: number;
  current_price_usd: number;
  current_value_toman: number;
  current_value_usd: number;
  unrealized_pnl_toman: number;
  unrealized_pnl_usd: number;
  unrealized_pnl_percent: number;
  realized_pnl_toman: number;
  realized_pnl_usd: number;
  allocation_percentage: number;
  change_24h: number;
}

export interface PortfolioSummary {
  total_value_toman: number;
  total_value_usd: number;
  total_invested_toman: number;
  total_invested_usd: number;
  unrealized_pnl_toman: number;
  unrealized_pnl_usd: number;
  unrealized_pnl_percent: number;
  realized_pnl_toman: number;
  realized_pnl_usd: number;
  change_24h_toman: number;
  change_24h_percent: number;
  usd_toman_rate: number;
  asset_count: number;
  holdings: AssetHolding[];
}

export interface CategoryAllocation {
  category: AssetCategory;
  label: string;
  value_toman: number;
  value_usd: number;
  percentage: number;
  color: string;
}

export interface HistoricalPerformancePoint {
  date: string;
  timestamp: string;
  total_value_toman: number;
  total_value_usd: number;
  total_invested_toman: number;
}
