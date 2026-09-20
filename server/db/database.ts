import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Asset, Transaction, LatestPrice, PriceHistory, AppConfig, PortfolioSnapshot } from '../../src/types/database.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseService {
  private db: DatabaseSync;
  private dbPath: string;

  constructor(customPath?: string) {
    if (customPath) {
      this.dbPath = customPath;
    } else {
      const dataDir = path.resolve(__dirname, '../../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.dbPath = path.join(dataDir, 'assetpulse.db');
    }
    this.db = new DatabaseSync(this.dbPath);
    this.init();
  }

  public getRawDb(): DatabaseSync {
    return this.db;
  }

  private init(): void {
    // Enable foreign keys
    this.db.exec('PRAGMA foreign_keys = ON;');
    
    // Read and run schema
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    this.db.exec(schemaSql);

    // Default configuration values
    const defaultConfigs: Record<string, string> = {
      'active_price_source': 'tgju',
      'refresh_interval': '5m',
      'base_currency': 'toman',
      'telegram_channels': JSON.stringify([
        { channel_id: '@tgju_org', name: 'TGJU Live Signals', enabled: true },
        { channel_id: '@nerkh_live', name: 'Tehran Currency Live', enabled: true }
      ])
    };

    for (const [key, value] of Object.entries(defaultConfigs)) {
      const existing = this.getConfig(key);
      if (existing === null) {
        this.setConfig(key, value);
      }
    }
  }

  // Assets
  public getAllAssets(): Asset[] {
    const stmt = this.db.prepare('SELECT * FROM assets WHERE is_active = 1 ORDER BY category ASC, symbol ASC');
    return stmt.all() as unknown as Asset[];
  }

  public getAssetById(id: string): Asset | null {
    const stmt = this.db.prepare('SELECT * FROM assets WHERE id = ?');
    const result = stmt.get(id);
    return (result as unknown as Asset) || null;
  }

  public getAssetBySymbol(symbol: string): Asset | null {
    const stmt = this.db.prepare('SELECT * FROM assets WHERE UPPER(symbol) = UPPER(?)');
    const result = stmt.get(symbol);
    return (result as unknown as Asset) || null;
  }

  public insertAsset(asset: Asset): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO assets (id, symbol, name_en, name_fa, category, unit, decimals, icon, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      asset.id,
      asset.symbol,
      asset.name_en,
      asset.name_fa,
      asset.category,
      asset.unit,
      asset.decimals,
      asset.icon,
      asset.is_active ?? 1
    );
  }

  // Transactions
  public getAllTransactions(): (Transaction & { symbol: string; name_en: string; name_fa: string; category: string })[] {
    const stmt = this.db.prepare(`
      SELECT t.*, a.symbol, a.name_en, a.name_fa, a.category
      FROM transactions t
      JOIN assets a ON t.asset_id = a.id
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `);
    return stmt.all() as any[];
  }

  public getTransactionsByAssetId(assetId: string): Transaction[] {
    const stmt = this.db.prepare('SELECT * FROM transactions WHERE asset_id = ? ORDER BY transaction_date ASC, created_at ASC');
    return stmt.all(assetId) as unknown as Transaction[];
  }

  public addTransaction(tx: Transaction): void {
    const stmt = this.db.prepare(`
      INSERT INTO transactions (id, asset_id, type, quantity, unit_price, currency, fee, fee_currency, transaction_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      tx.id,
      tx.asset_id,
      tx.type,
      tx.quantity,
      tx.unit_price,
      tx.currency,
      tx.fee || 0,
      tx.fee_currency || tx.currency,
      tx.transaction_date,
      tx.notes || ''
    );
  }

  public getTransactionById(id: string): Transaction | null {
    const stmt = this.db.prepare('SELECT * FROM transactions WHERE id = ?');
    const res = stmt.get(id);
    return (res as unknown as Transaction) || null;
  }

  public updateTransaction(tx: Transaction): boolean {
    const stmt = this.db.prepare(`
      UPDATE transactions
      SET asset_id = ?, type = ?, quantity = ?, unit_price = ?, currency = ?, fee = ?, fee_currency = ?, transaction_date = ?, notes = ?
      WHERE id = ?
    `);
    const res = stmt.run(
      tx.asset_id,
      tx.type,
      tx.quantity,
      tx.unit_price,
      tx.currency,
      tx.fee || 0,
      tx.fee_currency || tx.currency,
      tx.transaction_date,
      tx.notes || '',
      tx.id
    );
    return (res as any)?.changes > 0;
  }

  public deleteTransaction(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM transactions WHERE id = ?');
    const res = stmt.run(id);
    return (res as any)?.changes > 0;
  }

  // Prices
  public getLatestPrices(): (LatestPrice & { symbol: string; name_en: string; name_fa: string; category: string; unit: string })[] {
    const stmt = this.db.prepare(`
      SELECT p.*, a.symbol, a.name_en, a.name_fa, a.category, a.unit
      FROM latest_prices p
      JOIN assets a ON p.asset_id = a.id
      ORDER BY a.category ASC, a.symbol ASC
    `);
    return stmt.all() as any[];
  }

  public getLatestPriceByAssetId(assetId: string): LatestPrice | null {
    const stmt = this.db.prepare('SELECT * FROM latest_prices WHERE asset_id = ?');
    const result = stmt.get(assetId);
    return (result as unknown as LatestPrice) || null;
  }

  public upsertLatestPrice(price: LatestPrice): void {
    const stmt = this.db.prepare(`
      INSERT INTO latest_prices (asset_id, price_toman, price_usd, change_24h, high_24h, low_24h, source, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(asset_id) DO UPDATE SET
        price_toman = excluded.price_toman,
        price_usd = excluded.price_usd,
        change_24h = excluded.change_24h,
        high_24h = excluded.high_24h,
        low_24h = excluded.low_24h,
        source = excluded.source,
        last_updated = CURRENT_TIMESTAMP
    `);
    stmt.run(
      price.asset_id,
      price.price_toman,
      price.price_usd,
      price.change_24h || 0,
      price.high_24h || 0,
      price.low_24h || 0,
      price.source
    );
  }

  public recordPriceHistory(history: PriceHistory): void {
    const stmt = this.db.prepare(`
      INSERT INTO price_history (asset_id, price_toman, price_usd, source, timestamp)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(history.asset_id, history.price_toman, history.price_usd, history.source);
  }

  public getPriceHistory(assetId: string, limit = 50): PriceHistory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM price_history
      WHERE asset_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(assetId, limit) as unknown as PriceHistory[];
  }

  // App Config
  public getConfig(key: string, defaultValue: string | null = null): string | null {
    const stmt = this.db.prepare('SELECT value FROM app_config WHERE key = ?');
    const row = stmt.get(key) as { value: string } | undefined;
    return row ? row.value : defaultValue;
  }

  public setConfig(key: string, value: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO app_config (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(key, value);
  }

  public getAllConfig(): Record<string, string> {
    const stmt = this.db.prepare('SELECT key, value FROM app_config');
    const rows = stmt.all() as { key: string; value: string }[];
    const result: Record<string, string> = {};
    for (const r of rows) {
      result[r.key] = r.value;
    }
    return result;
  }

  // Portfolio Snapshots
  public saveSnapshot(snapshot: PortfolioSnapshot): void {
    const stmt = this.db.prepare(`
      INSERT INTO portfolio_snapshots (total_value_toman, total_value_usd, total_invested_toman, total_pnl_toman, timestamp)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      snapshot.total_value_toman,
      snapshot.total_value_usd,
      snapshot.total_invested_toman,
      snapshot.total_pnl_toman
    );
  }

  public getSnapshots(limit = 30): PortfolioSnapshot[] {
    const stmt = this.db.prepare(`
      SELECT * FROM portfolio_snapshots
      ORDER BY timestamp ASC
      LIMIT ?
    `);
    return stmt.all(limit) as unknown as PortfolioSnapshot[];
  }
}

// Singleton database instance
export const databaseService = new DatabaseService();
