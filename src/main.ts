/**
 * Main Process Entry Point
 * Handles Electron app lifecycle and IPC communication
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import started from 'electron-squirrel-startup';
import { getDb, getImagesDir } from './core/database';
import { APP_CONFIG } from './config/app.config';
import { IPC_CHANNELS } from './config/constants';
import type { AssetInput, AssetUpdate } from './types/asset.types';

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
    (a.unity === undefined || a.unity === '' || typeof a.unity === 'string') &&
    (a.unreal === undefined || a.unreal === '' || typeof a.unreal === 'string') &&
    (a.link === undefined || a.link === '' || typeof a.link === 'string')
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
      'INSERT INTO assets (title, image, unity, unreal, link) VALUES (?, ?, ?, ?, ?)'
    ).run(asset.title.trim(), imagePath, asset.unity ?? '', asset.unreal ?? '', asset.link ?? '');

    return { id: result.lastInsertRowid, title: asset.title.trim(), image: imagePath, unity: asset.unity ?? '', unreal: asset.unreal ?? '', link: asset.link ?? '' };
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
      'UPDATE assets SET title = ?, image = ?, unity = ?, unreal = ?, link = ? WHERE id = ?'
    ).run(asset.title.trim(), imagePath, asset.unity ?? '', asset.unreal ?? '', asset.link ?? '', asset.id);

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
      console.error('Error reading image:', error);
      return null;
    }
  });

  // Open URL in external browser
  ipcMain.handle(IPC_CHANNELS.OPEN_EXTERNAL, async (_, url: string) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch (error) {
      console.error('Error opening URL:', error);
      return false;
    }
  });
}

// ─── Window management ───────────────────────────────────────────────

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: APP_CONFIG.window.width,
    height: APP_CONFIG.window.height,
    minWidth: APP_CONFIG.window.minWidth,
    minHeight: APP_CONFIG.window.minHeight,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open DevTools in development
  mainWindow.webContents.openDevTools();
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
