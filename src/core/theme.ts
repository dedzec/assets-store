import { STORAGE_KEYS } from '../config/constants';

export type Theme = 'light' | 'dark' | 'default';

export class ThemeManager {
  private currentTheme: Theme;
  private readonly STORAGE_KEY = STORAGE_KEYS.THEME;

  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme;
    return saved || 'default';
  }

  private saveTheme(theme: Theme): void {
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-default');
    
    // Add the new theme class
    root.classList.add(`theme-${theme}`);
    
    // Set CSS variables based on theme
    switch (theme) {
      case 'light':
        this.setLightTheme();
        break;
      case 'dark':
        this.setDarkTheme();
        break;
      default:
        this.setDefaultTheme();
        break;
    }
  }

  private setDefaultTheme(): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-gradient-start', '#667eea');
    root.style.setProperty('--primary-gradient-end', '#764ba2');
    root.style.setProperty('--bg-color', '#f5f5f5');
    root.style.setProperty('--card-bg', '#ffffff');
    root.style.setProperty('--text-primary', '#333333');
    root.style.setProperty('--text-secondary', '#666666');
    root.style.setProperty('--text-muted', '#999999');
    root.style.setProperty('--border-color', '#e0e0e0');
    root.style.setProperty('--hover-bg', '#f8f9fa');
    root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
  }

  private setLightTheme(): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-gradient-start', '#4facfe');
    root.style.setProperty('--primary-gradient-end', '#00f2fe');
    root.style.setProperty('--bg-color', '#f8f9fa');
    root.style.setProperty('--card-bg', '#ffffff');
    root.style.setProperty('--text-primary', '#212529');
    root.style.setProperty('--text-secondary', '#495057');
    root.style.setProperty('--text-muted', '#6c757d');
    root.style.setProperty('--border-color', '#dee2e6');
    root.style.setProperty('--hover-bg', '#e9ecef');
    root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.08)');
  }

  private setDarkTheme(): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-gradient-start', '#8e2de2');
    root.style.setProperty('--primary-gradient-end', '#4a00e0');
    root.style.setProperty('--bg-color', '#1a1a1a');
    root.style.setProperty('--card-bg', '#2d2d2d');
    root.style.setProperty('--text-primary', '#e0e0e0');
    root.style.setProperty('--text-secondary', '#b0b0b0');
    root.style.setProperty('--text-muted', '#808080');
    root.style.setProperty('--border-color', '#404040');
    root.style.setProperty('--hover-bg', '#3a3a3a');
    root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.4)');
  }
}

export const themeManager = new ThemeManager();
