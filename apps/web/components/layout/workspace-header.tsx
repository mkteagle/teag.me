"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, UserRound } from "lucide-react";
import { TeagWordmark } from "@/components/brand/teag-mark";
import { DisclosureMenu, disclosureItemClass } from "@/components/ui/disclosure-menu";
import { logout } from "@/lib/auth-client";
import { capture } from "@/lib/posthog";
import { cn } from "@/lib/utils";

export function WorkspaceHeader({ showAdmin }: { showAdmin: boolean }) {
  const pathname = usePathname();
  const codes = pathname === "/dashboard" || pathname === "/generate" || pathname.startsWith("/analytics/");
  const linkPages = pathname === "/link-pages" || pathname.startsWith("/link-pages/");
  const activity = pathname === "/history";
  const navLink = "relative flex min-h-11 items-center whitespace-nowrap rounded-sm px-1 text-sm font-semibold sm:min-h-24 sm:px-2 sm:text-base";
  const selected = "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-full after:bg-accent sm:after:bottom-3";

  return (
    <header className="border-b bg-background">
      <div className="full-bleed grid grid-cols-[1fr_auto] items-center gap-x-3 sm:flex sm:gap-9 lg:gap-14">
        <TeagWordmark href="/dashboard" />
        <nav aria-label="Workspace" className="order-last col-span-2 flex gap-5 sm:order-none sm:gap-7">
          <Link href="/dashboard" aria-current={codes ? "page" : undefined} className={cn(navLink, codes ? selected : "text-muted-foreground hover:text-foreground")}>Codes</Link>
          <Link href="/link-pages" aria-current={linkPages ? "page" : undefined} className={cn(navLink, linkPages ? selected : "text-muted-foreground hover:text-foreground")}>Link pages</Link>
          <Link href="/history" aria-current={activity ? "page" : undefined} className={cn(navLink, activity ? selected : "text-muted-foreground hover:text-foreground")}>Activity</Link>
        </nav>
        <div className="justify-self-end sm:ml-auto">
          <DisclosureMenu
            label="Account menu"
            triggerClassName="gap-2 px-1.5 hover:bg-muted"
            trigger={<><span className="grid size-9 place-items-center rounded-full bg-muted"><UserRound aria-hidden="true" className="size-5" /></span><ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" /></>}
          >
            <Link href="/settings" className={disclosureItemClass}>Settings</Link>
            <Link href="/upgrade" className={disclosureItemClass}>Manage plan</Link>
            {showAdmin && <Link href="/admin/dashboard" className={disclosureItemClass}>Admin</Link>}
            <button type="button" className={disclosureItemClass} onClick={() => {
              capture("account_sign_out_selected");
              void logout();
            }}>Sign out</button>
          </DisclosureMenu>
        </div>
      </div>
    </header>
  );
}
