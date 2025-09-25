import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Use Supabase database connection for full migration
const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "SUPABASE_DB_URL must be set for Supabase migration. Did you forget to set the connection string?",
  );
}

export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle({ client: pool, schema });
