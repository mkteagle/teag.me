"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DisclosureMenu({ label, trigger, triggerClassName, children }: {
  label: string;
  trigger: ReactNode;
  triggerClassName?: string;
  children: ReactNode;
}) {
  return (
    <details
      className="relative shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !event.currentTarget.open) return;
        event.preventDefault();
        const menu = event.currentTarget;
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }}
    >
      <summary aria-label={label} className={cn(
        "flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden",
        triggerClassName
      )}>
        {trigger}
      </summary>
      <div
        className="absolute right-0 top-full z-30 mt-2 min-w-44 rounded-xl border bg-popover p-1 text-sm shadow-lg"
        onClick={(event) => {
          if (!(event.target instanceof Element) || !event.target.closest("a, button")) return;
          const menu = event.currentTarget.closest("details");
          if (menu) {
            menu.open = false;
            menu.querySelector("summary")?.focus();
          }
        }}
      >
        {children}
      </div>
    </details>
  );
}

export const disclosureItemClass = "flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-left font-medium hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50";
