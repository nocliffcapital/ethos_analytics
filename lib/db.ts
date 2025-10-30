import { Pool, PoolClient } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Log slow queries
  if (duration > 1000) {
    console.warn(`Slow query (${duration}ms):`, text);
  }
  
  return res.rows;
}

export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

export { pool };

