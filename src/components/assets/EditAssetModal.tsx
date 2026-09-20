import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Asset, AssetCategory } from '../../types/database';
import {
  Coins,
  Sparkles,
  Flame,
  DollarSign,
  Euro,
  Banknote,
  Bitcoin,
  Zap,
  Layers,
  CircleDollarSign,
  BadgePercent,
  Check,
  Edit,
  Plus
} from 'lucide-react';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null; // null if creating a new custom asset
  onSave: (assetData: Partial<Asset> & { id?: string }) => Promise<void>;
}

const AVAILABLE_ICONS = [
  { id: 'Coins', label: 'سکه / طلا', component: Coins },
  { id: 'Sparkles', label: 'طلا ۱۸ عیار', component: Sparkles },
  { id: 'Flame', label: 'آبشده / نقره', component: Flame },
  { id: 'DollarSign', label: 'دلار', component: DollarSign },
  { id: 'Euro', label: 'یورو', component: Euro },
  { id: 'Banknote', label: 'اسکناس / ارز', component: Banknote },
  { id: 'Bitcoin', label: 'بیت‌کوین', component: Bitcoin },
  { id: 'CircleDollarSign', label: 'اتریوم / آلتکوین', component: CircleDollarSign },
  { id: 'BadgePercent', label: 'تتر / استیبل‌کوین', component: BadgePercent },
  { id: 'Zap', label: 'سولانا / سرعت', component: Zap },
  { id: 'Layers', label: 'بایننس / توکن', component: Layers },
];

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSave,
}) => {
  const isCreateMode = !asset;

  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [symbol, setSymbol] = useState('');
  const [category, setCategory] = useState<AssetCategory>('gold');
  const [unit, setUnit] = useState('عدد');
  const [decimals, setDecimals] = useState(2);
  const [selectedIcon, setSelectedIcon] = useState('Coins');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (asset) {
        setNameFa(asset.name_fa);
        setNameEn(asset.name_en);
        setSymbol(asset.symbol);
        setCategory(asset.category);
        setUnit(asset.unit);
        setDecimals(asset.decimals);
        setSelectedIcon(asset.icon || 'Coins');
        setIsActive(asset.is_active === 1);
      } else {
        // Defaults for new asset
        setNameFa('');
        setNameEn('');
        setSymbol('');
        setCategory('gold');
        setUnit('عدد');
        setDecimals(2);
        setSelectedIcon('Coins');
        setIsActive(true);
      }
      setError(null);
    }
  }, [isOpen, asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) {
      setError('نام فارسی دارایی نمی‌تواند خالی باشد.');
      return;
    }
    if (!symbol.trim()) {
      setError('نماد اختصاری دارایی الزامی است.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        id: asset?.id,
        name_fa: nameFa.trim(),
        name_en: nameEn.trim() || symbol.trim(),
        symbol: symbol.trim().toUpperCase(),
        category,
        unit: unit.trim() || 'واحد',
        decimals: Number(decimals),
        icon: selectedIcon,
        is_active: isActive ? 1 : 0,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره تغییرات دارایی.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreateMode ? 'افزودن دارایی سفارشی جدید' : `ویرایش دارایی: ${asset?.name_fa}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-medium">
            {error}
          </div>
        )}

        {/* Category Tabs */}
        <div>
          <label className="block text-slate-400 mb-1.5 font-semibold">دسته‌بندی دارایی (Category)</label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-dark-900 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setCategory('gold')}
              className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1 ${
                category === 'gold'
                  ? 'bg-amber-500 text-dark-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>طلا و سکه (Gold)</span>
            </button>
            <button
              type="button"
              onClick={() => setCategory('fiat')}
              className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1 ${
                category === 'fiat'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>ارزها (Fiat)</span>
            </button>
            <button
              type="button"
              onClick={() => setCategory('crypto')}
              className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1 ${
                category === 'crypto'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>رمزارز (Crypto)</span>
            </button>
          </div>
        </div>

        {/* Persian & English Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">نام فارسی دارایی</label>
            <input
              type="text"
              placeholder="مثلاً: طلای ۱۸ عیار، سکه بهار آزادی، دلار آزاد..."
              value={nameFa}
              onChange={(e) => setNameFa(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-right"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">نام انگلیسی (English Name)</label>
            <input
              type="text"
              placeholder="e.g. Gold 18K, Bahar Coin, US Dollar..."
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono text-left"
            />
          </div>
        </div>

        {/* Symbol & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">نماد اختصاری (Symbol)</label>
            <input
              type="text"
              placeholder="e.g. USD, GERAM18, BTC"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono uppercase text-center"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">واحد شمارش (Unit)</label>
            <input
              type="text"
              placeholder="مثلاً: عدد، گرم، مثقال، USD..."
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-center"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">تعداد ارقام اعشار (Decimals)</label>
            <select
              value={decimals}
              onChange={(e) => setDecimals(Number(e.target.value))}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-center font-mono"
            >
              <option value={0}>0 (بدون اعشار - سکه، واحد)</option>
              <option value={2}>2 (استاندارد ارز - 0.00)</option>
              <option value={3}>3 (طلا و گرم - 0.000)</option>
              <option value={4}>4 (تتر و آلتکوین - 0.0000)</option>
              <option value={8}>8 (بیت‌کوین و کریپتو - 0.00000000)</option>
            </select>
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-slate-400 mb-2 font-semibold">انتخاب آیکون دارایی (Icon)</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {AVAILABLE_ICONS.map((item) => {
              const IconComp = item.component;
              const isSelected = selectedIcon === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIcon(item.id)}
                  title={item.label}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-md ring-1 ring-amber-500'
                      : 'border-white/10 bg-dark-900/80 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <IconComp size={18} />
                  <span className="text-[10px] truncate max-w-[50px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-dark-900/80 border border-white/10">
          <div>
            <span className="font-bold text-white block text-xs">وضعیت فعالیت دارایی</span>
            <span className="text-[11px] text-slate-400">نمایش در لیست انتخاب‌ها و محاسبات ارزش پورتفوی</span>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              isActive ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
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
            {isCreateMode ? <Plus size={15} /> : <Edit size={15} />}
            <span>
              {isSubmitting
                ? 'در حال ذخیره...'
                : isCreateMode
                ? 'ایجاد دارایی جدید'
                : 'ذخیره مشخصات دارایی'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
