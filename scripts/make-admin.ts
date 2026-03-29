export {};

const postgres = require("postgres");
require("dotenv").config();

const userId = process.argv[2];

if (!userId) {
  console.error("Please provide a user ID as a command line argument");
  console.error("Usage: node make-admin.ts <userId>");
  process.exit(1);
}

const connectionString =
  process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Missing PRODUCTION_DATABASE_URL or DATABASE_URL");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function makeAdmin() {
  try {
    const [user] = await sql`
      update "User"
      set "role" = 'ADMIN', "updatedAt" = now()
      where "id" = ${userId}
      returning "id", "email", "role"
    `;

    if (!user) {
      throw new Error("User not found");
    }

    console.log("✅ Successfully updated user to admin:", user);
  } catch (error) {
    console.error("❌ Error updating user:", error);
  } finally {
    await sql.end();
  }
}

makeAdmin();
