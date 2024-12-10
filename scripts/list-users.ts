
// @ts-ignore
const { PrismaClient } = require("@prisma/client") as { PrismaClient: any };
require("dotenv").config();

// @ts-ignore
const prisma = new PrismaClient({
  datasourceUrl: process.env.PRODUCTION_DATABASE_URL,
});

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    console.log("Users:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("❌ Error listing users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
