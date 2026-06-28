import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __teagmeSql__: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __teagmeDb__:
    | ReturnType<typeof drizzle<typeof schema>>
    | undefined;
}

export function getDb() {
  if (globalThis.__teagmeDb__) {
    return globalThis.__teagmeDb__;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL.");
  }

  const sql =
    globalThis.__teagmeSql__ ??
    postgres(connectionString, {
      // Required for transaction-pooled / PgBouncer-style connections.
      prepare: false,
      // Serverless connection hygiene. Each function instance keeps at most one
      // connection and lets it go idle quickly, so we never pile up open
      // connections and hit Postgres "sorry, too many clients already".
      max: 1,
      idle_timeout: 20, // close a connection after 20s idle
      max_lifetime: 60 * 30, // recycle a connection every 30 min
      connect_timeout: 10,
    });

  const db = drizzle(sql, { schema });

  // Cache the client + db in EVERY environment (including production). Serverless
  // instances are reused across invocations, so caching means we reuse one pool
  // instead of opening a brand-new one on every getDb() call (the bug that
  // exhausted the database). The previous code cached only outside production.
  globalThis.__teagmeSql__ = sql;
  globalThis.__teagmeDb__ = db;

  return db;
}
