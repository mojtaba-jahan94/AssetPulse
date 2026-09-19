import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Asset, LatestPrice } from '../../types/database';
import { formatCurrency } from '../../services/formatters';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  latestPrices: LatestPrice[];
  preselectedAssetId?: string;
  onSubmit: (tx: {
    asset_id: string;
    type: 'buy' | 'sell';
    quantity: number;
    unit_price: number;
    currency: 'toman' | 'usd';
    fee?: number;
    fee_currency?: 'toman' | 'usd';
    transaction_date?: string;
    notes?: string;
  }) => Promise<void>;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  assets,
  latestPrices,
  preselectedAssetId,
  onSubmit,
}) => {
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [assetId, setAssetId] = useState(preselectedAssetId || (assets[0]?.id ?? ''));
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currency, setCurrency] = useState<'toman' | 'usd'>('toman');
  const [fee, setFee] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedAssetId) {
      setAssetId(preselectedAssetId);
    } else if (!assetId && assets.length > 0) {
      setAssetId(assets[0].id);
    }
  }, [preselectedAssetId, assets]);

  // When selected asset changes, autofill default currency and latest price
  useEffect(() => {
    if (!assetId) return;
    const selectedAsset = assets.find((a) => a.id === assetId);
    const priceData = latestPrices.find((p) => p.asset_id === assetId);

    if (selectedAsset) {
      if (selectedAsset.category === 'crypto' && selectedAsset.symbol !== 'USDT') {
        setCurrency('usd');
        if (priceData && priceData.price_usd) {
          setUnitPrice(String(priceData.price_usd));
        }
      } else {
        setCurrency('toman');
        if (priceData && priceData.price_toman) {
          setUnitPrice(String(priceData.price_toman));
        }
      }
    }
  }, [assetId, latestPrices, assets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qtyNum = parseFloat(quantity);
    const priceNum = parseFloat(unitPrice);
    const feeNum = parseFloat(fee || '0');

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid positive unit price.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        asset_id: assetId,
        type,
        quantity: qtyNum,
        unit_price: priceNum,
        currency,
        fee: feeNum,
        fee_currency: currency,
        transaction_date: new Date(transactionDate).toISOString(),
        notes: notes.trim(),
      });
      onClose();
      // Reset fields
      setQuantity('');
      setFee('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedTotal = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0) + (parseFloat(fee) || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Transaction" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        {/* Buy / Sell Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-dark-900 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('buy')}
            className={`py-2 rounded-xl font-bold transition-all ${
              type === 'buy'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Buy Position
          </button>
          <button
            type="button"
            onClick={() => setType('sell')}
            className={`py-2 rounded-xl font-bold transition-all ${
              type === 'sell'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sell Position
          </button>
        </div>

        {/* Asset Selector */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Target Asset</label>
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name_fa} ({a.symbol}) — {a.category.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Quantity</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 1.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Price Currency</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCurrency('toman')}
                className={`py-2 rounded-xl font-semibold border transition-all ${
                  currency === 'toman'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-dark-900 border-white/10 text-slate-400'
                }`}
              >
                Toman (تومان)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('usd')}
                className={`py-2 rounded-xl font-semibold border transition-all ${
                  currency === 'usd'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                    : 'bg-dark-900 border-white/10 text-slate-400'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>

        {/* Unit Price & Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Unit Price</label>
            <input
              type="number"
              step="any"
              placeholder="Unit price paid"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Transaction Fee</label>
            <input
              type="number"
              step="any"
              placeholder="0 (optional)"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Execution Date</label>
          <input
            type="datetime-local"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Notes / Memo</label>
          <input
            type="text"
            placeholder="e.g. Bought via broker / Binance DCA"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Total Cost Summary Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <span className="text-slate-400">Total Transaction Value:</span>
          <span className="text-base font-extrabold text-amber-400 font-mono">
            {formatCurrency(calculatedTotal, currency)}
          </span>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            {isSubmitting ? 'Saving...' : 'Confirm Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
