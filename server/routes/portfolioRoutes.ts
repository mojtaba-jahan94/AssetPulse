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

  return router;
}
