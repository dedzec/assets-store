/**
 * Core Types
 * Type definitions for core application features
 */

import type { Locale } from '../core/i18n';
import type { Theme } from '../core/theme';

export interface Router {
  navigateTo: (page: string, params?: Record<string, string>) => void;
  getCurrentPage: () => string;
}

export interface I18n {
  getLocale: () => Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  getAvailableLocales: () => Array<{ code: Locale; name: string }>;
}

export interface ThemeManager {
  getTheme: () => Theme;
  setTheme: (theme: Theme) => void;
}

export interface PageConstructor {
  new (container: HTMLElement): { render: (params?: Record<string, string>) => Promise<void> | void };
}
