"use client";

import { Home, QrCode, Shield, LogOut, PanelLeftClose, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarResizeHandle,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { TeagMark } from "@/components/brand/teag-mark";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: QrCode, label: "Generate", href: "/generate" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin/check");
        if (!response.ok) throw new Error("Failed to check admin status");
        const data = await response.json();
        setIsAdminUser(data.isAdmin);
      } catch {
        setIsAdminUser(false);
      }
    };
    const checkPlan = async () => {
      try {
        const response = await fetch("/api/plan");
        if (response.ok) {
          const data = await response.json();
          setPlan(data.plan);
        }
      } catch {
        // ignore
      }
    };
    checkAdminStatus();
    checkPlan();
  }, []);

  const isCollapsed = state === "collapsed";

  return (
    <ShadcnSidebar collapsible="icon" className="bg-card/50">
      <SidebarHeader className="p-4">
        {!isCollapsed && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TeagMark tileClassName="h-9 w-9 rounded-xl" className="h-5 w-5" />
              <h1 className="text-lg font-semibold tracking-tight">teag.me</h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground mx-auto"
          >
            <TeagMark tileClassName="h-8 w-8 rounded-lg shadow-none" className="h-4 w-4" />
          </button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className="h-9"
                >
                  <Link href={item.href}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}

          {isAdminUser && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/admin/dashboard"}
                tooltip="Admin"
                className="h-9"
              >
                <Link href="/admin/dashboard">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <SidebarMenu>
          {plan !== "PRO" && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/upgrade"}
                tooltip="Upgrade"
                className="h-9 text-primary"
              >
                <Link href="/upgrade">
                  <Zap className="w-4 h-4" />
                  <span>Upgrade to Pro</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              className="h-9 text-muted-foreground hover:text-destructive"
              onClick={async () => await logout()}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarResizeHandle />
    </ShadcnSidebar>
  );
}
