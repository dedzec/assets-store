/**
 * Database Module
 * Manages SQLite database connection and initialization using better-sqlite3
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import { app } from 'electron';
import fs from 'node:fs';
import { APP_CONFIG } from '../config/app.config';
import { detectLinkType } from '../utils/string.utils';

// Use project directory in dev, userData in production
const dbDir = app.isPackaged
  ? path.join(app.getPath('userData'), APP_CONFIG.database.directory)
  : path.join(process.cwd(), APP_CONFIG.database.directory);

// Ensure directory and images subdirectory exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const imagesDir = path.join(dbDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const dbPath = path.join(dbDir, APP_CONFIG.database.name);

console.log('Database path:', dbPath);

function createDatabase(): Database.Database {
  const db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Create table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image TEXT,
      version TEXT DEFAULT '',
      unity TEXT,
      unreal TEXT,
      link TEXT,
      linkType TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // Migrations — add columns that may not exist yet
  const columns = db.pragma('table_info(assets)') as Array<{ name: string }>;
  const colNames = new Set(columns.map(c => c.name));

  if (!colNames.has('unreal')) {
    db.exec('ALTER TABLE assets ADD COLUMN unreal TEXT');
  }
  if (!colNames.has('version')) {
    db.exec("ALTER TABLE assets ADD COLUMN version TEXT DEFAULT ''");
  }
  if (!colNames.has('linkType')) {
    db.exec("ALTER TABLE assets ADD COLUMN linkType TEXT DEFAULT ''");
  }

  // Backfill: detect linkType for existing assets that have a link but no linkType
  const orphans = db.prepare("SELECT id, link FROM assets WHERE link != '' AND (linkType IS NULL OR linkType = '')").all() as Array<{ id: number; link: string }>;
  if (orphans.length > 0) {
    const update = db.prepare('UPDATE assets SET linkType = ? WHERE id = ?');
    const backfill = db.transaction((rows: Array<{ id: number; link: string }>) => {
      for (const row of rows) {
        const type = detectLinkType(row.link);
        if (type) {
          update.run(type, row.id);
        }
      }
    });
    backfill(orphans);
    console.log(`Backfilled linkType for ${orphans.length} existing asset(s).`);
  }

  // ─── Categories tables ───────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#667eea',
      createdAt TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS asset_categories (
      assetId INTEGER NOT NULL,
      categoryId INTEGER NOT NULL,
      PRIMARY KEY (assetId, categoryId),
      FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  // ─── Settings table ─────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  console.log('Database connected! Tables "assets", "categories", "settings" are ready.');
  return db;
}

/** Singleton database instance */
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = createDatabase();
  }
  return dbInstance;
}

/** Returns the images directory path */
export function getImagesDir(): string {
  return imagesDir;
}
