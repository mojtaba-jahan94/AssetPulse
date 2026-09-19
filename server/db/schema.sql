-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL UNIQUE,
    name_en TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('gold', 'fiat', 'crypto')),
    unit TEXT NOT NULL,
    decimals INTEGER NOT NULL DEFAULT 2,
    icon TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('toman', 'usd')),
    fee REAL NOT NULL DEFAULT 0,
    fee_currency TEXT NOT NULL CHECK (fee_currency IN ('toman', 'usd')),
    transaction_date DATETIME NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- Price History Table
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id TEXT NOT NULL,
    price_toman REAL NOT NULL,
    price_usd REAL NOT NULL,
    source TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- Latest Prices Cache Table
CREATE TABLE IF NOT EXISTS latest_prices (
    asset_id TEXT PRIMARY KEY,
    price_toman REAL NOT NULL,
    price_usd REAL NOT NULL,
    change_24h REAL DEFAULT 0,
    high_24h REAL DEFAULT 0,
    low_24h REAL DEFAULT 0,
    source TEXT NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- App Configuration Table
CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Historical Portfolio Snapshots
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_value_toman REAL NOT NULL,
    total_value_usd REAL NOT NULL,
    total_invested_toman REAL NOT NULL,
    total_pnl_toman REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_tx_asset_id ON transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_price_hist_asset ON price_history(asset_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_snapshots_time ON portfolio_snapshots(timestamp);
