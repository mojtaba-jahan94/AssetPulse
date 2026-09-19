import React, { useState } from 'react';
import { Transaction } from '../../types/database';
import { GlassCard } from '../common/GlassCard';
import { formatCurrency, formatDate, formatNumber } from '../../services/formatters';
import { Trash2, ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: (Transaction & { symbol: string; name_en: string; name_fa: string; category: string })[];
  baseCurrency: 'toman' | 'usd';
  privacyMode: boolean;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  baseCurrency,
  privacyMode,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');

  const filtered = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  return (
    <div className="space-y-4">
      {/* Header filter */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-200">Transaction History ({filtered.length})</h3>

        <div className="flex items-center space-x-1 p-1 bg-dark-900 border border-white/10 rounded-xl text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filterType === 'all' ? 'bg-amber-500 text-dark-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('buy')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filterType === 'buy' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setFilterType('sell')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filterType === 'sell' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center text-slate-400 text-sm">
          No transactions found for this filter.
        </GlassCard>
      ) : (
        <GlassCard className="overflow-x-auto p-0 border border-white/10">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Asset</th>
                <th className="py-3.5 px-4">Quantity</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Fee</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((tx) => {
                const isBuy = tx.type === 'buy';
                const totalCost = tx.quantity * tx.unit_price;

                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isBuy
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isBuy ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                        <span className="uppercase">{tx.type}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-white">{tx.name_fa}</div>
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

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete this ${tx.type} transaction?`)) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
};
