import Database from 'better-sqlite3';
import { config } from './env';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export const getDatabase = (): Database.Database => {
  if (!db) {
    // Ensure data directory exists
    const dbDir = path.dirname(config.database.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(config.database.path, {
      verbose: config.nodeEnv === 'development' ? console.log : undefined,
    });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    console.log(`✅ Database connected: ${config.database.path}`);
  }

  return db;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});
