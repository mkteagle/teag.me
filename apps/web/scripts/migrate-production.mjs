import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.log("Skipping database migrations: no database URL is configured.");
  process.exit(0);
}

const sql = postgres(connectionString, {
  max: 1,
  prepare: false,
});

try {
  const db = drizzle(sql);
  await migrate(db, {
    migrationsFolder: new URL("../drizzle", import.meta.url).pathname,
  });
  console.log("Database migrations are current.");
} finally {
  await sql.end();
}
