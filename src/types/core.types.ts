/**
 * Core Types
 * Type definitions for core application features
 */

export interface Router {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigateTo: (page: string, params?: any) => void;
  getCurrentPage: () => string;
}

export interface I18n {
  getLocale: () => string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
  getAvailableLocales: () => Array<{ code: string; name: string }>;
}

export interface ThemeManager {
  getTheme: () => string;
  setTheme: (theme: string) => void;
}

export interface PageConstructor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (container: HTMLElement): { render: (params?: any) => Promise<void> | void };
}
