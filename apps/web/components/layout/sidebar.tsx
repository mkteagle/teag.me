"use client";

import {
  Home,
  History,
  QrCode,
  Shield,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

import { Sidebar as SidebarShell, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { logout } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { TeagMark } from "@/components/brand/teag-mark";

type NavLink = { icon: LucideIcon; label: string; href: string };

const menuItems: NavLink[] = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: History, label: "History", href: "/history" },
  { icon: QrCode, label: "Generate", href: "/generate" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

function NavRow({
  item,
  active,
  collapsed,
}: {
  item: NavLink;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center rounded-xl text-sm font-medium transition-colors",
        collapsed ? "h-11 w-11 justify-center" : "h-10 w-full gap-3 px-3",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setIsAdminUser(Boolean(d?.isAdmin)))
      .catch(() => setIsAdminUser(false));
    fetch("/api/plan")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setPlan(d.plan))
      .catch(() => {});
  }, []);

  const items: NavLink[] = [
    ...menuItems,
    ...(isAdminUser
      ? [{ icon: Shield, label: "Admin", href: "/admin/dashboard" }]
      : []),
  ];

  return (
    <SidebarShell>
      {/* Header / brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/70",
          collapsed ? "justify-center px-3" : "justify-between px-4"
        )}
      >
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                className="rounded-xl transition-transform hover:scale-105"
              >
                <TeagMark tileClassName="h-9 w-9 rounded-xl" className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand</TooltipContent>
          </Tooltip>
        ) : (
          <>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <TeagMark tileClassName="h-9 w-9 rounded-xl" className="h-5 w-5" />
              <span className="font-heading text-lg font-semibold tracking-tight">
                teag.me
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="px-3 pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Workspace
          </p>
        )}
        <ul className="space-y-1">
          {items.map((item) => (
            <li
              key={item.href}
              className={cn("flex", collapsed && "justify-center")}
            >
              <NavRow
                item={item}
                active={pathname === item.href}
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border/70 px-3 py-3">
        <ul className="space-y-1">
          {plan !== "PRO" && (
            <li className={cn("flex", collapsed && "justify-center")}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/upgrade"
                      aria-label="Upgrade to Pro"
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/10"
                    >
                      <Zap className="h-[18px] w-[18px]" strokeWidth={2} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Upgrade to Pro</TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/upgrade"
                  className="flex h-10 w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <Zap className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  <span className="truncate">Upgrade to Pro</span>
                </Link>
              )}
            </li>
          )}
          <li className={cn("flex", collapsed && "justify-center")}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => logout()}
                    aria-label="Sign out"
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={() => logout()}
                className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                <span className="truncate">Sign out</span>
              </button>
            )}
          </li>
        </ul>
      </div>
    </SidebarShell>
  );
}
