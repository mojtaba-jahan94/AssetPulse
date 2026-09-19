import React, { useEffect, useRef } from 'react';
import { LiquidGlass } from '@ybouane/liquidglass';
import type { GlassConfig } from '@ybouane/liquidglass/dist/defaults';

interface LiquidGlassSceneProps {
  children: React.ReactNode;
  defaults?: Partial<GlassConfig>;
  className?: string;
}

export const LiquidGlassScene: React.FC<LiquidGlassSceneProps> = ({
  children,
  defaults = {
    blurAmount: 0.2,
    refraction: 0.7,
    edgeHighlight: 0.15,
    cornerRadius: 32,
  },
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let liquidInstance: LiquidGlass | null = null;
    let isMounted = true;

    // Glass elements must be direct children or have data-glass attribute
    const glassNodes = containerRef.current.querySelectorAll<HTMLElement>('[data-glass="true"]');

    LiquidGlass.init({
      root: containerRef.current,
      glassElements: Array.from(glassNodes),
      defaults,
    }).then((instance) => {
      if (!isMounted) {
        instance.destroy();
      } else {
        liquidInstance = instance;
      }
    });

    return () => {
      isMounted = false;
      if (liquidInstance) {
        liquidInstance.destroy();
      }
    };
  }, [defaults]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface GlassCardProps {
  children: React.ReactNode;
  config?: Partial<GlassConfig>;
  className?: string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  config,
  className = '',
  style,
}) => {
  return (
    <div
      data-glass="true"
      data-config={config ? JSON.stringify(config) : undefined}
      className={`relative z-10 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
