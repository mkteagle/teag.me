"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClass = "w-full min-w-0 rounded-xl border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-accent";

export function EditorPanel({ label, icon, children, compact = false }: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <details className="group/editor-panel min-w-0 rounded-xl border bg-card open:border-accent/30">
      <summary className={cn(
        "flex min-w-0 cursor-pointer list-none items-center justify-between gap-3 rounded-xl font-semibold transition-colors hover:bg-secondary/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring group-open/editor-panel:rounded-b-none group-open/editor-panel:bg-primary/10 [&::-webkit-details-marker]:hidden",
        compact ? "min-h-11 px-3 text-sm" : "min-h-12 px-4",
      )}>
        <span className="flex min-w-0 items-center gap-2.5 break-words">
          {icon && <span className="shrink-0 text-accent" aria-hidden="true">{icon}</span>}
          <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
        </span>
        <span className="grid size-7 shrink-0 place-items-center rounded-md border border-border/80 bg-background/80 text-muted-foreground group-open/editor-panel:border-accent/30 group-open/editor-panel:text-accent">
          <ChevronDown className="size-4 motion-safe:transition-transform group-open/editor-panel:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div className={cn("space-y-4 border-t", compact ? "p-3" : "p-4 sm:p-5")}>{children}</div>
    </details>
  );
}

export function EditorSelect<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="block min-w-0 space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <span className="relative block">
        <select
          className={cn(inputClass, "link-page-editor-select block h-11 cursor-pointer appearance-none bg-background pr-10 leading-5 font-medium transition-colors hover:border-accent/45 disabled:cursor-default")}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value as T)}
        >
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      </span>
    </label>
  );
}
