"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 h-16 glassmorphism border-b border-primary/10">
      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <SidebarTrigger className="text-white hover:text-primary transition-colors" />
        </div>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          QR Tracker
        </h1>
      </div>
    </header>
  );
}
