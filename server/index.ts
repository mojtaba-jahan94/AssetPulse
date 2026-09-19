import express from 'express';
import cors from 'cors';
import { databaseService } from './db/database.ts';
import { seedDatabase } from './db/seed.ts';
import { PriceIngestionManager } from './ingestion/priceManager.ts';
import { PortfolioCalculator } from './engine/portfolioCalculator.ts';
import { createPortfolioRouter } from './routes/portfolioRoutes.ts';
import { createTransactionRouter } from './routes/transactionRoutes.ts';
import { createPriceRouter } from './routes/priceRoutes.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

// Initialize Database and Seed initial data
seedDatabase(databaseService);

// Initialize Services
const priceManager = new PriceIngestionManager(databaseService);
const calculator = new PortfolioCalculator(databaseService);

// Mount API Routes
app.use('/api/portfolio', createPortfolioRouter(databaseService, calculator));
app.use('/api/transactions', createTransactionRouter(databaseService));
app.use('/api/prices', createPriceRouter(databaseService, priceManager));

// Serve static production build if available
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


const server = app.listen(PORT, () => {
  console.log(`[AssetPulse Engine] Server running on http://localhost:${PORT}`);
  console.log(`[AssetPulse Engine] SQLite database active with zero-latency local caching.`);
  console.log(`[AssetPulse Engine] Price ingestion active source: ${priceManager.getActiveSource()}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down AssetPulse server...');
  priceManager.destroy();
  server.close(() => {
    process.exit(0);
  });
});

export { app, server };
