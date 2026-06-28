"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange"
  > {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    { className, value, defaultValue, onValueChange, min = 0, max = 100, step = 1, ...props },
    ref
  ) => {
    const current = value?.[0] ?? defaultValue?.[0] ?? min;
    const pct = max === min ? 0 : ((current - min) / (max - min)) * 100;
    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value !== undefined ? value[0] : undefined}
        defaultValue={value === undefined ? defaultValue?.[0] : undefined}
        onChange={(e) => onValueChange?.([Number(e.target.value)])}
        className={cn("teag-slider h-1.5 w-full cursor-pointer", className)}
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--primary) / 0.2) ${pct}%)`,
        }}
        {...props}
      />
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
