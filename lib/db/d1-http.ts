interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: {
    duration: number;
    rows_read: number;
    rows_written: number;
  };
}

export class D1HttpDatabase {
  private accountId: string;
  private databaseId: string;
  private token: string;
  private baseUrl: string;

  constructor(accountId: string, databaseId: string, token: string) {
    this.accountId = accountId;
    this.databaseId = databaseId;
    this.token = token;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}`;
  }

  async query<T>(sql: string, params: any[] = []): Promise<D1Result<T>> {
    const res = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql,
        params,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`D1 HTTP Error: ${error.errors?.[0]?.message || res.statusText}`);
    }

    const data = await res.json();
    const result = data.result[0];

    return {
      results: result.results,
      success: result.success,
      meta: result.meta,
    };
  }

  prepare(sql: string) {
    return new D1PreparedStatement(this, sql);
  }

  async batch(statements: D1PreparedStatement[]) {
    // Simplified batch for now or implement if needed
    const results = [];
    for (const stmt of statements) {
      results.push(await stmt.all());
    }
    return results;
  }
}

class D1PreparedStatement {
  private db: D1HttpDatabase;
  private sql: string;
  private params: any[];

  constructor(db: D1HttpDatabase, sql: string, params: any[] = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }

  bind(...params: any[]) {
    return new D1PreparedStatement(this.db, this.sql, params);
  }

  async all<T = unknown>() {
    return this.db.query<T>(this.sql, this.params);
  }

  async run() {
    return this.db.query(this.sql, this.params);
  }

  async first<T = unknown>(colName?: string) {
    const { results } = await this.all<any>();
    const row = results?.[0];
    if (!row) return null;
    return colName ? row[colName] : row;
  }

  async raw<T = unknown>() {
    const { results } = await this.all<any>();
    if (!results) return [];
    return results.map((row) => Object.values(row));
  }
}
