import assert from 'node:assert';
import { DatabaseService } from '../server/db/database.ts';
import { Asset, Transaction, LatestPrice } from '../src/types/database.ts';

export async function runDatabaseTests(): Promise<{ suite: string; passed: number; failed: number }> {
  console.log('\n--- Running SQLite Database Engine Unit Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    const db = new DatabaseService(':memory:');

    // Test 1: Asset Insertion and Retrieval
    const sampleAsset: Asset = {
      id: 'gold_test',
      symbol: 'TESTG',
      name_en: 'Test Gold',
      name_fa: 'طلای آزمایشی',
      category: 'gold',
      unit: 'گرم',
      decimals: 2,
      icon: 'Coins',
      is_active: 1
    };

    db.insertAsset(sampleAsset);
    const retrieved = db.getAssetById('gold_test');
    assert.ok(retrieved, 'Asset should exist in DB');
    assert.strictEqual(retrieved?.symbol, 'TESTG');
    console.log('✓ Test 1 Passed: Asset insertion and lookup by ID');
    passed++;

    // Test 2: App Config get and set
    db.setConfig('test_key', 'test_value_123');
    assert.strictEqual(db.getConfig('test_key'), 'test_value_123', 'Config value should match set value');
    db.setConfig('test_key', 'updated_value_456');
    assert.strictEqual(db.getConfig('test_key'), 'updated_value_456', 'Config value should update on conflict');
    console.log('✓ Test 2 Passed: App config upsert and retrieval');
    passed++;

    // Test 3: Latest Prices Upsert
    const initialPrice: LatestPrice = {
      asset_id: 'gold_test',
      price_toman: 4500000,
      price_usd: 48.5,
      change_24h: 1.2,
      source: 'unit_test',
      last_updated: new Date().toISOString()
    };
    db.upsertLatestPrice(initialPrice);
    let p = db.getLatestPriceByAssetId('gold_test');
    assert.strictEqual(p?.price_toman, 4500000, 'Initial price should match');

    // Update with new price
    const updatedPrice: LatestPrice = {
      asset_id: 'gold_test',
      price_toman: 4600000,
      price_usd: 49.2,
      change_24h: 2.2,
      source: 'unit_test_v2',
      last_updated: new Date().toISOString()
    };
    db.upsertLatestPrice(updatedPrice);
    p = db.getLatestPriceByAssetId('gold_test');
    assert.strictEqual(p?.price_toman, 4600000, 'Price should update on conflict');
    assert.strictEqual(p?.source, 'unit_test_v2');
    console.log('✓ Test 3 Passed: Latest price upsert on conflict');
    passed++;

    // Test 4: Transaction Insertion and Deletion
    const tx: Transaction = {
      id: 'tx_db_test',
      asset_id: 'gold_test',
      type: 'buy',
      quantity: 10,
      unit_price: 4500000,
      currency: 'toman',
      fee: 20000,
      fee_currency: 'toman',
      transaction_date: '2024-05-01T12:00:00Z',
      notes: 'Test transaction'
    };
    db.addTransaction(tx);
    let txs = db.getTransactionsByAssetId('gold_test');
    assert.strictEqual(txs.length, 1, 'Transaction count should be 1');
    assert.strictEqual(txs[0].quantity, 10);

    const deleted = db.deleteTransaction('tx_db_test');
    assert.strictEqual(deleted, true, 'Transaction should be deleted successfully');
    txs = db.getTransactionsByAssetId('gold_test');
    assert.strictEqual(txs.length, 0, 'Transaction count should be 0 after delete');
    console.log('✓ Test 4 Passed: Transaction add and deletion');
    passed++;
  } catch (err: any) {
    console.error('✗ Database Test Failure:', err.message);
    failed++;
  }

  return { suite: 'DatabaseService', passed, failed };
}
