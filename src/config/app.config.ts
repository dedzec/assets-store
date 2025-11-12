/**
 * Application Configuration
 * Central configuration file for the Assets Store application
 */

export const APP_CONFIG = {
  // Application Info
  name: 'Assets Store',
  version: '1.0.0',
  description: 'Professional Asset Manager',

  // Window Settings
  window: {
    width: 1135,
    height: 860,
    minWidth: 800,
    minHeight: 600,
  },

  // Database Settings
  database: {
    name: 'database.sqlite',
    directory: 'data',
  },

  // Theme Settings
  theme: {
    default: 'default',
    available: ['default', 'light', 'dark'],
    storageKey: 'assetsstore-theme',
  },

  // Internationalization Settings
  i18n: {
    defaultLocale: 'pt-BR',
    availableLocales: ['pt-BR', 'en-US'],
    storageKey: 'assetsstore-locale',
  },

  // File Upload Settings
  upload: {
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
