import { WorkspaceHeader } from "@/components/layout/workspace-header";
import { Footer } from "@/components/layout/footer";
import { requireUser } from "@/lib/auth-session";
import { isAdmin } from "@/lib/auth-utils";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const showAdmin = await isAdmin(user.id);

  return (
    <div className="flex min-h-dvh flex-col">
      <WorkspaceHeader showAdmin={showAdmin} />
      <main className="w-full min-w-0 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
