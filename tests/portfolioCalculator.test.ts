import assert from 'node:assert';
import { DatabaseService } from '../server/db/database.ts';
import { PortfolioCalculator } from '../server/engine/portfolioCalculator.ts';
import { Asset, Transaction } from '../src/types/database.ts';

export async function runPortfolioCalculatorTests(): Promise<{ suite: string; passed: number; failed: number }> {
  console.log('\n--- Running PortfolioCalculator Unit Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Setup isolated in-memory DB for test
    const testDb = new DatabaseService(':memory:');
    const calc = new PortfolioCalculator(testDb);

    // Seed test assets
    const testAssets: Asset[] = [
      {
        id: 'gold_emami',
        symbol: 'SEKEE',
        name_en: 'Emami Coin',
        name_fa: 'سکه امامی',
        category: 'gold',
        unit: 'عدد',
        decimals: 2,
        icon: 'Coins',
        is_active: 1
      },
      {
        id: 'fiat_usd',
        symbol: 'USD',
        name_en: 'US Dollar',
        name_fa: 'دلار',
        category: 'fiat',
        unit: 'USD',
        decimals: 2,
        icon: 'DollarSign',
        is_active: 1
      },
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
      }
    ];

    for (const a of testAssets) {
      testDb.insertAsset(a);
    }

    // Set mock latest prices (USD = 100,000 Toman for easy math)
    testDb.upsertLatestPrice({
      asset_id: 'fiat_usd',
      price_toman: 100000,
      price_usd: 1.0,
      change_24h: 0,
      source: 'test',
      last_updated: new Date().toISOString()
    });

    testDb.upsertLatestPrice({
      asset_id: 'gold_emami',
      price_toman: 50000000,
      price_usd: 500,
      change_24h: 5.0,
      source: 'test',
      last_updated: new Date().toISOString()
    });

    // Test 1: Empty Portfolio Calculation
    const emptySummary = calc.calculatePortfolio();
    assert.strictEqual(emptySummary.total_value_toman, 0, 'Empty portfolio should have 0 Toman value');
    assert.strictEqual(emptySummary.holdings.length, 0, 'Empty portfolio should have 0 holdings');
    console.log('✓ Test 1 Passed: Empty portfolio handles zero balance safely');
    passed++;

    // Test 2: Single Buy Transaction (WAC Calculation)
    // Buy 2 Emami Coins at 40,000,000 Toman each, 0 fee
    testDb.addTransaction({
      id: 'tx_test_1',
      asset_id: 'gold_emami',
      type: 'buy',
      quantity: 2,
      unit_price: 40000000,
      currency: 'toman',
      fee: 0,
      fee_currency: 'toman',
      transaction_date: '2024-01-01T10:00:00Z'
    });

    let summary = calc.calculatePortfolio();
    assert.strictEqual(summary.holdings.length, 1, 'Should have 1 holding');
    assert.strictEqual(summary.holdings[0].quantity, 2, 'Quantity should be 2');
    assert.strictEqual(summary.holdings[0].weighted_average_cost_toman, 40000000, 'WAC should be 40M');
    assert.strictEqual(summary.holdings[0].current_value_toman, 100000000, 'Current value should be 2 * 50M = 100M');
    assert.strictEqual(summary.holdings[0].unrealized_pnl_toman, 20000000, 'Unrealized PnL should be 100M - 80M = 20M');
    assert.strictEqual(summary.holdings[0].unrealized_pnl_percent, 25.0, 'Unrealized PnL % should be 25%');
    console.log('✓ Test 2 Passed: Single Buy transaction WAC and Unrealized PnL correct');
    passed++;

    // Test 3: Multiple Buys with Different Prices (WAC update)
    // Buy 1 more Emami Coin at 46,000,000 Toman, 100,000 fee
    // New total cost = (2 * 40M) + (1 * 46M + 100,000) = 80M + 46.1M = 126.1M
    // New qty = 3 => New WAC = 126.1M / 3 = 42,033,333
    testDb.addTransaction({
      id: 'tx_test_2',
      asset_id: 'gold_emami',
      type: 'buy',
      quantity: 1,
      unit_price: 46000000,
      currency: 'toman',
      fee: 100000,
      fee_currency: 'toman',
      transaction_date: '2024-01-02T10:00:00Z'
    });

    summary = calc.calculatePortfolio();
    assert.strictEqual(summary.holdings[0].quantity, 3, 'Quantity should now be 3');
    const expectedWac = Math.round(126100000 / 3);
    assert.strictEqual(summary.holdings[0].weighted_average_cost_toman, expectedWac, 'WAC updated correctly with fee inclusion');
    console.log('✓ Test 3 Passed: Multi-buy WAC and fee inclusion verified');
    passed++;

    // Test 4: Partial Sell (Realized PnL Calculation)
    // Sell 1 coin at 52,000,000 Toman, 50,000 fee
    // Cost basis for 1 coin = WAC = 42,033,333
    // Realized PnL = (52M - 50k) - 42,033,333 = 51,950,000 - 42,033,333 = 9,916,667
    testDb.addTransaction({
      id: 'tx_test_3',
      asset_id: 'gold_emami',
      type: 'sell',
      quantity: 1,
      unit_price: 52000000,
      currency: 'toman',
      fee: 50000,
      fee_currency: 'toman',
      transaction_date: '2024-01-03T10:00:00Z'
    });

    summary = calc.calculatePortfolio();
    assert.strictEqual(summary.holdings[0].quantity, 2, 'Quantity after selling 1 should be 2');
    assert.strictEqual(summary.holdings[0].weighted_average_cost_toman, expectedWac, 'WAC should remain constant after sell');
    assert.strictEqual(summary.realized_pnl_toman, 9916667, 'Realized PnL matches exact mathematical formula');
    console.log('✓ Test 4 Passed: Partial sell realizes correct PnL and preserves WAC');
    passed++;

    // Test 5: Dual Currency Valuation (Toman & USD conversions)
    // Total value = 2 coins * 50M = 100,000,000 Toman
    // USD rate = 100,000 Toman => Total USD = 1,000 USD
    assert.strictEqual(summary.total_value_toman, 100000000, 'Total Toman value should be 100M');
    assert.strictEqual(summary.total_value_usd, 1000, 'Total USD value should be 1000');
    console.log('✓ Test 5 Passed: Dual currency conversion (Toman & USD) accurate');
    passed++;
  } catch (err: any) {
    console.error('✗ PortfolioCalculator Test Failure:', err.message);
    failed++;
  }

  return { suite: 'PortfolioCalculator', passed, failed };
}
