export type BackgroundTheme = 'midnight' | 'oled' | 'cosmic' | 'light';
export type AccentColor = 'amber' | 'emerald' | 'cyan' | 'indigo' | 'purple' | 'rose';
export type GlassLevel = 'vision' | 'subtle' | 'flat';
export type LayoutDensity = 'normal' | 'compact';
export type FontFamily = 'vazirmatn' | 'inter';

export interface ThemeConfig {
  theme: BackgroundTheme;
  accent: AccentColor;
  glass: GlassLevel;
  density: LayoutDensity;
  font: FontFamily;
  persianDigits: boolean;
}

const STORAGE_KEY = 'assetpulse_theme_config';

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  theme: 'midnight',
  accent: 'amber',
  glass: 'vision',
  density: 'normal',
  font: 'vazirmatn',
  persianDigits: false
};

export const ACCENT_PALETTES: Record<AccentColor, {
  name_fa: string;
  name_en: string;
  primary: string;
  hover: string;
  glow: string;
  subtle: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  hex: string;
}> = {
  amber: {
    name_fa: 'طلایی کریپتو (پیش‌فرض)',
    name_en: 'Golden Amber',
    primary: '#f59e0b',
    hover: '#d97706',
    glow: 'rgba(245, 158, 11, 0.3)',
    subtle: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    hex: '#f59e0b'
  },
  emerald: {
    name_fa: 'سبز زمردی / صرافی',
    name_en: 'Emerald Green',
    primary: '#10b981',
    hover: '#059669',
    glow: 'rgba(16, 185, 129, 0.3)',
    subtle: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    hex: '#10b981'
  },
  cyan: {
    name_fa: 'آبی فیروزه‌ای نئون',
    name_en: 'Electric Cyan',
    primary: '#06b6d4',
    hover: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.3)',
    subtle: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-400',
    hex: '#06b6d4'
  },
  indigo: {
    name_fa: 'آبی کاربنی سلطنتی',
    name_en: 'Royal Indigo',
    primary: '#6366f1',
    hover: '#4f46e5',
    glow: 'rgba(99, 102, 241, 0.3)',
    subtle: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.3)',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-400',
    hex: '#6366f1'
  },
  purple: {
    name_fa: 'بنفش آمیتیست مدرن',
    name_en: 'Amethyst Violet',
    primary: '#a855f7',
    hover: '#9333ea',
    glow: 'rgba(168, 85, 247, 0.3)',
    subtle: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.3)',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-400',
    hex: '#a855f7'
  },
  rose: {
    name_fa: 'یاقوتی رز سرخ',
    name_en: 'Crimson Rose',
    primary: '#f43f5e',
    hover: '#e11d48',
    glow: 'rgba(244, 63, 94, 0.3)',
    subtle: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.3)',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-400',
    hex: '#f43f5e'
  }
};

export const THEME_PRESETS: Record<BackgroundTheme, {
  name_fa: string;
  name_en: string;
  desc: string;
  bgHex: string;
}> = {
  midnight: {
    name_fa: 'سرمه‌ای شب (پیش‌فرض)',
    name_en: 'Midnight Slate',
    desc: 'پس‌زمینه استاندارد تاریک و چشم‌نواز',
    bgHex: '#090d16'
  },
  oled: {
    name_fa: 'مشکی خالص OLED',
    name_en: 'OLED Pure Black',
    desc: 'سیاهی عمیق و بیشترین صرفه‌جویی باتری در نمایشگرهای موبایل',
    bgHex: '#000000'
  },
  cosmic: {
    name_fa: 'فضایی با گرادیان شیشه‌ای',
    name_en: 'Cosmic Aura',
    desc: 'هاله‌های نوری ملایم نئونی در گوشه‌های صفحه',
    bgHex: '#070a14'
  },
  light: {
    name_fa: 'تم روشن مدرن',
    name_en: 'Clean Light',
    desc: 'پوسته‌ای شفاف، سفید و پرکنتراست جهت مطالعه در روز',
    bgHex: '#f8fafc'
  }
};

export function getStoredThemeConfig(): ThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_THEME_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_THEME_CONFIG;
}

export function applyThemeConfig(config: ThemeConfig): void {
  const root = document.documentElement;
  const body = document.body;

  // Set data attributes
  root.setAttribute('data-theme', config.theme);
  root.setAttribute('data-accent', config.accent);
  root.setAttribute('data-glass', config.glass);
  root.setAttribute('data-density', config.density);
  root.setAttribute('data-font', config.font);

  // Toggle dark class on html
  if (config.theme === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }

  // Update theme-color meta tag for browser navbar / mobile status bar
  const themeMeta = document.getElementById('theme-color-meta');
  if (themeMeta) {
    const color = THEME_PRESETS[config.theme]?.bgHex || '#090d16';
    themeMeta.setAttribute('content', color);
  }

  // Set dynamic CSS variables for Accent Color
  const palette = ACCENT_PALETTES[config.accent] || ACCENT_PALETTES.amber;
  root.style.setProperty('--accent-primary', palette.primary);
  root.style.setProperty('--accent-hover', palette.hover);
  root.style.setProperty('--accent-glow', palette.glow);
  root.style.setProperty('--accent-subtle', palette.subtle);
  root.style.setProperty('--accent-border', palette.border);

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save theme config:', err);
  }
}

export function initTheme(): ThemeConfig {
  const config = getStoredThemeConfig();
  applyThemeConfig(config);
  return config;
}
