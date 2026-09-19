import React from 'react';
import { LayoutDashboard, Coins, History, Settings } from 'lucide-react';
import { TabType } from './Sidebar';
import { clsx } from 'clsx';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'assets' as TabType, label: 'Holdings', icon: Coins },
    { id: 'transactions' as TabType, label: 'Activity', icon: History },
    { id: 'settings' as TabType, label: 'Pipeline', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-950/90 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={clsx(
              'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all',
              isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Icon size={20} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
