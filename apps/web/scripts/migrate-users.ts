export {};

const admin = require("firebase-admin");
const postgres = require("postgres");
require("dotenv").config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const connectionString =
  process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Missing PRODUCTION_DATABASE_URL or DATABASE_URL");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function migrateUsers() {
  try {
    // Get all unique userIds from QRCodes
    const qrCodes = await sql`
      select distinct "userId"
      from "QRCode"
      where "userId" is not null
    `;

    console.log(`Found ${qrCodes.length} unique users to migrate`);

    // For each userId, try to get user info from Firebase and create User record
    for (const { userId } of qrCodes) {
      if (!userId) continue;

      try {
        const firebaseUser = await admin.auth().getUser(userId);

        await sql`
          insert into "User" ("id", "email", "name", "role", "createdAt", "updatedAt")
          values (
            ${userId},
            ${firebaseUser.email || `${userId}@placeholder.com`},
            ${firebaseUser.displayName || null},
            'USER',
            now(),
            now()
          )
          on conflict ("id") do nothing
        `;

        console.log(`Created user record for ${userId}`);
      } catch (error) {
        console.error(`Failed to process user ${userId}:`, error);
      }
    }

    console.log("Migration completed");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

migrateUsers();
