// components/sidebar.tsx
"use client";

import { Home, QrCode, Shield, LogOut, Activity } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/auth";
import { useState, useEffect } from "react";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", kbd: "⌘1" },
  { icon: QrCode, label: "Generate", href: "/generate", kbd: "⌘2" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAdminStatus = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const response = await fetch("/api/admin/check", {
          headers: {
            Authorization: `Bearer ${userId}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to check admin status");
        }

        const data = await response.json();
        setIsAdminUser(data.isAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdminUser(false);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <ShadcnSidebar className="w-64 border-r-2 border-foreground bg-card">
      <SidebarHeader className="border-b-2 border-foreground p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <Activity className="w-6 h-6 text-primary" strokeWidth={2.5} />
            <h1 className="text-2xl font-mono font-bold tracking-tight">
              teag.me
            </h1>
          </div>
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            QR Analytics
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`w-full transition-all duration-150 font-mono text-sm ${
                    isActive
                      ? "bg-foreground text-background border-2 border-foreground"
                      : "border-2 border-transparent hover:border-primary hover:text-primary"
                  }`}
                  style={{
                    animationDelay: mounted ? `${index * 50}ms` : '0ms',
                  }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" strokeWidth={2.5} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <kbd className="text-xs opacity-50">{item.kbd}</kbd>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <div className="receipt-line" />

        <div className="space-y-4 mt-6">
          <div className="px-2">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
              System
            </div>
          </div>

          <SidebarMenu className="space-y-1">
            {isAdminUser && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/dashboard"}
                  className={`w-full font-mono text-sm border-2 transition-all duration-150 ${
                    pathname === "/admin/dashboard"
                      ? "bg-foreground text-background border-foreground"
                      : "border-transparent hover:border-primary hover:text-primary"
                  }`}
                >
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Shield className="w-4 h-4" strokeWidth={2.5} />
                    <span className="font-medium">Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton
                className="w-full font-mono text-sm border-2 border-transparent hover:border-destructive hover:text-destructive transition-all duration-150"
                onClick={async () => await logout()}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  <span className="font-medium">Sign Out</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <div className="mt-auto p-6 border-t-2 border-dashed border-border">
        <div className="font-mono text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>STATUS</span>
            <span className="text-primary">ONLINE</span>
          </div>
          <div className="flex justify-between">
            <span>VERSION</span>
            <span>2.0.1</span>
          </div>
        </div>
      </div>
    </ShadcnSidebar>
  );
}
