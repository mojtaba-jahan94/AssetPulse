import React, { useState } from 'react';
import { Transaction } from '../../types/database';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate, formatNumber } from '../../services/formatters';
import {
  Trash2,
  Edit3,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  AlertTriangle,
  FileText
} from 'lucide-react';

export type TxWithAsset = Transaction & { symbol: string; name_en: string; name_fa: string; category: string };

interface TransactionHistoryProps {
  transactions: TxWithAsset[];
  baseCurrency: 'toman' | 'usd';
  privacyMode: boolean;
  onEditTransaction: (tx: TxWithAsset) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  baseCurrency,
  privacyMode,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'gold' | 'fiat' | 'crypto'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [txToDelete, setTxToDelete] = useState<TxWithAsset | null>(null);

  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNameEn = tx.name_en.toLowerCase().includes(q);
      const matchNameFa = tx.name_fa.includes(q);
      const matchSymbol = tx.symbol.toLowerCase().includes(q);
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      if (!matchNameEn && !matchNameFa && !matchSymbol && !matchNotes) return false;
    }
    return true;
  });

  const confirmDelete = () => {
    if (txToDelete) {
      onDeleteTransaction(txToDelete.id);
      setTxToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header controls: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو در تراکنش‌ها (نماد، نام یا یادداشت)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center space-x-1 p-1 bg-dark-900 border border-white/10 rounded-xl text-xs">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                categoryFilter === 'all' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              همه دسته‌ها
            </button>
            <button
              onClick={() => setCategoryFilter('gold')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                categoryFilter === 'gold' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              طلا و سکه
            </button>
            <button
              onClick={() => setCategoryFilter('fiat')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                categoryFilter === 'fiat' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ارز
            </button>
            <button
              onClick={() => setCategoryFilter('crypto')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                categoryFilter === 'crypto' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              کریپتو
            </button>
          </div>

          {/* Buy/Sell Filter */}
          <div className="flex items-center space-x-1 p-1 bg-dark-900 border border-white/10 rounded-xl text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-amber-500 text-dark-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              همه
            </button>
            <button
              onClick={() => setFilterType('buy')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'buy' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              خرید
            </button>
            <button
              onClick={() => setFilterType('sell')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'sell' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              فروش
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center text-slate-400 text-sm">
          تراکنشی مطابق با این فیلتر یافت نشد.
        </GlassCard>
      ) : (
        <GlassCard className="overflow-x-auto p-0 border border-white/10">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">نوع</th>
                <th className="py-3.5 px-4">دارایی</th>
                <th className="py-3.5 px-4">مقدار / تعداد</th>
                <th className="py-3.5 px-4">قیمت واحد</th>
                <th className="py-3.5 px-4">مبلغ کل</th>
                <th className="py-3.5 px-4">کارمزد</th>
                <th className="py-3.5 px-4">تاریخ</th>
                <th className="py-3.5 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((tx) => {
                const isBuy = tx.type === 'buy';
                const totalCost = tx.quantity * tx.unit_price;

                return (
                  <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isBuy
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isBuy ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        <span>{isBuy ? 'خرید' : 'فروش'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <span>{tx.name_fa}</span>
                        {tx.notes && (
                          <span
                            title={tx.notes}
                            className="text-slate-400 hover:text-amber-400 transition-colors"
                          >
                            <FileText size={12} />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {tx.name_en} ({tx.symbol})
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-white">
                      {privacyMode ? '••••' : formatNumber(tx.quantity, 6)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                      {formatCurrency(tx.unit_price, tx.currency, privacyMode)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-amber-400">
                      {formatCurrency(totalCost, tx.currency, privacyMode)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                      {tx.fee > 0 ? formatCurrency(tx.fee, tx.fee_currency, privacyMode) : '—'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                      {formatDate(tx.transaction_date)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center space-x-1">
                        {/* Edit Button */}
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="ویرایش تراکنش (Edit)"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setTxToDelete(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="حذف تراکنش (Delete)"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}

      {/* Sleek Custom Glass Delete Confirmation Modal */}
      {txToDelete && (
        <Modal
          isOpen={Boolean(txToDelete)}
          onClose={() => setTxToDelete(null)}
          title="تایید حذف تراکنش"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <AlertTriangle size={24} className="shrink-0 text-rose-400" />
              <p className="leading-relaxed">
                آیا از حذف این تراکنش اطمینان دارید؟ این عمل تمام محاسبات موجودی و سود/زیان را به‌روزرسانی می‌کند.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-dark-900 border border-white/10 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">دارایی:</span>
                <span className="font-bold text-white">{txToDelete.name_fa} ({txToDelete.symbol})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">نوع عملیات:</span>
                <span className={`font-bold ${txToDelete.type === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {txToDelete.type === 'buy' ? 'خرید' : 'فروش'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">مقدار:</span>
                <span className="font-mono font-bold text-white">{txToDelete.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ارزش کل:</span>
                <span className="font-mono font-bold text-amber-400">
                  {formatCurrency(txToDelete.quantity * txToDelete.unit_price, txToDelete.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">تاریخ ثبت:</span>
                <span className="text-slate-300">{formatDate(txToDelete.transaction_date)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center space-x-1.5"
              >
                <Trash2 size={14} />
                <span>حذف قطعی</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
