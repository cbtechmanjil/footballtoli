import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

import fs from 'fs';

function getLocalDbPath() {
  const baseDir = path.resolve(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
  if (!fs.existsSync(baseDir)) return null;
  
  const files = fs.readdirSync(baseDir);
  // Sort by mtime descending and exclude metadata.sqlite
  const dbFiles = files
    .filter(f => f.endsWith('.sqlite') && !f.includes('metadata.sqlite'))
    .map(f => {
      const fullPath = path.join(baseDir, f);
      return { name: fullPath, time: fs.statSync(fullPath).mtime.getTime() };
    })
    .sort((a, b) => b.time - a.time);
    
  return dbFiles.length > 0 ? dbFiles[0].name : null;
}

let db: any;

export function getDb() {
  if (db) return db;

  if (process.env.NODE_ENV === 'development') {
    const dbPath = getLocalDbPath();
    console.log('Using local DB path:', dbPath);
    if (!dbPath) throw new Error('No local D1 database found. Run migrations.');
    const sqlite = new Database(dbPath);
    db = drizzle(sqlite, { schema });
  } else {
    // TODO: Implement D1 HTTP API over fetch for Vercel production
    // For now, this is a placeholder. In a real scenario, we'd use 
    // the Cloudflare D1 HTTP API via fetch.
    throw new Error('Production D1 connection not yet implemented. Requires Cloudflare API tokens.');
  }
  return db;
}

export { schema };
