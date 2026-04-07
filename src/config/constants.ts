/**
 * Application Constants
 * Global constants used throughout the application
 */

// IPC Channel Names
export const IPC_CHANNELS = {
  GET_ASSETS: 'get-assets',
  GET_ASSET_BY_ID: 'get-asset-by-id',
  ADD_ASSET: 'add-asset',
  UPDATE_ASSET: 'update-asset',
  DELETE_ASSET: 'delete-asset',
  CLEAR_ALL_ASSETS: 'clear-all-assets',
  SELECT_FILE: 'select-file',
  READ_IMAGE: 'read-image',
  OPEN_EXTERNAL: 'open-external',
  CLOSE_APP: 'close-app',
  MINIMIZE_WINDOW: 'minimize-window',
  MAXIMIZE_WINDOW: 'maximize-window',
  IS_MAXIMIZED: 'is-maximized',
  IMPORT_ASSETS: 'import-assets',
  GET_CATEGORIES: 'get-categories',
  ADD_CATEGORY: 'add-category',
  UPDATE_CATEGORY: 'update-category',
  DELETE_CATEGORY: 'delete-category',
  GET_ASSET_CATEGORIES: 'get-asset-categories',
  SET_ASSET_CATEGORIES: 'set-asset-categories',
  GET_SETTINGS: 'get-settings',
  SET_SETTING: 'set-setting',
} as const;

// Route Names
export const ROUTES = {
  LIST: 'list',
  FORM: 'form',
  VIEW: 'view',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'assetsstore-theme',
  LOCALE: 'assetsstore-locale',
} as const;

// Theme Palettes
export const THEME_PALETTES = ['purple', 'blue', 'ocean', 'forest', 'sunset', 'rose', 'cherry', 'lavender', 'gold', 'slate'] as const;
export const THEME_MODES = ['light', 'dark'] as const;

// Locale Codes
export const LOCALES = {
  PT_BR: 'pt-BR',
  EN_US: 'en-US',
} as const;
