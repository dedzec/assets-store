import { STORAGE_KEYS } from '../config/constants';

// ── Palette & Mode Types ──────────────────────────────────────────────
export const THEME_PALETTES = ['purple', 'blue', 'ocean', 'forest', 'sunset', 'rose', 'cherry', 'lavender', 'gold', 'slate'] as const;
export type ThemePalette = typeof THEME_PALETTES[number];
export type ThemeMode = 'light' | 'dark';
export type Theme = `${ThemePalette}-${ThemeMode}`;

// ── CSS Variable Set ──────────────────────────────────────────────────
interface ThemeVars {
  '--primary-gradient-start': string;
  '--primary-gradient-end': string;
  '--bg-color': string;
  '--card-bg': string;
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;
  '--border-color': string;
  '--hover-bg': string;
  '--shadow': string;
}

// ── Theme Definitions ─────────────────────────────────────────────────
const THEME_CONFIGS: Record<Theme, ThemeVars> = {
  // ─── Purple ───
  'purple-light': {
    '--primary-gradient-start': '#667eea',
    '--primary-gradient-end': '#764ba2',
    '--bg-color': '#f5f5f5',
    '--card-bg': '#ffffff',
    '--text-primary': '#333333',
    '--text-secondary': '#666666',
    '--text-muted': '#999999',
    '--border-color': '#e0e0e0',
    '--hover-bg': '#f8f9fa',
    '--shadow': 'rgba(0, 0, 0, 0.1)',
  },
  'purple-dark': {
    '--primary-gradient-start': '#9c7cf4',
    '--primary-gradient-end': '#7c4dff',
    '--bg-color': '#121218',
    '--card-bg': '#1e1e2e',
    '--text-primary': '#e4e4e7',
    '--text-secondary': '#a1a1aa',
    '--text-muted': '#71717a',
    '--border-color': '#2e2e3e',
    '--hover-bg': '#2a2a3a',
    '--shadow': 'rgba(0, 0, 0, 0.5)',
  },

  // ─── Blue ───
  'blue-light': {
    '--primary-gradient-start': '#4facfe',
    '--primary-gradient-end': '#00f2fe',
    '--bg-color': '#f0f4f8',
    '--card-bg': '#ffffff',
    '--text-primary': '#1a2744',
    '--text-secondary': '#495670',
    '--text-muted': '#7889a0',
    '--border-color': '#d6e0eb',
    '--hover-bg': '#e8eef4',
    '--shadow': 'rgba(0, 0, 0, 0.08)',
  },
  'blue-dark': {
    '--primary-gradient-start': '#4facfe',
    '--primary-gradient-end': '#00c6fb',
    '--bg-color': '#0d1b2a',
    '--card-bg': '#1b2838',
    '--text-primary': '#d8e2ef',
    '--text-secondary': '#8899aa',
    '--text-muted': '#5a6a7a',
    '--border-color': '#253545',
    '--hover-bg': '#223040',
    '--shadow': 'rgba(0, 0, 0, 0.5)',
  },

  // ─── Ocean (Teal / Cyan) ───
  'ocean-light': {
    '--primary-gradient-start': '#00b4db',
    '--primary-gradient-end': '#0083b0',
    '--bg-color': '#f0fafb',
    '--card-bg': '#ffffff',
    '--text-primary': '#1a3a40',
    '--text-secondary': '#3d6068',
    '--text-muted': '#7a9ca3',
    '--border-color': '#c8e6ea',
    '--hover-bg': '#e0f2f4',
    '--shadow': 'rgba(0, 0, 0, 0.08)',
  },
  'ocean-dark': {
    '--primary-gradient-start': '#00d4ff',
    '--primary-gradient-end': '#0097a7',
    '--bg-color': '#0a1a1e',
    '--card-bg': '#132a30',
    '--text-primary': '#d0eff4',
    '--text-secondary': '#7ab8c4',
    '--text-muted': '#4d8a94',
    '--border-color': '#1d3a42',
    '--hover-bg': '#1a3238',
    '--shadow': 'rgba(0, 0, 0, 0.5)',
  },

  // ─── Forest (Green) ───
  'forest-light': {
    '--primary-gradient-start': '#11998e',
    '--primary-gradient-end': '#38ef7d',
    '--bg-color': '#f0faf4',
    '--card-bg': '#ffffff',
    '--text-primary': '#1a3a24',
    '--text-secondary': '#3d6048',
    '--text-muted': '#7a9c83',
    '--border-color': '#c8e6d0',
    '--hover-bg': '#e0f2e6',
    '--shadow': 'rgba(0, 0, 0, 0.08)',
  },
  'forest-dark': {
    '--primary-gradient-start': '#17d4a2',
    '--primary-gradient-end': '#27c972',
    '--bg-color': '#0a1a10',
    '--card-bg': '#132a1a',
    '--text-primary': '#d0f4dd',
    '--text-secondary': '#7ac492',
    '--text-muted': '#4d9464',
    '--border-color': '#1d3a24',
    '--hover-bg': '#1a3220',
    '--shadow': 'rgba(0, 0, 0, 0.5)',
  },

  // ─── Sunset (Orange / Warm) ───
  'sunset-light': {
    '--primary-gradient-start': '#f2994a',
    '--primary-gradient-end': '#f2c94c',
    '--bg-color': '#fffaf0',
    '--card-bg': '#ffffff',
    '--text-primary': '#3a2a1a',
    '--text-secondary': '#6a5030',
    '--text-muted': '#a08060',
    '--border-color': '#eadcc8',
    '--hover-bg': '#f5eee0',
    '--shadow': 'rgba(0, 0, 0, 0.08)',
  },
  'sunset-dark': {
    '--primary-gradient-start': '#ffb347',
    '--primary-gradient-end': '#ffcc33',
    '--bg-color': '#1a1208',
    '--card-bg': '#2a2010',
    '--text-primary': '#f4e4d0',
    '--text-secondary': '#c4a07a',
    '--text-muted': '#94704a',
    '--border-color': '#3a2a18',
    '--hover-bg': '#302418',
    '--shadow': 'rgba(0, 0, 0, 0.5)',
  },

  // ─── Rose (Pink) ───
  'rose-light': {
    '--primary-gradient-start': '#ee5a6f',
    '--primary-gradient-end': '#f093a0',
    '--bg-color': '#fff5f7',
    '--card-bg': '#ffffff',
    '--text-primary': '#3a1a22',
    '--text-secondary': '#6a3d48',
    '--text-muted': '#a07080',
    '--border-color': '#eac8d0',
    '--hover-bg': '#f5e0e6',
    '--shadow': 'rgba(0, 0, 0, 0.08)',
  },
  'rose-dark': {
    '--primary-gradient-start': '#ff6b81',
    '--primary-gradient-end': '#f78ca0',
    '--bg-color': '#1a0d10',
    '--card-bg': '#2a1a1e',
    '--text-primary': '#f4d0d8',
    '--text-secondary': '#c47a8a',
    '--text-muted': '#944a5a',
    '--border-color': '#3a1a22',
    '--hover-bg': '#301820',
    '--shadow': 'rgba(0, 0, 0, 0.5)',
  },

  // ─── Cherry (Deep Red) ───
  'cherry-light': {
    '--primary-gradient-start': '#d32f2f',
    '--primary-gradient-end': '#ff6659',
    '--bg-color': '#fdf5f5',
    '--card-bg': '#ffffff',
    '--text-primary': '#3b1515',
    '--text-secondary': '#6b3030',
    '--text-muted': '#a06060',
    '--border-color': '#e8c8c8',
    '--hover-bg': '#f8e8e8',
    '--shadow': 'rgba(0, 0, 0, 0.08)',
  },
  'cherry-dark': {
    '--primary-gradient-start': '#ef5350',
    '--primary-gradient-end': '#ff8a80',
    '--bg-color': '#1a0a0a',
    '--card-bg': '#2a1515',
    '--text-primary': '#f4d0d0',
    '--text-secondary': '#c47a7a',
    '--text-muted': '#944a4a',
    '--border-color': '#3a1a1a',
    '--hover-bg': '#301515',
    '--shadow': 'rgba(0, 0, 0, 0.5)',
  },

  // ─── Lavender (Soft Violet) ───
  'lavender-light': {
    '--primary-gradient-start': '#b388ff',
    '--primary-gradient-end': '#7c4dff',
    '--bg-color': '#f8f5ff',
    '--card-bg': '#ffffff',
    '--text-primary': '#2a1a40',
    '--text-secondary': '#5a4070',
    '--text-muted': '#8a70a0',
    '--border-color': '#dcd0ea',
    '--hover-bg': '#f0e8f8',
    '--shadow': 'rgba(0, 0, 0, 0.08)',
  },
  'lavender-dark': {
    '--primary-gradient-start': '#ce93d8',
    '--primary-gradient-end': '#ab47bc',
    '--bg-color': '#140e1a',
    '--card-bg': '#221a2e',
    '--text-primary': '#e8d8f0',
    '--text-secondary': '#a888c0',
    '--text-muted': '#785898',
    '--border-color': '#322440',
    '--hover-bg': '#2a1e38',
    '--shadow': 'rgba(0, 0, 0, 0.5)',
  },

  // ─── Gold (Amber / Yellow) ───
  'gold-light': {
    '--primary-gradient-start': '#ffc107',
    '--primary-gradient-end': '#ff8f00',
    '--bg-color': '#fffdf5',
    '--card-bg': '#ffffff',
    '--text-primary': '#3a3010',
    '--text-secondary': '#6a5520',
    '--text-muted': '#a08840',
    '--border-color': '#eae0c0',
    '--hover-bg': '#f8f2e0',
    '--shadow': 'rgba(0, 0, 0, 0.08)',
  },
  'gold-dark': {
    '--primary-gradient-start': '#ffd54f',
    '--primary-gradient-end': '#ffab00',
    '--bg-color': '#1a1508',
    '--card-bg': '#2a2210',
    '--text-primary': '#f4ecd0',
    '--text-secondary': '#c4a870',
    '--text-muted': '#947840',
    '--border-color': '#3a2e18',
    '--hover-bg': '#302815',
    '--shadow': 'rgba(0, 0, 0, 0.5)',
  },

  // ─── Slate (Cool Gray) ───
  'slate-light': {
    '--primary-gradient-start': '#546e7a',
    '--primary-gradient-end': '#78909c',
    '--bg-color': '#f5f7f8',
    '--card-bg': '#ffffff',
    '--text-primary': '#1a2830',
    '--text-secondary': '#3d5060',
    '--text-muted': '#708898',
    '--border-color': '#cdd8de',
    '--hover-bg': '#e8eef0',
    '--shadow': 'rgba(0, 0, 0, 0.08)',
  },
  'slate-dark': {
    '--primary-gradient-start': '#78909c',
    '--primary-gradient-end': '#90a4ae',
    '--bg-color': '#0e1418',
    '--card-bg': '#1a2530',
    '--text-primary': '#d8e4ea',
    '--text-secondary': '#8aa0b0',
    '--text-muted': '#5a7888',
    '--border-color': '#243540',
    '--hover-bg': '#1e3040',
    '--shadow': 'rgba(0, 0, 0, 0.5)',
  },
};

// ── Palette Preview Colors (used by the selector UI) ──────────────────
export const PALETTE_COLORS: Record<ThemePalette, [string, string]> = {
  purple:   ['#667eea', '#764ba2'],
  blue:     ['#4facfe', '#00f2fe'],
  ocean:    ['#00b4db', '#0083b0'],
  forest:   ['#11998e', '#38ef7d'],
  sunset:   ['#f2994a', '#f2c94c'],
  rose:     ['#ee5a6f', '#f093a0'],
  cherry:   ['#d32f2f', '#ff6659'],
  lavender: ['#b388ff', '#7c4dff'],
  gold:     ['#ffc107', '#ff8f00'],
  slate:    ['#546e7a', '#78909c'],
};

// ── Migration map for old theme IDs ───────────────────────────────────
const LEGACY_MAP: Record<string, Theme> = {
  default: 'purple-light',
  light:   'blue-light',
  dark:    'purple-dark',
};

// ── Helper ────────────────────────────────────────────────────────────
function isValidTheme(value: string): value is Theme {
  return value in THEME_CONFIGS;
}

// ── ThemeManager ──────────────────────────────────────────────────────
export class ThemeManager {
  private currentTheme: Theme;
  private readonly STORAGE_KEY = STORAGE_KEYS.THEME;

  constructor() {
    // Default theme — real value loaded via init()
    this.currentTheme = 'purple-light';
  }

  /** Initialize with persisted theme from main process; migrates localStorage on first run */
  init(savedTheme?: string): void {
    const raw = savedTheme ?? localStorage.getItem(this.STORAGE_KEY) ?? '';
    let theme: Theme = 'purple-light';

    if (LEGACY_MAP[raw]) {
      theme = LEGACY_MAP[raw];
    } else if (isValidTheme(raw)) {
      theme = raw;
    }

    // Migrate from localStorage → SQLite on first run
    if (!savedTheme && raw) {
      this.saveTheme(theme);
      localStorage.removeItem(this.STORAGE_KEY);
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
  }

  private saveTheme(theme: Theme): void {
    window.api?.setSetting(this.STORAGE_KEY, theme);
  }

  // ── Public API ────────────────────────────────────────────────────
  getTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  getPalette(): ThemePalette {
    return this.currentTheme.split('-')[0] as ThemePalette;
  }

  getMode(): ThemeMode {
    return this.currentTheme.split('-')[1] as ThemeMode;
  }

  setPalette(palette: ThemePalette): void {
    this.setTheme(`${palette}-${this.getMode()}`);
  }

  setMode(mode: ThemeMode): void {
    this.setTheme(`${this.getPalette()}-${mode}`);
  }

  // ── Internal ──────────────────────────────────────────────────────
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const vars = THEME_CONFIGS[theme];

    // Update CSS class for mode-specific selectors (e.g. scrollbar)
    root.classList.remove('mode-light', 'mode-dark');
    root.classList.add(`mode-${this.getMode()}`);

    // Apply all CSS variables
    for (const [prop, value] of Object.entries(vars)) {
      root.style.setProperty(prop, value);
    }
  }
}

export const themeManager = new ThemeManager();
