export {};

const postgres = require("postgres");
require("dotenv").config();

const connectionString =
  process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Missing PRODUCTION_DATABASE_URL or DATABASE_URL");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function listUsers() {
  try {
    const users = await sql`
      select "id", "email", "name", "role"
      from "User"
      order by "createdAt" desc
    `;

    console.log("Users:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("❌ Error listing users:", error);
  } finally {
    await sql.end();
  }
}

listUsers();
