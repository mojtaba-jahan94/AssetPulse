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
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assets' as TabType, label: 'Asset Holdings', icon: Coins },
    { id: 'transactions' as TabType, label: 'Transactions', icon: History },
    { id: 'settings' as TabType, label: 'Price Engine & Config', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-dark-950/50 p-4 space-y-6">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={clsx(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all',
                isActive
                  ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-400 border-l-4 border-amber-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              <Icon size={18} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-4 rounded-2xl glass-panel text-xs text-slate-400 space-y-2 border border-white/5">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <ShieldCheck size={16} />
          <span>Offline-First Security</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Your financial data is stored locally in SQLite with zero telemetry.
        </p>
      </div>
    </aside>
  );
};
