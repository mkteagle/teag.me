"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive";

export type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ToastVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

export type ToastActionElement = React.ReactElement;

function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ToastViewport({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex max-h-screen flex-col items-end gap-2 p-4 sm:right-0 md:max-w-[420px]",
        className
      )}
    >
      {children}
    </div>
  );
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  default: "border-border/80 bg-card text-card-foreground",
  destructive: "border-destructive/40 bg-destructive text-destructive-foreground",
};

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    { className, variant = "default", open = true, onOpenChange, duration = 4500, children, ...props },
    ref
  ) => {
    React.useEffect(() => {
      if (!open || duration <= 0) return;
      const t = setTimeout(() => onOpenChange?.(false), duration);
      return () => clearTimeout(t);
    }, [open, duration, onOpenChange]);

    if (!open) return null;

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border p-4 pr-9 shadow-[0_16px_50px_rgba(17,24,39,0.16)] animate-teag-rise",
          VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Toast.displayName = "Toast";

function ToastTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm font-semibold", className)} {...props} />;
}

function ToastDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm opacity-90", className)} {...props} />;
}

function ToastClose({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Close"
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  );
}

function ToastAction({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-foreground/5",
        className
      )}
      {...props}
    />
  );
}

export {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastProvider,
  ToastViewport,
};
