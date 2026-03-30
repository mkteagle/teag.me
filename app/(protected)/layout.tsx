import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Footer } from "@/components/layout/footer";
import { requireUser } from "@/lib/auth-session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          {children}
        </main>
        <Footer />
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
