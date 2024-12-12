"use client";
import { Home, QrCode, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const menuItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: QrCode, label: "Generate", href: "/generate" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
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

  // Create navigation items array including admin link when available
  const navigationItems = [
    ...menuItems,
    ...(isAdminUser
      ? [{ icon: Shield, label: "Admin", href: "/admin/dashboard" }]
      : []),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/10 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-around h-16">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full px-2 hover:bg-white/5",
                isActive && "text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="flex flex-col items-center justify-center flex-1 h-full px-2 hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </nav>
  );
}
