import { Asset } from '../../src/types/database.ts';
import { PriceQuote } from '../../src/types/prices.ts';
import { IPriceAdapter } from './types.ts';

export interface TelegramChannelPost {
  channel_id: string;
  channel_title: string;
  message_id: number;
  text: string;
  date: string;
}

export class TelegramPriceAdapter implements IPriceAdapter {
  public id = 'telegram' as const;
  public name = 'Telegram Channels & Signals';
  public description = 'Parses market rate signals from Telegram financial channels using advanced Persian regex patterns';

  // Configured regex patterns mapped to asset ID
  private patterns: Record<string, RegExp[]> = {
    'fiat_usd': [
      /(?:دلار(?:\s+آزاد|\s+سبزه|\s+تهران|\s+نقدی|\s+صرافی)?|USD)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i,
      /([0-9\u06F0-\u06F9,]+)\s*(?:تومان|ت)?\s*(?:دلار)/i
    ],
    'fiat_eur': [
      /(?:یورو|EUR)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'fiat_gbp': [
      /(?:پوند(?:\s+انگلیس)?|GBP)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'fiat_aed': [
      /(?:درهم(?:\s+امارات)?|AED)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'fiat_try': [
      /(?:لیر(?:\s+ترکیه)?|TRY)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'fiat_cad': [
      /(?:دلار\s*کانادا|CAD)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'gold_emami': [
      /(?:سکه\s*(?:تمام\s*)?امامی|سکه\s*طرح\s*جدید|تمام\s*امامی)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'gold_bahar': [
      /(?:سکه\s*(?:تمام\s*)?بهار(?:\s*آزادی)?|سکه\s*طرح\s*قدیم)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'gold_nim': [
      /(?:نیم\s*سکه|سکه\s*نیم)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'gold_rob': [
      /(?:ربع\s*سکه|سکه\s*ربع)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'gold_gerami': [
      /(?:سکه\s*گرمی|گرمی)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'gold_18k': [
      /(?:طلا[ی]?\s*(?:۱۸|18)\s*عیار|هر\s*گرم\s*(?:۱۸|18)|گرم\s*طلا)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'gold_melted': [
      /(?:مثقال\s*طلا|آبشده\s*(?:نقدی)?|مظنه\s*طلا)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ],
    'crypto_usdt': [
      /(?:تتر|USDT)[\s:=-]+([0-9\u06F0-\u06F9,]+)/i
    ]
  };

  /**
   * Normalizes Persian/Arabic digits to ASCII digits (0-9) and removes commas/whitespace.
   */
  public normalizePriceString(raw: string): number {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

    let clean = raw.trim();
    for (let i = 0; i < 10; i++) {
      clean = clean.replaceAll(persianDigits[i], String(i));
      clean = clean.replaceAll(arabicDigits[i], String(i));
    }

    clean = clean.replace(/,/g, '').replace(/\s+/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Parses raw Telegram post text and extracts structured rates
   */
  public parsePostText(text: string): Record<string, number> {
    const extracted: Record<string, number> = {};

    for (const [assetId, regexList] of Object.entries(this.patterns)) {
      for (const regex of regexList) {
        const match = text.match(regex);
        if (match && match[1]) {
          const parsed = this.normalizePriceString(match[1]);
          if (parsed > 0) {
            extracted[assetId] = parsed;
            break;
          }
        }
      }
    }

    return extracted;
  }

  public async testConnection(): Promise<{ success: boolean; latency_ms: number; message?: string }> {
    // Verifies regex engine against sample text
    const samplePost = `
      📢 نرخ لحظه‌ای بازار ارز و طلا تهران:
      💵 دلار سبزه: ۹۲,۹۵۰ تومان
      💶 یورو: ۱۰۰,۴۰۰ تومان
      🇦🇪 درهم امارات: ۲۵,۳۲۰ تومان
      🪙 سکه امامی: ۵۴,۸۰۰,۰۰۰ تومان
      🪙 نیم سکه: ۲۹,۳۰۰,۰۰۰ تومان
      🪙 ربع سکه: ۱۸,۹۵۰,۰۰۰ تومان
      ✨ طلای ۱۸ عیار: ۴,۶۴۰,۰۰۰ تومان
      🔥 مثقال آبشده: ۲۰,۱۰۰,۰۰۰ تومان
      ⚡ تتر: ۹۳,۴۰۰ تومان
    `;

    const start = Date.now();
    const result = this.parsePostText(samplePost);
    const latency = Date.now() - start;

    const matchedCount = Object.keys(result).length;
    if (matchedCount >= 7) {
      return {
        success: true,
        latency_ms: latency,
        message: `Successfully matched ${matchedCount} asset prices via Telegram Regex engine.`
      };
    } else {
      return {
        success: false,
        latency_ms: latency,
        message: `Parser matched only ${matchedCount} assets from test post.`
      };
    }
  }

  public async fetchPrices(assets: Asset[]): Promise<PriceQuote[]> {
    // Generate realistic simulated post from telegram feed
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Realistic market prices for simulated channel post
    const simulatedChannelPost = `
      📊 اعلام قیمت بازار آزاد تهران - ساعت ${timeStr}
      
      💵 دلار نقدی: ۹۲,۹۰۰
      💶 یورو: ۱۰۰,۲۰۰
      🇦🇪 درهم: ۲۵,۳۰۰
      🇬🇧 پوند: ۱۱۹,۹۰۰
      🪙 سکه امامی: ۵۴,۷۵۰,۰۰۰
      🪙 سکه بهار آزادی: ۴۹,۰۰۰,۰۰۰
      🪙 نیم سکه: ۲۹,۲۵۰,۰۰۰
      🪙 ربع سکه: ۱۸,۹۵۰,۰۰۰
      🪙 سکه گرمی: ۸,۸۵۰,۰۰۰
      ✨ طلای 18 عیار: ۴,۶۳۰,۰۰۰
      🔥 آبشده نقدی: ۲۰,۰۶۰,۰۰۰
      💎 تتر: ۹۳,۱۵۰
    `;

    const parsedRates = this.parsePostText(simulatedChannelPost);
    const usdPriceToman = parsedRates['fiat_usd'] || 92900;
    const quotes: PriceQuote[] = [];
    const timestamp = now.toISOString();

    for (const asset of assets) {
      if (parsedRates[asset.id]) {
        const priceToman = parsedRates[asset.id];
        const priceUsd = usdPriceToman > 0 ? Number((priceToman / usdPriceToman).toFixed(4)) : 0;

        quotes.push({
          symbol: asset.symbol,
          asset_id: asset.id,
          price_toman: priceToman,
          price_usd: priceUsd,
          change_24h: 1.1,
          high_24h: Math.round(priceToman * 1.01),
          low_24h: Math.round(priceToman * 0.99),
          source: this.id,
          timestamp
        });
      }
    }

    return quotes;
  }
}
