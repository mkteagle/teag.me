import { findUserRole, upsertUser } from "@/lib/db/queries";

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    return (await findUserRole(userId)) === "ADMIN";
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
  return upsertUser(userData);
}
