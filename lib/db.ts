/**
 * Database connection layer for Nimbus
 * Uses pg (node-postgres) with connection pooling
 */

import { Pool } from 'pg';
import config from '@/config';

// Singleton pattern for database connection pool
let pool: Pool | null = null;

/**
 * Get or create the database connection pool
 * Uses config file for hackathon demo, falls back to environment variables
 */
export function getDb(): Pool {
  if (!pool) {
    // Use config file first (for hackathon demo), then fall back to env vars
    const connectionString = config.databaseUrl || process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('Database configuration not found. Check config.ts or DATABASE_URL environment variable.');
    }

    pool = new Pool({
      connectionString,
      // Connection pool settings
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      // SSL is typically required for production databases
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    console.log('✅ Database connection pool initialized');
  }

  return pool;
}

/**
 * Execute a query with proper error handling
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const db = getDb();
  try {
    const result = await db.query<T>(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Close the database connection pool (useful for cleanup in tests)
 */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

