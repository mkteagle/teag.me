"use client";

import { Home, QrCode, BarChart, Settings, LogOut } from "lucide-react";
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

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: QrCode, label: "Generate QR", href: "/generate" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <ShadcnSidebar className="w-64 border-r border-slate-800 bg-slate-900">
      <SidebarHeader className="border-b border-slate-800">
        <div className="flex items-center justify-center h-16 px-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            QR Tracker
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`w-full transition-all duration-200 ${
                    isActive
                      ? "bg-slate-800/50 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2"
                  >
                    <item.icon
                      className={`w-5 h-5 ${isActive ? "text-blue-400" : ""}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full text-slate-400 hover:text-white hover:bg-slate-800/30 transition-all duration-200"
              onClick={async () => await logout()}
            >
              <div className="flex items-center gap-3 px-4 py-2">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </ShadcnSidebar>
  );
}
