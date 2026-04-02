/**
 * Types Index
 * Central export point for all TypeScript type definitions
 */

// Asset Types
export * from './asset.types';

// Category Types
export * from './category.types';

// API Types
export * from './api.types';

// Core Types
export * from './core.types';

// Global Window Interface
import { ElectronAPI } from './api.types';
import { Router, I18n, ThemeManager } from './core.types';

declare global {
  interface Window {
    api: ElectronAPI;
    router: Router;
    i18n: I18n;
    themeManager: ThemeManager;
    updateI18nTexts: () => void;
  }
}

