// scripts/migrate-users.ts
const { PrismaClient } = require("@prisma/client");
const admin = require("firebase-admin");
const path = require("path");
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

const prisma = new PrismaClient();

async function migrateUsers() {
  try {
    // Get all unique userIds from QRCodes
    const qrCodes = await prisma.qRCode.findMany({
      select: {
        userId: true,
      },
      distinct: ["userId"],
      where: {
        userId: {
          not: null,
        },
      },
    });

    console.log(`Found ${qrCodes.length} unique users to migrate`);

    // For each userId, try to get user info from Firebase and create User record
    for (const { userId } of qrCodes) {
      if (!userId) continue;

      try {
        const firebaseUser = await admin.auth().getUser(userId);

        await prisma.user.create({
          data: {
            id: userId,
            email: firebaseUser.email || `${userId}@placeholder.com`,
            name: firebaseUser.displayName || null,
            role: "USER",
          },
        });

        console.log(`Created user record for ${userId}`);
      } catch (error) {
        console.error(`Failed to process user ${userId}:`, error);
      }
    }

    console.log("Migration completed");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsers();
