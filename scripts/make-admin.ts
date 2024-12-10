// @ts-ignore
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const userId = process.argv[2];

if (!userId) {
  console.error("Please provide a user ID as a command line argument");
  console.error("Usage: node make-admin.ts <userId>");
  process.exit(1);
}

// @ts-ignore
const prisma = new PrismaClient({
  datasourceUrl: process.env.PRODUCTION_DATABASE_URL,
});

async function makeAdmin() {
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
    console.log("✅ Successfully updated user to admin:", user);
  } catch (error) {
    console.error("❌ Error updating user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
