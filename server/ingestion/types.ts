import { Asset } from '../../src/types/database.ts';
import { PriceQuote, PriceSourceType } from '../../src/types/prices.ts';

export interface IPriceAdapter {
  id: PriceSourceType;
  name: string;
  description: string;
  fetchPrices(assets: Asset[]): Promise<PriceQuote[]>;
  testConnection(): Promise<{ success: boolean; latency_ms: number; message?: string }>;
}
