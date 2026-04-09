import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// For local development using the SQLite file created by wrangler
const localDbPath = path.resolve(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/e833abeb83abd38e60de8166ab13bbd4d7a5636dc148a7fd8ec47b7678c87854.sqlite');

let db: any;

export function getDb() {
  if (db) return db;

  if (process.env.NODE_ENV === 'development') {
    const sqlite = new Database(localDbPath);
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
