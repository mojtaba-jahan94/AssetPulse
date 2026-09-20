import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Asset, LatestPrice, Transaction } from '../../types/database';
import { formatCurrency } from '../../services/formatters';
import { Edit3, PlusCircle } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  latestPrices: LatestPrice[];
  preselectedAssetId?: string;
  initialTransaction?: (Transaction & { symbol?: string; name_en?: string; name_fa?: string; category?: string }) | null;
  onSubmit: (tx: {
    id?: string;
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
  initialTransaction,
  onSubmit,
}) => {
  const getLocalDateTimeLocal = (isoDate?: string) => {
    const d = isoDate ? new Date(isoDate) : new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const isEditMode = Boolean(initialTransaction);

  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [assetId, setAssetId] = useState(preselectedAssetId || (assets[0]?.id ?? ''));
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currency, setCurrency] = useState<'toman' | 'usd'>('toman');
  const [fee, setFee] = useState('');
  const [transactionDate, setTransactionDate] = useState(getLocalDateTimeLocal());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever modal opens or initialTransaction changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialTransaction) {
      setType(initialTransaction.type);
      setAssetId(initialTransaction.asset_id);
      setQuantity(String(initialTransaction.quantity));
      setUnitPrice(String(initialTransaction.unit_price));
      setCurrency(initialTransaction.currency);
      setFee(initialTransaction.fee ? String(initialTransaction.fee) : '');
      setTransactionDate(getLocalDateTimeLocal(initialTransaction.transaction_date));
      setNotes(initialTransaction.notes || '');
      setError(null);
    } else {
      setType('buy');
      const targetId = preselectedAssetId || (assets[0]?.id ?? '');
      setAssetId(targetId);
      setQuantity('');
      setFee('');
      setNotes('');
      setTransactionDate(getLocalDateTimeLocal());
      setError(null);

      // Auto-suggest price for new transaction
      if (targetId) {
        const selectedAsset = assets.find((a) => a.id === targetId);
        const priceData = latestPrices.find((p) => p.asset_id === targetId);
        if (selectedAsset) {
          if (selectedAsset.category === 'crypto' && selectedAsset.symbol !== 'USDT') {
            setCurrency('usd');
            if (priceData && priceData.price_usd) setUnitPrice(String(priceData.price_usd));
          } else {
            setCurrency('toman');
            if (priceData && priceData.price_toman) setUnitPrice(String(priceData.price_toman));
          }
        }
      }
    }
  }, [isOpen, initialTransaction, preselectedAssetId, assets, latestPrices]);

  // When changing asset in create mode, adapt suggested currency and latest price
  const handleAssetChange = (newAssetId: string) => {
    setAssetId(newAssetId);
    if (!isEditMode) {
      const selectedAsset = assets.find((a) => a.id === newAssetId);
      const priceData = latestPrices.find((p) => p.asset_id === newAssetId);
      if (selectedAsset) {
        if (selectedAsset.category === 'crypto' && selectedAsset.symbol !== 'USDT') {
          setCurrency('usd');
          if (priceData && priceData.price_usd) setUnitPrice(String(priceData.price_usd));
        } else {
          setCurrency('toman');
          if (priceData && priceData.price_toman) setUnitPrice(String(priceData.price_toman));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qtyNum = parseFloat(quantity);
    const priceNum = parseFloat(unitPrice);
    const feeNum = parseFloat(fee || '0');

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('لطفاً یک مقدار عددی مثبت برای تعداد/حجم وارد کنید.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('لطفاً یک قیمت واحد معتبر وارد کنید.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        id: initialTransaction?.id,
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
    } catch (err: any) {
      setError(err.message || 'ثبت تراکنش با خطا مواجه شد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedTotal = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0) + (parseFloat(fee) || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'ویرایش تراکنش (Edit Transaction)' : 'ثبت تراکنش جدید (New Transaction)'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-medium">
            {error}
          </div>
        )}

        {/* Buy / Sell Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-dark-900 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('buy')}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1 ${
              type === 'buy'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>خرید (Buy)</span>
          </button>
          <button
            type="button"
            onClick={() => setType('sell')}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1 ${
              type === 'sell'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>فروش (Sell)</span>
          </button>
        </div>

        {/* Asset Selector */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">دارایی هدف (Target Asset)</label>
          <select
            value={assetId}
            onChange={(e) => handleAssetChange(e.target.value)}
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
            <label className="block text-slate-400 mb-1 font-semibold">تعداد / حجم دارایی (Quantity)</label>
            <input
              type="number"
              step="any"
              placeholder="مثلاً 1.5 یا 0.05"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">ارز پایه معامله (Currency)</label>
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
                تومان (Toman)
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
                دلار (USD $)
              </button>
            </div>
          </div>
        </div>

        {/* Unit Price & Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">قیمت هر واحد (Unit Price)</label>
            <input
              type="number"
              step="any"
              placeholder="قیمت واحد به ارز انتخابی"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">کارمزد معامله (Fee - اختیاری)</label>
            <input
              type="number"
              step="any"
              placeholder="0 (در صورت وجود)"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">تاریخ و ساعت تراکنش (Date & Time)</label>
          <input
            type="datetime-local"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">یادداشت / توضیحات (Notes)</label>
          <input
            type="text"
            placeholder="مثلاً: خرید پله‌ای صرافی، تحویل فیزیکی طلا، بایننس..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Total Cost Summary Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <span className="text-slate-400 font-medium">مجموع ارزش تراکنش:</span>
          <span className="text-base font-extrabold text-amber-400 font-mono">
            {formatCurrency(calculatedTotal, currency)}
          </span>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center space-x-1.5"
          >
            {isEditMode ? <Edit3 size={15} /> : <PlusCircle size={15} />}
            <span>
              {isSubmitting
                ? 'در حال ذخیره...'
                : isEditMode
                ? 'ذخیره تغییرات تراکنش'
                : 'تایید و ثبت تراکنش'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
