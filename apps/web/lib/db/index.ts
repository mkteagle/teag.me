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
      prepare: false,
    });

  const db = drizzle(sql, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__teagmeSql__ = sql;
    globalThis.__teagmeDb__ = db;
  }

  return db;
}
