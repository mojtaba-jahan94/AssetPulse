import { Router, Request, Response } from 'express';
import { DatabaseService } from '../db/database.ts';
import { PortfolioCalculator } from '../engine/portfolioCalculator.ts';

export function createPortfolioRouter(db: DatabaseService, calculator: PortfolioCalculator): Router {
  const router = Router();

  // GET /api/portfolio/summary
  router.get('/summary', (_req: Request, res: Response) => {
    try {
      const summary = calculator.calculatePortfolio();
      const allocations = calculator.getCategoryAllocations(summary);
      res.json({
        success: true,
        data: {
          ...summary,
          allocations
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/portfolio/performance
  router.get('/performance', (_req: Request, res: Response) => {
    try {
      const performance = calculator.getHistoricalPerformance();
      res.json({ success: true, data: performance });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/portfolio/assets
  router.get('/assets', (_req: Request, res: Response) => {
    try {
      const assets = db.getAllAssets();
      res.json({ success: true, data: assets });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PUT /api/portfolio/assets/:id
  router.put('/assets/:id', (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body = req.body;
      const existing = db.getAssetById(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Asset not found' });
      }

      const updatedAsset = {
        ...existing,
        symbol: body.symbol || existing.symbol,
        name_en: body.name_en || existing.name_en,
        name_fa: body.name_fa || existing.name_fa,
        category: body.category || existing.category,
        unit: body.unit || existing.unit,
        decimals: body.decimals !== undefined ? parseInt(body.decimals) : existing.decimals,
        icon: body.icon || existing.icon,
        is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : existing.is_active,
      };

      const success = db.updateAsset(updatedAsset);
      if (!success) {
        return res.status(500).json({ success: false, error: 'Failed to update asset in database' });
      }
      res.json({ success: true, data: updatedAsset });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/portfolio/assets
  router.post('/assets', (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.name_fa || !body.symbol || !body.category) {
        return res.status(400).json({ success: false, error: 'name_fa, symbol, and category are required' });
      }

      const newAsset = {
        id: body.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        symbol: body.symbol.toUpperCase(),
        name_en: body.name_en || body.symbol,
        name_fa: body.name_fa,
        category: body.category,
        unit: body.unit || 'واحد',
        decimals: body.decimals !== undefined ? parseInt(body.decimals) : 2,
        icon: body.icon || 'Coins',
        is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
      };

      db.insertAsset(newAsset);
      res.status(201).json({ success: true, data: newAsset });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
