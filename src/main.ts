/**
 * Main Process Entry Point
 * Handles Electron app lifecycle and IPC communication
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';
import { database } from './core/database';
import { APP_CONFIG } from './config/app.config';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: APP_CONFIG.window.width,
    height: APP_CONFIG.window.height,
    minWidth: APP_CONFIG.window.minWidth,
    minHeight: APP_CONFIG.window.minHeight,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // IPC handlers for CRUD operations
  ipcMain.handle('get-assets', async () => {
    return new Promise((resolve, reject) => {
      database.getDb().all('SELECT * FROM assets ORDER BY createdAt DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });

  ipcMain.handle('add-asset', async (_, asset) => {
    return new Promise((resolve, reject) => {
      database.getDb().run(
        'INSERT INTO assets (title, image, unity, unreal, link) VALUES (?, ?, ?, ?, ?)',
        [asset.title, asset.image, asset.unity, asset.unreal, asset.link],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...asset });
          }
        }
      );
    });
  });

  ipcMain.handle('update-asset', async (_, asset) => {
    return new Promise((resolve, reject) => {
      database.getDb().run(
        'UPDATE assets SET title = ?, image = ?, unity = ?, unreal = ?, link = ? WHERE id = ?',
        [asset.title, asset.image, asset.unity, asset.unreal, asset.link, asset.id],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  });

  ipcMain.handle('delete-asset', async (_, id) => {
    return new Promise((resolve, reject) => {
      database.getDb().run('DELETE FROM assets WHERE id = ?', [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  });

  // File picker handler
  ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // Close app handler
  ipcMain.handle('close-app', () => {
    app.quit();
  });

  // Read image file and convert to base64
  ipcMain.handle('read-image', async (_, filePath) => {
    try {
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      const ext = path.extname(filePath).toLowerCase();
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
  ipcMain.handle('open-external', async (_, url) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch (error) {
      console.error('Error opening URL:', error);
      return false;
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Initialize the database
  database.getDb();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
