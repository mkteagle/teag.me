"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

/**
 * Minimal replacement for @radix-ui/react-slot. Merges its own props onto a
 * single child element: classNames are merged (tailwind-aware), styles shallow
 * merged, event handlers composed (slot handler runs, then the child's), and
 * refs forwarded. Used for `asChild` patterns (e.g. <Button asChild><Link/>).
 */
export const Slot = React.forwardRef<HTMLElement, { children?: React.ReactNode } & Record<string, unknown>>(
  function Slot({ children, ...slotProps }, ref) {
    if (!React.isValidElement(children)) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child = children as React.ReactElement<any>;
    const childProps = child.props ?? {};
    const merged: Record<string, unknown> = { ...slotProps, ...childProps };

    if (slotProps.className || childProps.className) {
      merged.className = cn(slotProps.className as string, childProps.className);
    }
    if (slotProps.style || childProps.style) {
      merged.style = {
        ...(slotProps.style as React.CSSProperties),
        ...childProps.style,
      };
    }

    for (const key of Object.keys(slotProps)) {
      if (/^on[A-Z]/.test(key) && typeof slotProps[key] === "function") {
        const slotHandler = slotProps[key] as (...a: unknown[]) => void;
        const childHandler = childProps[key] as ((...a: unknown[]) => void) | undefined;
        merged[key] = childHandler
          ? (...args: unknown[]) => {
              slotHandler(...args);
              childHandler(...args);
            }
          : slotHandler;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    merged.ref = mergeRefs(ref, (child as any).ref);
    return React.cloneElement(child, merged);
  }
);
