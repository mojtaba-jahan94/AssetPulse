import React from 'react';
import { LayoutDashboard, Coins, History, Settings, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

export type TabType = 'dashboard' | 'assets' | 'transactions' | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'داشبورد (Overview)', icon: LayoutDashboard },
    { id: 'assets' as TabType, label: 'سبد دارایی‌ها (Assets)', icon: Coins },
    { id: 'transactions' as TabType, label: 'تراکنش‌ها (Ledger)', icon: History },
    { id: 'settings' as TabType, label: 'تنظیمات و شخصی‌سازی', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-dark-950/50 p-4 space-y-6 transition-colors duration-300">
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={clsx(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-right',
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border-r-4 border-amber-500 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              <Icon size={18} className={isActive ? 'text-amber-400 shrink-0' : 'text-slate-400 shrink-0'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-4 rounded-2xl glass-panel text-xs text-slate-400 space-y-2 border border-white/5">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <ShieldCheck size={16} />
          <span>امنیت و ذخیره‌سازی محلی</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          تمامی داده‌های مالی شما به صورت آفلاین در حافظه دستگاه ذخیره و پردازش می‌شوند.
        </p>
      </div>
    </aside>
  );
};
