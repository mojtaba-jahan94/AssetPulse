import { Router, Request, Response } from 'express';
import { DatabaseService } from '../db/database.ts';
import { Transaction } from '../../src/types/database.ts';

export function createTransactionRouter(db: DatabaseService): Router {
  const router = Router();

  // GET /api/transactions
  router.get('/', (_req: Request, res: Response) => {
    try {
      const transactions = db.getAllTransactions();
      res.json({ success: true, data: transactions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/transactions
  router.post('/', (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.asset_id || !body.type || !body.quantity || !body.unit_price) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: asset_id, type, quantity, unit_price are mandatory'
        });
      }

      const tx: Transaction = {
        id: body.id || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        asset_id: body.asset_id,
        type: body.type,
        quantity: parseFloat(body.quantity),
        unit_price: parseFloat(body.unit_price),
        currency: body.currency || 'toman',
        fee: parseFloat(body.fee || 0),
        fee_currency: body.fee_currency || body.currency || 'toman',
        transaction_date: body.transaction_date || new Date().toISOString(),
        notes: body.notes || ''
      };

      db.addTransaction(tx);
      res.status(201).json({ success: true, data: tx });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE /api/transactions/:id
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const deleted = db.deleteTransaction(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Transaction not found' });
      }
      res.json({ success: true, message: 'Transaction successfully deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
