import React from 'react';
import { clsx } from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glow?: 'brand' | 'gold' | 'emerald' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hoverEffect = false,
  glow = 'none',
  ...props
}) => {
  const glowClasses = {
    none: '',
    brand: 'shadow-[0_0_25px_rgba(99,102,241,0.15)] border-indigo-500/20',
    gold: 'shadow-[0_0_25px_rgba(245,158,11,0.15)] border-amber-500/20',
    emerald: 'shadow-[0_0_25px_rgba(16,185,129,0.15)] border-emerald-500/20',
  };

  return (
    <div
      className={clsx(
        'glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300',
        hoverEffect && 'glass-panel-hover',
        glowClasses[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
