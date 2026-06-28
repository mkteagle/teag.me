import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-session";
import { getDb } from "@/lib/db";
import { passkeys as passkeysTable } from "@/lib/db/schema";
import {
  PasskeyManager,
  type PasskeyRow,
} from "@/components/auth/passkey-manager";

export const metadata = {
  title: "Settings · teag.me",
};

export default async function SettingsPage() {
  const user = await requireUser();
  const db = getDb();

  const rows = await db
    .select({
      id: passkeysTable.id,
      name: passkeysTable.name,
      deviceType: passkeysTable.deviceType,
      createdAt: passkeysTable.createdAt,
    })
    .from(passkeysTable)
    .where(eq(passkeysTable.userId, user.id));

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage how you sign in to teag.me.
        </p>
      </div>

      <div className="max-w-2xl">
        <PasskeyManager passkeys={rows as PasskeyRow[]} />
      </div>
    </div>
  );
}
