/**
 * Application Constants
 * Global constants used throughout the application
 */

// IPC Channel Names
export const IPC_CHANNELS = {
  GET_ASSETS: 'get-assets',
  ADD_ASSET: 'add-asset',
  UPDATE_ASSET: 'update-asset',
  DELETE_ASSET: 'delete-asset',
  SELECT_FILE: 'select-file',
  READ_IMAGE: 'read-image',
  OPEN_EXTERNAL: 'open-external',
  CLOSE_APP: 'close-app',
} as const;

// Route Names
export const ROUTES = {
  LIST: 'list',
  FORM: 'form',
  SETTINGS: 'settings',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'assetsstore-theme',
  LOCALE: 'assetsstore-locale',
} as const;

// Theme Names
export const THEMES = {
  DEFAULT: 'default',
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Locale Codes
export const LOCALES = {
  PT_BR: 'pt-BR',
  EN_US: 'en-US',
} as const;
