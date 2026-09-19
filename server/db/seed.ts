import { DatabaseService } from './database.ts';
import { Asset } from '../../src/types/database.ts';

export const INITIAL_ASSETS: Asset[] = [
  // Gold & Coins
  {
    id: 'gold_emami',
    symbol: 'SEKEE',
    name_en: 'Emami Coin',
    name_fa: 'سکه تمام طرح جدید (امامی)',
    category: 'gold',
    unit: 'عدد',
    decimals: 2,
    icon: 'Coins',
    is_active: 1
  },
  {
    id: 'gold_bahar',
    symbol: 'SEKEB',
    name_en: 'Bahar Azadi Coin',
    name_fa: 'سکه بهار آزادی (طرح قدیم)',
    category: 'gold',
    unit: 'عدد',
    decimals: 2,
    icon: 'Coins',
    is_active: 1
  },
  {
    id: 'gold_nim',
    symbol: 'NIM',
    name_en: 'Half Bahar Coin',
    name_fa: 'نیم سکه بهار آزادی',
    category: 'gold',
    unit: 'عدد',
    decimals: 2,
    icon: 'Coins',
    is_active: 1
  },
  {
    id: 'gold_rob',
    symbol: 'ROB',
    name_en: 'Quarter Bahar Coin',
    name_fa: 'ربع سکه بهار آزادی',
    category: 'gold',
    unit: 'عدد',
    decimals: 2,
    icon: 'Coins',
    is_active: 1
  },
  {
    id: 'gold_gerami',
    symbol: 'GERAMI',
    name_en: 'Gram Coin',
    name_fa: 'سکه گرمی',
    category: 'gold',
    unit: 'عدد',
    decimals: 2,
    icon: 'Coins',
    is_active: 1
  },
  {
    id: 'gold_18k',
    symbol: 'GERAM18',
    name_en: 'Gold 18K (Gram)',
    name_fa: 'طلای ۱۸ عیار (هر گرم)',
    category: 'gold',
    unit: 'گرم',
    decimals: 3,
    icon: 'Sparkles',
    is_active: 1
  },
  {
    id: 'gold_melted',
    symbol: 'MESGHAL',
    name_en: 'Melted Gold (Mesghal)',
    name_fa: 'مثقال آبشده نقدی',
    category: 'gold',
    unit: 'مثقال',
    decimals: 3,
    icon: 'Flame',
    is_active: 1
  },

  // Fiat Currencies
  {
    id: 'fiat_usd',
    symbol: 'USD',
    name_en: 'US Dollar',
    name_fa: 'دلار آمریکا (آزاد)',
    category: 'fiat',
    unit: 'USD',
    decimals: 2,
    icon: 'DollarSign',
    is_active: 1
  },
  {
    id: 'fiat_eur',
    symbol: 'EUR',
    name_en: 'Euro',
    name_fa: 'یورو اروپا',
    category: 'fiat',
    unit: 'EUR',
    decimals: 2,
    icon: 'Euro',
    is_active: 1
  },
  {
    id: 'fiat_gbp',
    symbol: 'GBP',
    name_en: 'British Pound',
    name_fa: 'پوند انگلیس',
    category: 'fiat',
    unit: 'GBP',
    decimals: 2,
    icon: 'Banknote',
    is_active: 1
  },
  {
    id: 'fiat_aed',
    symbol: 'AED',
    name_en: 'UAE Dirham',
    name_fa: 'درهم امارات',
    category: 'fiat',
    unit: 'AED',
    decimals: 2,
    icon: 'Banknote',
    is_active: 1
  },
  {
    id: 'fiat_try',
    symbol: 'TRY',
    name_en: 'Turkish Lira',
    name_fa: 'لیر ترکیه',
    category: 'fiat',
    unit: 'TRY',
    decimals: 2,
    icon: 'Banknote',
    is_active: 1
  },
  {
    id: 'fiat_cad',
    symbol: 'CAD',
    name_en: 'Canadian Dollar',
    name_fa: 'دلار کانادا',
    category: 'fiat',
    unit: 'CAD',
    decimals: 2,
    icon: 'Banknote',
    is_active: 1
  },

  // Cryptocurrencies
  {
    id: 'crypto_btc',
    symbol: 'BTC',
    name_en: 'Bitcoin',
    name_fa: 'بیت‌کوین',
    category: 'crypto',
    unit: 'BTC',
    decimals: 8,
    icon: 'Bitcoin',
    is_active: 1
  },
  {
    id: 'crypto_eth',
    symbol: 'ETH',
    name_en: 'Ethereum',
    name_fa: 'اتریوم',
    category: 'crypto',
    unit: 'ETH',
    decimals: 8,
    icon: 'CircleDollarSign',
    is_active: 1
  },
  {
    id: 'crypto_usdt',
    symbol: 'USDT',
    name_en: 'Tether USD',
    name_fa: 'تتر',
    category: 'crypto',
    unit: 'USDT',
    decimals: 4,
    icon: 'BadgePercent',
    is_active: 1
  },
  {
    id: 'crypto_sol',
    symbol: 'SOL',
    name_en: 'Solana',
    name_fa: 'سولانا',
    category: 'crypto',
    unit: 'SOL',
    decimals: 4,
    icon: 'Zap',
    is_active: 1
  },
  {
    id: 'crypto_bnb',
    symbol: 'BNB',
    name_en: 'BNB',
    name_fa: 'بایننس کوین',
    category: 'crypto',
    unit: 'BNB',
    decimals: 4,
    icon: 'Layers',
    is_active: 1
  }
];

export const INITIAL_BASELINE_PRICES: Record<string, { price_toman: number; price_usd: number; change_24h: number }> = {
  // Base USD Rate ~ 92,500 Toman
  'fiat_usd': { price_toman: 92500, price_usd: 1.0, change_24h: 1.2 },
  'fiat_eur': { price_toman: 99800, price_usd: 1.08, change_24h: 0.8 },
  'fiat_gbp': { price_toman: 119500, price_usd: 1.29, change_24h: 1.1 },
  'fiat_aed': { price_toman: 25200, price_usd: 0.272, change_24h: 1.2 },
  'fiat_try': { price_toman: 2650, price_usd: 0.0286, change_24h: -0.4 },
  'fiat_cad': { price_toman: 66800, price_usd: 0.722, change_24h: 0.5 },

  // Gold & Coins
  'gold_emami': { price_toman: 54500000, price_usd: 589.18, change_24h: 2.1 },
  'gold_bahar': { price_toman: 48900000, price_usd: 528.64, change_24h: 1.9 },
  'gold_nim': { price_toman: 29200000, price_usd: 315.67, change_24h: 1.5 },
  'gold_rob': { price_toman: 18900000, price_usd: 204.32, change_24h: 1.8 },
  'gold_gerami': { price_toman: 8800000, price_usd: 95.13, change_24h: 0.9 },
  'gold_18k': { price_toman: 4620000, price_usd: 49.94, change_24h: 2.3 },
  'gold_melted': { price_toman: 20010000, price_usd: 216.32, change_24h: 2.2 },

  // Crypto
  'crypto_btc': { price_toman: 8325000000, price_usd: 90000, change_24h: 3.4 },
  'crypto_eth': { price_toman: 277500000, price_usd: 3000, change_24h: 2.1 },
  'crypto_usdt': { price_toman: 93200, price_usd: 1.008, change_24h: 1.1 },
  'crypto_sol': { price_toman: 16650000, price_usd: 180, change_24h: 5.6 },
  'crypto_bnb': { price_toman: 59200000, price_usd: 640, change_24h: 1.7 }
};

export function seedDatabase(dbService: DatabaseService, forceSeedSampleTransactions = false): void {
  // 1. Seed Assets
  for (const asset of INITIAL_ASSETS) {
    dbService.insertAsset(asset);
  }

  // 2. Seed Baseline Prices
  for (const [assetId, priceData] of Object.entries(INITIAL_BASELINE_PRICES)) {
    const existing = dbService.getLatestPriceByAssetId(assetId);
    if (!existing) {
      dbService.upsertLatestPrice({
        asset_id: assetId,
        price_toman: priceData.price_toman,
        price_usd: priceData.price_usd,
        change_24h: priceData.change_24h,
        high_24h: priceData.price_toman * 1.02,
        low_24h: priceData.price_toman * 0.98,
        source: 'initial_seed',
        last_updated: new Date().toISOString()
      });

      dbService.recordPriceHistory({
        asset_id: assetId,
        price_toman: priceData.price_toman,
        price_usd: priceData.price_usd,
        source: 'initial_seed',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 3. Seed Sample Transactions if empty
  const currentTransactions = dbService.getAllTransactions();
  if (currentTransactions.length === 0 || forceSeedSampleTransactions) {
    const sampleTxs = [
      {
        id: 'tx_gold_emami_1',
        asset_id: 'gold_emami',
        type: 'buy' as const,
        quantity: 3,
        unit_price: 49200000,
        currency: 'toman' as const,
        fee: 100000,
        fee_currency: 'toman' as const,
        transaction_date: '2024-09-10T10:00:00Z',
        notes: 'خرید اولیه سکه امامی سرمایه‌گذاری'
      },
      {
        id: 'tx_gold_18k_1',
        asset_id: 'gold_18k',
        type: 'buy' as const,
        quantity: 45.5,
        unit_price: 4150000,
        currency: 'toman' as const,
        fee: 50000,
        fee_currency: 'toman' as const,
        transaction_date: '2024-10-01T14:30:00Z',
        notes: 'طلای آبشده ۱۸ عیار'
      },
      {
        id: 'tx_fiat_usd_1',
        asset_id: 'fiat_usd',
        type: 'buy' as const,
        quantity: 2500,
        unit_price: 84000,
        currency: 'toman' as const,
        fee: 0,
        fee_currency: 'toman' as const,
        transaction_date: '2024-08-15T11:00:00Z',
        notes: 'دلار کاغذی صرافی'
      },
      {
        id: 'tx_crypto_btc_1',
        asset_id: 'crypto_btc',
        type: 'buy' as const,
        quantity: 0.12,
        unit_price: 64500,
        currency: 'usd' as const,
        fee: 15,
        fee_currency: 'usd' as const,
        transaction_date: '2024-07-20T08:15:00Z',
        notes: 'DCA Bitcoin buy on Binance'
      },
      {
        id: 'tx_crypto_sol_1',
        asset_id: 'crypto_sol',
        type: 'buy' as const,
        quantity: 20,
        unit_price: 135,
        currency: 'usd' as const,
        fee: 2,
        fee_currency: 'usd' as const,
        transaction_date: '2024-09-01T16:00:00Z',
        notes: 'Solana position'
      }
    ];

    for (const tx of sampleTxs) {
      dbService.addTransaction(tx);
    }
  }
}
