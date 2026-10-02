import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing!");
}

type PgClient = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as {
  conn?: PgClient;
};

// prepare: false is required for PgBouncer / Supavisor transaction pool (port 6543).
// Transaction-mode poolers do not support server-side prepared statements.
const client = globalForDb.conn ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });