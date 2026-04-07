/**
 * Main Process Entry Point
 * Handles Electron app lifecycle and IPC communication
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import log from 'electron-log/main';
import started from 'electron-squirrel-startup';
import { getDb, getImagesDir } from './core/database';
import { APP_CONFIG } from './config/app.config';
import { IPC_CHANNELS } from './config/constants';
import type { AssetInput, AssetUpdate } from './types/asset.types';

// Configure electron-log
log.initialize();
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

// ─── Validation helpers ──────────────────────────────────────────────

function validateAssetInput(asset: unknown): asset is AssetInput {
  if (!asset || typeof asset !== 'object') return false;
  const a = asset as Record<string, unknown>;
  return (
    typeof a.title === 'string' && a.title.trim().length > 0 &&
    (a.image === undefined || a.image === '' || typeof a.image === 'string') &&
    (a.version === undefined || a.version === '' || typeof a.version === 'string') &&
    (a.unity === undefined || a.unity === '' || typeof a.unity === 'string') &&
    (a.unreal === undefined || a.unreal === '' || typeof a.unreal === 'string') &&
    (a.link === undefined || a.link === '' || typeof a.link === 'string') &&
    (a.linkType === undefined || a.linkType === '' || a.linkType === 'local' || a.linkType === 'cloud')
  );
}

function validateAssetUpdate(asset: unknown): asset is AssetUpdate {
  if (!asset || typeof asset !== 'object') return false;
  const a = asset as Record<string, unknown>;
  return typeof a.id === 'number' && a.id > 0 && validateAssetInput(asset);
}

// ─── Image management ────────────────────────────────────────────────

/** Copy an image file to the app's data/images directory and return the new relative path */
function copyImageToAppDir(sourcePath: string): string {
  const ext = path.extname(sourcePath).toLowerCase();
  const allowed = APP_CONFIG.upload.allowedExtensions.map(e => `.${e}`);
  if (!allowed.includes(ext)) {
    throw new Error(`Unsupported image extension: ${ext}`);
  }

  const stats = fs.statSync(sourcePath);
  if (stats.size > APP_CONFIG.upload.maxFileSize) {
    throw new Error(`Image exceeds maximum file size of ${APP_CONFIG.upload.maxFileSize} bytes`);
  }

  const hash = crypto.randomUUID();
  const filename = `${hash}${ext}`;
  const destPath = path.join(getImagesDir(), filename);
  fs.copyFileSync(sourcePath, destPath);
  return filename;
}

/** Resolve an image identifier to an absolute path (supports both legacy absolute paths and new filenames) */
function resolveImagePath(image: string): string {
  if (path.isAbsolute(image)) {
    return image; // Legacy absolute path
  }
  return path.join(getImagesDir(), image);
}

// ─── IPC handlers ────────────────────────────────────────────────────

function registerIpcHandlers(): void {
  const db = getDb();

  // Get all assets
  ipcMain.handle(IPC_CHANNELS.GET_ASSETS, () => {
    return db.prepare('SELECT * FROM assets ORDER BY createdAt DESC').all();
  });

  // Get single asset by id
  ipcMain.handle(IPC_CHANNELS.GET_ASSET_BY_ID, (_, id: number) => {
    if (typeof id !== 'number' || id <= 0) {
      throw new Error('Invalid asset id');
    }
    return db.prepare('SELECT * FROM assets WHERE id = ?').get(id) ?? null;
  });

  // Add asset
  ipcMain.handle(IPC_CHANNELS.ADD_ASSET, (_, asset: unknown) => {
    if (!validateAssetInput(asset)) {
      throw new Error('Invalid asset data: title is required');
    }

    let imagePath = asset.image ?? '';
    if (imagePath && fs.existsSync(imagePath)) {
      imagePath = copyImageToAppDir(imagePath);
    }

    const result = db.prepare(
      'INSERT INTO assets (title, image, version, unity, unreal, link, linkType) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(asset.title.trim(), imagePath, asset.version ?? '', asset.unity ?? '', asset.unreal ?? '', asset.link ?? '', asset.linkType ?? '');

    return { id: result.lastInsertRowid, title: asset.title.trim(), image: imagePath, version: asset.version ?? '', unity: asset.unity ?? '', unreal: asset.unreal ?? '', link: asset.link ?? '', linkType: asset.linkType ?? '' };
  });

  // Update asset
  ipcMain.handle(IPC_CHANNELS.UPDATE_ASSET, (_, asset: unknown) => {
    if (!validateAssetUpdate(asset)) {
      throw new Error('Invalid asset data: id and title are required');
    }

    // Check if image changed — if so, copy new file
    let imagePath = asset.image ?? '';
    if (imagePath && path.isAbsolute(imagePath) && fs.existsSync(imagePath)) {
      imagePath = copyImageToAppDir(imagePath);
    }

    const result = db.prepare(
      'UPDATE assets SET title = ?, image = ?, version = ?, unity = ?, unreal = ?, link = ?, linkType = ? WHERE id = ?'
    ).run(asset.title.trim(), imagePath, asset.version ?? '', asset.unity ?? '', asset.unreal ?? '', asset.link ?? '', asset.linkType ?? '', asset.id);

    return { changes: result.changes };
  });

  // Delete asset
  ipcMain.handle(IPC_CHANNELS.DELETE_ASSET, (_, id: number) => {
    if (typeof id !== 'number' || id <= 0) {
      throw new Error('Invalid asset id');
    }
    const result = db.prepare('DELETE FROM assets WHERE id = ?').run(id);
    return { changes: result.changes };
  });

  // Clear all assets
  ipcMain.handle(IPC_CHANNELS.CLEAR_ALL_ASSETS, () => {
    const result = db.prepare('DELETE FROM assets').run();
    return { changes: result.changes };
  });

  // File picker handler
  ipcMain.handle(IPC_CHANNELS.SELECT_FILE, async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: [...APP_CONFIG.upload.allowedExtensions] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // Close app handler
  ipcMain.handle(IPC_CHANNELS.CLOSE_APP, () => {
    app.quit();
  });

  // Read image file and convert to base64
  ipcMain.handle(IPC_CHANNELS.READ_IMAGE, (_, imagePath: string) => {
    try {
      const resolvedPath = resolveImagePath(imagePath);
      if (!fs.existsSync(resolvedPath)) return null;

      const buffer = fs.readFileSync(resolvedPath);
      const base64 = buffer.toString('base64');
      const ext = path.extname(resolvedPath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
      };
      const mimeType = mimeTypes[ext] || 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      log.error('Error reading image:', error);
      return null;
    }
  });

  // Open URL in external browser
  ipcMain.handle(IPC_CHANNELS.OPEN_EXTERNAL, async (_, url: string) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch (error) {
      log.error('Error opening URL:', error);
      return false;
    }
  });

  // ─── Window controls ────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.MINIMIZE_WINDOW, () => {
    mainWindow?.minimize();
  });

  // ─── Categories ────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.GET_CATEGORIES, () => {
    return db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  });

  ipcMain.handle(IPC_CHANNELS.ADD_CATEGORY, (_, category: unknown) => {
    if (!category || typeof category !== 'object') throw new Error('Invalid category data');
    const c = category as Record<string, unknown>;
    if (typeof c.name !== 'string' || !c.name.trim()) throw new Error('Category name is required');
    const color = (typeof c.color === 'string' && c.color) ? c.color : '#667eea';

    const result = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)').run(c.name.trim(), color);
    return { id: result.lastInsertRowid, name: c.name.trim(), color };
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_CATEGORY, (_, category: unknown) => {
    if (!category || typeof category !== 'object') throw new Error('Invalid category data');
    const c = category as Record<string, unknown>;
    if (typeof c.id !== 'number' || c.id <= 0) throw new Error('Invalid category id');
    if (typeof c.name !== 'string' || !c.name.trim()) throw new Error('Category name is required');
    const color = (typeof c.color === 'string' && c.color) ? c.color : '#667eea';

    const result = db.prepare('UPDATE categories SET name = ?, color = ? WHERE id = ?').run(c.name.trim(), color, c.id);
    return { changes: result.changes };
  });

  ipcMain.handle(IPC_CHANNELS.DELETE_CATEGORY, (_, id: number) => {
    if (typeof id !== 'number' || id <= 0) throw new Error('Invalid category id');
    // Junction rows are removed automatically via ON DELETE CASCADE
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return { changes: result.changes };
  });

  ipcMain.handle(IPC_CHANNELS.GET_ASSET_CATEGORIES, (_, assetId: number) => {
    if (typeof assetId !== 'number' || assetId <= 0) throw new Error('Invalid asset id');
    return db.prepare(`
      SELECT c.* FROM categories c
      INNER JOIN asset_categories ac ON ac.categoryId = c.id
      WHERE ac.assetId = ?
      ORDER BY c.name ASC
    `).all(assetId);
  });

  ipcMain.handle(IPC_CHANNELS.SET_ASSET_CATEGORIES, (_, assetId: number, categoryIds: unknown) => {
    if (typeof assetId !== 'number' || assetId <= 0) throw new Error('Invalid asset id');
    if (!Array.isArray(categoryIds)) throw new Error('Invalid category ids');

    const validIds = categoryIds.filter((id): id is number => typeof id === 'number' && id > 0);

    const setCategories = db.transaction((aId: number, cIds: number[]) => {
      db.prepare('DELETE FROM asset_categories WHERE assetId = ?').run(aId);
      const insert = db.prepare('INSERT OR IGNORE INTO asset_categories (assetId, categoryId) VALUES (?, ?)');
      for (const cId of cIds) {
        insert.run(aId, cId);
      }
    });
    setCategories(assetId, validIds);
  });

  ipcMain.handle(IPC_CHANNELS.MAXIMIZE_WINDOW, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle(IPC_CHANNELS.IS_MAXIMIZED, () => {
    return mainWindow?.isMaximized() ?? false;
  });

  // ─── Import assets ──────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.IMPORT_ASSETS, (_, assets: unknown) => {
    if (!Array.isArray(assets)) {
      throw new Error('Invalid import data: expected an array');
    }

    const insert = db.prepare(
      'INSERT INTO assets (title, image, version, unity, unreal, link, linkType) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    const importMany = db.transaction((items: unknown[]) => {
      let imported = 0;
      for (const item of items) {
        if (validateAssetInput(item)) {
          insert.run(
            item.title.trim(),
            item.image ?? '',
            item.version ?? '',
            item.unity ?? '',
            item.unreal ?? '',
            item.link ?? '',
            item.linkType ?? '',
          );
          imported++;
        }
      }
      return imported;
    });

    const imported = importMany(assets);
    return { imported };
  });

  // ─── Settings ───────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.key] = row.value;
    return settings;
  });

  ipcMain.handle(IPC_CHANNELS.SET_SETTING, (_, key: string, value: string) => {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new Error('Invalid setting: key and value must be strings');
    }
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  });

  // ─── Export / Import (all tables) ───────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.EXPORT_DATA, () => {
    const assets = db.prepare('SELECT * FROM assets ORDER BY id ASC').all();
    const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
    const assetCategories = db.prepare('SELECT * FROM asset_categories ORDER BY assetId, categoryId').all();

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      assets,
      categories,
      assetCategories,
    };
  });

  ipcMain.handle(IPC_CHANNELS.IMPORT_DATA, (_, data: unknown) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid import data');
    }

    const d = data as Record<string, unknown>;
    const assets = Array.isArray(d.assets) ? d.assets : [];
    const categories = Array.isArray(d.categories) ? d.categories : [];
    const assetCategories = Array.isArray(d.assetCategories) ? d.assetCategories : [];

    const importAll = db.transaction(() => {
      let importedAssets = 0;
      let importedCategories = 0;

      // Map old IDs → new IDs for relationship linking
      const assetIdMap = new Map<number, number>();
      const categoryIdMap = new Map<number, number>();

      // Import categories
      const insertCat = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
      for (const cat of categories) {
        if (!cat || typeof cat !== 'object') continue;
        const c = cat as Record<string, unknown>;
        if (typeof c.name !== 'string' || !c.name.trim()) continue;
        const color = typeof c.color === 'string' ? c.color : '#667eea';

        // Skip if category with same name already exists
        const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(c.name.trim()) as { id: number } | undefined;
        if (existing) {
          categoryIdMap.set(c.id as number, existing.id);
        } else {
          const result = insertCat.run(c.name.trim(), color);
          categoryIdMap.set(c.id as number, result.lastInsertRowid as number);
          importedCategories++;
        }
      }

      // Import assets
      const insertAsset = db.prepare(
        'INSERT INTO assets (title, image, version, unity, unreal, link, linkType) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      for (const item of assets) {
        if (!validateAssetInput(item)) continue;
        const result = insertAsset.run(
          item.title.trim(),
          item.image ?? '',
          item.version ?? '',
          item.unity ?? '',
          item.unreal ?? '',
          item.link ?? '',
          item.linkType ?? '',
        );
        assetIdMap.set((item as unknown as Record<string, unknown>).id as number, result.lastInsertRowid as number);
        importedAssets++;
      }

      // Restore asset ↔ category relationships
      const insertRel = db.prepare('INSERT OR IGNORE INTO asset_categories (assetId, categoryId) VALUES (?, ?)');
      for (const rel of assetCategories) {
        if (!rel || typeof rel !== 'object') continue;
        const r = rel as Record<string, unknown>;
        const newAssetId = assetIdMap.get(r.assetId as number);
        const newCatId = categoryIdMap.get(r.categoryId as number);
        if (newAssetId && newCatId) {
          insertRel.run(newAssetId, newCatId);
        }
      }

      return { assets: importedAssets, categories: importedCategories };
    });

    return importAll();
  });
}

// ─── Window state persistence ────────────────────────────────────────

const WINDOW_STATE_KEY = 'window-state';

interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
}

function loadWindowState(): WindowState {
  try {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(WINDOW_STATE_KEY) as { value: string } | undefined;
    if (row) return JSON.parse(row.value);
  } catch { /* ignore */ }
  return {
    width: APP_CONFIG.window.width,
    height: APP_CONFIG.window.height,
    isMaximized: false,
  };
}

function saveWindowState(): void {
  if (!mainWindow) return;
  try {
    const db = getDb();
    const isMaximized = mainWindow.isMaximized();
    // Save the normal (non-maximized) bounds so restore works correctly
    const bounds = isMaximized ? mainWindow.getNormalBounds() : mainWindow.getBounds();
    const state: WindowState = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized,
    };
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(WINDOW_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    log.error('Failed to save window state:', e);
  }
}

// ─── Window management ───────────────────────────────────────────────

const createWindow = (): void => {
  const state = loadWindowState();

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: APP_CONFIG.window.minWidth,
    minHeight: APP_CONFIG.window.minHeight,
    frame: false,
    titleBarStyle: 'hidden',
    // Evita flash branco: janela fica invisível até estar pronta
    show: false,
    backgroundColor: '#f5f5f5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Restore maximized state
  if (state.isMaximized) {
    mainWindow.maximize();
  }

  // Exibe a janela somente quando o conteúdo estiver totalmente renderizado
  const win = mainWindow;
  win.once('ready-to-show', () => {
    win.show();
  });

  // Save window state on move, resize, maximize, and unmaximize
  win.on('resize', saveWindowState);
  win.on('move', saveWindowState);
  win.on('maximize', saveWindowState);
  win.on('unmaximize', saveWindowState);
  win.on('close', saveWindowState);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open DevTools in development only
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }
};

// ─── App lifecycle ───────────────────────────────────────────────────

app.on('ready', () => {
  getDb(); // Initialize database
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
