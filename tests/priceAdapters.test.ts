import assert from 'node:assert';
import { TelegramPriceAdapter } from '../server/ingestion/telegramAdapter.ts';
import { TgjuPriceAdapter } from '../server/ingestion/tgjuAdapter.ts';
import { CryptoPriceAdapter } from '../server/ingestion/cryptoAdapter.ts';
import { Asset } from '../src/types/database.ts';

export async function runPriceAdaptersTests(): Promise<{ suite: string; passed: number; failed: number }> {
  console.log('\n--- Running Price Ingestion Adapters Unit Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    const telegramAdapter = new TelegramPriceAdapter();
    const tgjuAdapter = new TgjuPriceAdapter();
    const cryptoAdapter = new CryptoPriceAdapter();

    // Test 1: Telegram Persian / Arabic Digit Normalization
    const persianRaw = '۹۲,۵۰۰';
    const arabicRaw = '١٠٠,٤٠٠';
    assert.strictEqual(telegramAdapter.normalizePriceString(persianRaw), 92500, 'Persian digits should normalize to 92500');
    assert.strictEqual(telegramAdapter.normalizePriceString(arabicRaw), 100400, 'Arabic digits should normalize to 100400');
    console.log('✓ Test 1 Passed: Persian and Arabic digit normalization');
    passed++;

    // Test 2: Telegram Channel Regex Post Parsing
    const testChannelPost = `
      نرخ نهایی بازار ارز و طلای تهران:
      💵 دلار سبزه: ۹۳,۱۵۰
      💶 یورو: ۱۰۱,۲۰۰
      🇦🇪 درهم: ۲۵,۴۰۰
      🪙 سکه امامی: ۵۴,۹۰۰,۰۰۰
      🪙 سکه بهار آزادی: ۴۹,۱۰۰,۰۰۰
      🪙 نیم سکه: ۲۹,۳۰۰,۰۰۰
      🪙 ربع سکه: ۱۸,۹۵۰,۰۰۰
      🪙 سکه گرمی: ۸,۸۵۰,۰۰۰
      ✨ طلای ۱۸ عیار: ۴,۶۵۰,۰۰۰
      🔥 مثقال آبشده: ۲۰,۱۴۰,۰۰۰
      💎 تتر: ۹۳,۵۰۰
    `;

    const parsed = telegramAdapter.parsePostText(testChannelPost);
    assert.strictEqual(parsed['fiat_usd'], 93150, 'Parsed USD rate should be 93,150');
    assert.strictEqual(parsed['fiat_eur'], 101200, 'Parsed EUR rate should be 101,200');
    assert.strictEqual(parsed['fiat_aed'], 25400, 'Parsed AED rate should be 25,400');
    assert.strictEqual(parsed['gold_emami'], 54900000, 'Parsed Emami Coin should be 54,900,000');
    assert.strictEqual(parsed['gold_bahar'], 49100000, 'Parsed Bahar Coin should be 49,100,000');
    assert.strictEqual(parsed['gold_nim'], 29300000, 'Parsed Nim Coin should be 29,300,000');
    assert.strictEqual(parsed['gold_rob'], 18950000, 'Parsed Rob Coin should be 18,950,000');
    assert.strictEqual(parsed['gold_18k'], 4650000, 'Parsed Gold 18k should be 4,650,000');
    assert.strictEqual(parsed['gold_melted'], 20140000, 'Parsed Melted Gold should be 20,140,000');
    assert.strictEqual(parsed['crypto_usdt'], 93500, 'Parsed Tether rate should be 93,500');
    console.log('✓ Test 2 Passed: Full multi-asset Persian Telegram signal parsing');
    passed++;

    // Test 3: TGJU Adapter Resilient Fallback Guarantee
    const dummyAssets: Asset[] = [
      { id: 'gold_emami', symbol: 'SEKEE', name_en: 'Emami', name_fa: 'سکه', category: 'gold', unit: 'عدد', decimals: 2, icon: 'Coins', is_active: 1 },
      { id: 'fiat_usd', symbol: 'USD', name_en: 'Dollar', name_fa: 'دلار', category: 'fiat', unit: 'USD', decimals: 2, icon: 'DollarSign', is_active: 1 }
    ];

    const tgjuQuotes = await tgjuAdapter.fetchPrices(dummyAssets);
    assert.ok(tgjuQuotes.length > 0, 'TGJU adapter should always return valid quotes even in offline/blocked environment');
    const usdQuote = tgjuQuotes.find((q) => q.asset_id === 'fiat_usd');
    assert.ok(usdQuote && usdQuote.price_toman > 50000, 'USD price should be realistic and positive');
    console.log('✓ Test 3 Passed: TGJU adapter guarantees non-empty resilient quotes');
    passed++;

    // Test 4: Crypto Adapter Price Quote Conversion
    const cryptoAssets: Asset[] = [
      { id: 'crypto_btc', symbol: 'BTC', name_en: 'Bitcoin', name_fa: 'بیت‌کوین', category: 'crypto', unit: 'BTC', decimals: 8, icon: 'Bitcoin', is_active: 1 },
      { id: 'crypto_usdt', symbol: 'USDT', name_en: 'Tether', name_fa: 'تتر', category: 'crypto', unit: 'USDT', decimals: 4, icon: 'BadgePercent', is_active: 1 }
    ];

    const usdRefRate = 95000;
    const cryptoQuotes = await cryptoAdapter.fetchPrices(cryptoAssets, usdRefRate);
    assert.ok(cryptoQuotes.length >= 2, 'Crypto adapter returns quotes for requested crypto assets');
    const btc = cryptoQuotes.find((q) => q.symbol === 'BTC');
    assert.ok(btc && btc.price_usd > 50000, 'Bitcoin USD price should be greater than 50k');
    assert.strictEqual(btc?.price_toman, Math.round(btc!.price_usd * usdRefRate), 'Bitcoin Toman price accurately converted using USD reference');
    console.log('✓ Test 4 Passed: Crypto adapter USD-to-Toman cross calculation');
    passed++;
  } catch (err: any) {
    console.error('✗ PriceAdapters Test Failure:', err.message);
    failed++;
  }

  return { suite: 'PriceAdapters', passed, failed };
}
