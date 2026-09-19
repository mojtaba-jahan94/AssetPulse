import { Router, Request, Response } from 'express';
import { DatabaseService } from '../db/database.ts';
import { PriceIngestionManager } from '../ingestion/priceManager.ts';
import { TelegramPriceAdapter } from '../ingestion/telegramAdapter.ts';

export function createPriceRouter(db: DatabaseService, priceManager: PriceIngestionManager): Router {
  const router = Router();
  const telegramAdapter = new TelegramPriceAdapter();

  // GET /api/prices/latest
  router.get('/latest', (_req: Request, res: Response) => {
    try {
      const prices = db.getLatestPrices();
      res.json({ success: true, data: prices });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/prices/history/:assetId
  router.get('/history/:assetId', (req: Request, res: Response) => {
    try {
      const history = db.getPriceHistory(req.params.assetId, 50);
      res.json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/prices/refresh
  router.post('/refresh', async (_req: Request, res: Response) => {
    try {
      const result = await priceManager.refreshPrices();
      res.json({ success: result.success, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/prices/status
  router.get('/status', (_req: Request, res: Response) => {
    try {
      const status = priceManager.getStatus();
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/prices/source
  router.post('/source', (req: Request, res: Response) => {
    try {
      const { source } = req.body;
      if (!source || !['tgju', 'telegram', 'crypto_api'].includes(source)) {
        return res.status(400).json({ success: false, error: 'Invalid price source specified' });
      }
      priceManager.setActiveSource(source);
      res.json({ success: true, active_source: source });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/prices/interval
  router.post('/interval', (req: Request, res: Response) => {
    try {
      const { interval } = req.body;
      if (!interval || !['manual', '1m', '5m', '15m', '1h'].includes(interval)) {
        return res.status(400).json({ success: false, error: 'Invalid refresh interval' });
      }
      priceManager.setRefreshInterval(interval);
      res.json({ success: true, refresh_interval: interval });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/prices/test
  router.post('/test', async (_req: Request, res: Response) => {
    try {
      const testResults = await priceManager.testAllSources();
      res.json({ success: true, data: testResults });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/prices/parse-telegram-post
  router.post('/parse-telegram-post', (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, error: 'Text body is required' });
      }
      const parsed = telegramAdapter.parsePostText(text);
      res.json({ success: true, data: parsed });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
