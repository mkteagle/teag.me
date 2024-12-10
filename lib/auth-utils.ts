import prisma from "@/lib/prisma";

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === "ADMIN";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function createOrUpdateUser(userData: {
  id: string;
  email: string;
  name?: string | null;
}) {
  return prisma.user.upsert({
    where: { id: userData.id },
    update: {
      email: userData.email,
      name: userData.name || undefined,
    },
    create: {
      id: userData.id,
      email: userData.email,
      name: userData.name || undefined,
    },
  });
}
