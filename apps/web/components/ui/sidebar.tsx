"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SidebarState = "expanded" | "collapsed";

type SidebarContextValue = {
  collapsed: boolean;
  state: SidebarState;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}

const STORAGE_KEY = "sidebar:collapsed";

export function SidebarProvider({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [collapsed, setCollapsedState] = React.useState(false);

  React.useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsedState(true);
    } catch {
      /* ignore */
    }
  }, []);

  const setCollapsed = React.useCallback((next: boolean) => {
    setCollapsedState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = React.useCallback(
    () => setCollapsed(!collapsed),
    [collapsed, setCollapsed]
  );

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      state: collapsed ? "collapsed" : "expanded",
      toggleSidebar,
      setCollapsed,
    }),
    [collapsed, toggleSidebar, setCollapsed]
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className={cn("flex min-h-svh w-full", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { collapsed } = useSidebar();
  return (
    <aside
      data-state={collapsed ? "collapsed" : "expanded"}
      className={cn(
        "sticky top-0 z-30 hidden h-svh shrink-0 flex-col border-r border-border/70 bg-card/60 backdrop-blur-sm transition-[width] duration-300 ease-out md:flex",
        collapsed ? "w-[76px]" : "w-[248px]",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative flex min-h-svh min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}
