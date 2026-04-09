import 'server-only';
import * as schema from './schema';

let db: any;

export function getDb() {
  if (db) return db;

  if (process.env.NODE_ENV === 'development') {
    const Database = require('better-sqlite3');
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    const path = require('path');
    const fs = require('fs');

    function getLocalDbPath() {
      const baseDir = path.resolve(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
      if (!fs.existsSync(baseDir)) return null;
      
      const files = fs.readdirSync(baseDir);
      const dbFiles = files
        .filter((f: any) => f.endsWith('.sqlite') && !f.includes('metadata.sqlite'))
        .map((f: any) => {
          const fullPath = path.join(baseDir, f);
          return { name: fullPath, time: fs.statSync(fullPath).mtime.getTime() };
        })
        .sort((a: any, b: any) => b.time - a.time);
        
      return dbFiles.length > 0 ? dbFiles[0].name : null;
    }

    const dbPath = getLocalDbPath();
    console.log('Using local DB path:', dbPath);
    if (!dbPath) throw new Error('No local D1 database found. Run migrations.');
    const sqlite = new Database(dbPath);
    db = drizzle(sqlite, { schema });
  } else {
    // Production (Vercel) uses D1 HTTP Bridge
    const { D1HttpDatabase } = require('./d1-http');
    const { drizzle: d1Drizzle } = require('drizzle-orm/d1');
    const d1 = new D1HttpDatabase(
      process.env.CLOUDFLARE_ACCOUNT_ID!,
      process.env.CLOUDFLARE_DATABASE_ID!,
      process.env.CLOUDFLARE_D1_TOKEN!
    );
    db = d1Drizzle(d1, { schema });
  }
  return db;
}

export { schema };
