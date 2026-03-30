/**
 * Database Module
 * Manages SQLite database connection and initialization using better-sqlite3
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import { app } from 'electron';
import fs from 'node:fs';
import { APP_CONFIG } from '../config/app.config';

// Use project directory instead of userData
const isDev = process.env.NODE_ENV !== 'production';
const dbDir = isDev
  ? path.join(process.cwd(), APP_CONFIG.database.directory)
  : path.join(path.dirname(app.getPath('exe')), APP_CONFIG.database.directory);

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
      unity TEXT,
      unreal TEXT,
      link TEXT,
      createdAt TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // Migration: add unreal column if it doesn't exist
  const columns = db.pragma('table_info(assets)') as Array<{ name: string }>;
  const hasUnreal = columns.some(col => col.name === 'unreal');
  if (!hasUnreal) {
    db.exec('ALTER TABLE assets ADD COLUMN unreal TEXT');
  }

  console.log('Database connected! Table "assets" is ready.');
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
