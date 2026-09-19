import { PortfolioSummary, CategoryAllocation, HistoricalPerformancePoint } from '../types/portfolio';
import { Transaction, Asset, LatestPrice } from '../types/database';
import { IngestionStatus, PriceSourceType, RefreshInterval } from '../types/prices';

const API_BASE = '/api';

export async function fetchPortfolioSummary(): Promise<PortfolioSummary & { allocations: CategoryAllocation[] }> {
  const res = await fetch(`${API_BASE}/portfolio/summary`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch portfolio summary');
  return json.data;
}

export async function fetchPortfolioPerformance(): Promise<HistoricalPerformancePoint[]> {
  const res = await fetch(`${API_BASE}/portfolio/performance`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch performance');
  return json.data;
}

export async function fetchAssets(): Promise<Asset[]> {
  const res = await fetch(`${API_BASE}/portfolio/assets`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch assets');
  return json.data;
}

export async function fetchTransactions(): Promise<(Transaction & { symbol: string; name_en: string; name_fa: string; category: string })[]> {
  const res = await fetch(`${API_BASE}/transactions`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch transactions');
  return json.data;
}

export async function createTransaction(tx: {
  asset_id: string;
  type: 'buy' | 'sell';
  quantity: number;
  unit_price: number;
  currency: 'toman' | 'usd';
  fee?: number;
  fee_currency?: 'toman' | 'usd';
  transaction_date?: string;
  notes?: string;
}): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to create transaction');
  return json.data;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete transaction');
  return true;
}

export async function fetchLatestPrices(): Promise<(LatestPrice & { symbol: string; name_en: string; name_fa: string; category: string })[]> {
  const res = await fetch(`${API_BASE}/prices/latest`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch latest prices');
  return json.data;
}

export async function refreshPrices(): Promise<any> {
  const res = await fetch(`${API_BASE}/prices/refresh`, {
    method: 'POST'
  });
  const json = await res.json();
  return json;
}

export async function fetchPriceStatus(): Promise<IngestionStatus> {
  const res = await fetch(`${API_BASE}/prices/status`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch price status');
  return json.data;
}

export async function updatePriceSource(source: PriceSourceType): Promise<any> {
  const res = await fetch(`${API_BASE}/prices/source`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update price source');
  return json;
}

export async function updateRefreshInterval(interval: RefreshInterval): Promise<any> {
  const res = await fetch(`${API_BASE}/prices/interval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interval })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update interval');
  return json;
}

export async function testPriceAdapters(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/prices/test`, {
    method: 'POST'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to test adapters');
  return json.data;
}

export async function parseTelegramPost(text: string): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/prices/parse-telegram-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to parse telegram post');
  return json.data;
}
