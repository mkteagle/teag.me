"use client";

import { Label } from "@/components/ui/label";
import { Maximize2 } from "lucide-react";

interface LogoSizeSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function LogoSizeSlider({ value, onChange, disabled }: LogoSizeSliderProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-mono uppercase tracking-wider flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4" />
          Logo Size
        </span>
        <span className="mono-badge">{value}%</span>
      </Label>

      <div className="space-y-2">
        <input
          type="range"
          min="15"
          max="30"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-foreground
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-background
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-foreground
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-background
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-transform
            [&::-moz-range-thumb]:hover:scale-110"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Small (15%)</span>
          <span>Medium (22%)</span>
          <span>Large (30%)</span>
        </div>
      </div>

      <p className="text-xs font-serif text-muted-foreground">
        Adjust the size of your logo within the QR code. Larger logos are more visible but require higher error correction.
      </p>
    </div>
  );
}
