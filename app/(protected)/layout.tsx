"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <Header />
          <main className="flex-1 w-full p-4 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
