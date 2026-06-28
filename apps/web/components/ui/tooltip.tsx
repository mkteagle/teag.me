"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { Slot } from "@/lib/slot";

function TooltipProvider({ children }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}

type TooltipCtx = {
  open: boolean;
  setOpen: (o: boolean) => void;
  triggerRef: React.RefObject<HTMLSpanElement | null>;
};
const TooltipContext = React.createContext<TooltipCtx | null>(null);

function useTooltip() {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip parts must be used within <Tooltip>");
  return ctx;
}

function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);
  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRef }}>
      <span ref={triggerRef} className="inline-flex">
        {children}
      </span>
    </TooltipContext.Provider>
  );
}

const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { asChild?: boolean }
>(({ asChild, ...props }, ref) => {
  const { setOpen } = useTooltip();
  const Comp = (asChild ? Slot : "span") as React.ElementType;
  return (
    <Comp
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...props}
    />
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

type Placement = { top: number; left: number; transform: string };

function TooltipContent({
  className,
  side = "top",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right";
}) {
  const { open, triggerRef } = useTooltip();
  const [mounted, setMounted] = React.useState(false);
  const [placement, setPlacement] = React.useState<Placement | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open || !triggerRef.current) {
      setPlacement(null);
      return;
    }
    const r = triggerRef.current.getBoundingClientRect();
    const gap = 8;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const next: Placement =
      side === "right"
        ? { top: cy, left: r.right + gap, transform: "translateY(-50%)" }
        : side === "left"
          ? { top: cy, left: r.left - gap, transform: "translate(-100%, -50%)" }
          : side === "bottom"
            ? { top: r.bottom + gap, left: cx, transform: "translateX(-50%)" }
            : { top: r.top - gap, left: cx, transform: "translate(-50%, -100%)" };
    setPlacement(next);
  }, [open, side, triggerRef]);

  if (!mounted || !open || !placement) return null;

  return createPortal(
    <div
      role="tooltip"
      style={{
        position: "fixed",
        top: placement.top,
        left: placement.left,
        transform: placement.transform,
      }}
      className={cn(
        "pointer-events-none z-[200] whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg animate-in fade-in",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
