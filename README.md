# AssetPulse — Multi-Asset Portfolio & Price Intelligence Platform

**AssetPulse** is an offline-first, privacy-focused, cross-platform portfolio and wealth management platform designed for multi-asset investors. It specializes in tracking **Gold & Precious Coins (Emami, Bahar Azadi, Nim, Rob, Gerami, 18k Gram, Melted Gold)**, **Fiat Currencies (USD, EUR, GBP, AED, TRY, CAD, AUD)**, and **Cryptocurrencies (BTC, ETH, USDT, SOL, BNB)** with dual-currency valuation in both **Iranian Toman** and **USD**.

---

## Key Features

1. **Dual-Currency Valuation (Toman & USD)**:
   - Dynamic real-time calculation of total net worth, 24h PnL, invested basis, and allocation percentages.
   - Dual-currency toggle button instantly converts all displays.

2. **Weighted Average Cost (WAC) & PnL Engine**:
   - High-precision Weighted Average Cost basis tracking on buys with fee inclusion.
   - Exact Realized Profit/Loss accounting on sell transactions.
   - Real-time Unrealized PnL and percentage gains against live market rates.

3. **Modular Price Ingestion Engine**:
   - **Adapter A (TGJU Scraper/API)**: Fetches real-time rates from `tgju.org` with user-agent rotation and anti-ban jitter.
   - **Adapter B (Telegram Channel Parser)**: Parses financial channel messages with Persian/Arabic digit normalization and custom regex patterns.
   - **Adapter C (Public Crypto APIs)**: High-frequency Binance 24h ticker and CoinGecko fallback with Toman cross-conversion.
   - **Configurable Cadence**: Manual refresh, 1m, 5m, 15m, or 1h scheduler with local caching.

4. **Offline-First SQLite Database**:
   - Powered by Node.js built-in `node:sqlite` for zero native compilation dependencies, ACID transactions, and instant local response times.

5. **Cross-Platform Ready**:
   - **Desktop**: Pre-configured for Tauri v2 (`src-tauri/tauri.conf.json`) targeting Windows, macOS, and Linux.
   - **Mobile**: Pre-configured for Capacitor (`capacitor.config.ts`) targeting iOS and Android.
   - **Web / PWA**: Vite + React 18 + Tailwind CSS + Lucide Icons + Recharts with glassmorphic aesthetic.

6. **Privacy Mode**:
   - 1-click eye toggle blurs all balances and holding quantities when in public spaces.

---

## Directory Structure

```
├── server/
│   ├── index.ts                   # Express server entry point (Port 3001)
│   ├── db/
│   │   ├── database.ts            # SQLite service (node:sqlite DatabaseSync)
│   │   ├── schema.sql             # SQL table definitions, constraints, indexes
│   │   └── seed.ts                # Iranian gold, coins, fiat, and crypto seeds
│   ├── engine/
│   │   └── portfolioCalculator.ts # WAC, Realized/Unrealized PnL, Toman/USD engine
│   ├── ingestion/
│   │   ├── types.ts               # IPriceAdapter contracts
│   │   ├── tgjuAdapter.ts         # TGJU scraper & AJAX parser
│   │   ├── telegramAdapter.ts     # Persian regex channel scraper
│   │   ├── cryptoAdapter.ts       # Binance / CoinGecko ticker
│   │   └── priceManager.ts        # Coordinator, fallback chain & scheduler
│   └── routes/
│       ├── portfolioRoutes.ts     # Portfolio summary & analytics API
│       ├── transactionRoutes.ts   # Transaction CRUD endpoints
│       └── priceRoutes.ts         # Price ingestion & adapter settings API
├── src/
│   ├── App.tsx                    # Root dashboard application
│   ├── components/
│   │   ├── common/                # GlassCard, Modal
│   │   ├── layout/                # Header, Sidebar, BottomNav, PriceTicker
│   │   ├── dashboard/             # NetWorthCard, QuickStats, AllocationChart, PerformanceChart
│   │   ├── assets/                # AssetList, category filtering, search
│   │   ├── transactions/          # TransactionHistory, AddTransactionModal
│   │   └── settings/              # SettingsModal with Telegram regex sandbox
│   ├── services/
│   │   ├── api.ts                 # Type-safe client communication
│   │   └── formatters.ts          # Currency, percentage, and date formatters
│   └── types/                     # TypeScript database, price, and portfolio models
├── tests/
│   ├── runner.ts                  # Master test runner
│   ├── portfolioCalculator.test.ts # Financial engine unit tests
│   ├── priceAdapters.test.ts      # Scraper & regex parsing tests
│   └── database.test.ts           # SQLite persistence tests
├── src-tauri/                     # Desktop bundle config
└── capacitor.config.ts            # Mobile bundle config
```

---

## Quick Start & Running Locally

### 1. Run Backend Server
```bash
npm run server
```
Server starts on `http://localhost:3001` with SQLite active.

### 2. Run Frontend Web Interface
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Unit Tests & Sanity Suite
```bash
npm test
```
Executes all 13 deterministic tests for financial formulas, scrapers, and database operations.

### 4. Build Production Bundle
```bash
npm run build
```
Generates optimized static bundle in `dist/`.

---

## Desktop & Mobile Deployment

- **Desktop (Tauri v2)**:
  ```bash
  npm run tauri:dev   # or npx @tauri-apps/cli dev
  ```
- **Mobile (Capacitor)**:
  ```bash
  npx cap sync
  npx cap open android # or npx cap open ios
  ```
