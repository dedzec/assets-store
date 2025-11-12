import sqlite3 from 'sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

// Use project directory instead of userData
const isDev = process.env.NODE_ENV !== 'production';
const dbDir = isDev 
  ? path.join(process.cwd(), 'data') 
  : path.join(path.dirname(app.getPath('exe')), 'data');

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'database.sqlite');

console.log('Database path:', dbPath);

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database', err);
      } else {
        console.log('Database connected!');
        this.init();
      }
    });
  }

  private init() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        image TEXT,
        unity TEXT,
        unreal TEXT,
        link TEXT,
        createdAt TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table', err);
      } else {
        console.log('Table "assets" is ready.');
        // Add unreal column if it doesn't exist (migration for existing databases)
        this.db.run(`ALTER TABLE assets ADD COLUMN unreal TEXT`, (alterErr) => {
          if (alterErr && !alterErr.message.includes('duplicate column')) {
            console.error('Error adding unreal column', alterErr);
          }
        });
      }
    });
  }

  getDb() {
    return this.db;
  }
}

export const database = new Database();
