import React from "react";
import { ArrowUpRight } from "lucide-react";

export type BrowserGuideOverlayProps = {
  onClose: () => void;
  browserType: "linkedin" | "facebook" | string;
};

const BrowserGuideOverlay = ({
  browserType,
  onClose,
}: BrowserGuideOverlayProps) => {
  const getInstructions = () => {
    switch (browserType) {
      case "linkedin":
        return "Tap 'Open in browser' from the menu";
      case "facebook":
        return "Select 'Open in External Browser'";
      default:
        return "Open in your default browser";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="absolute top-0 right-8 mt-2">
        <div className="relative">
          <ArrowUpRight
            className="w-12 h-12 text-white animate-bounce"
            style={{
              transform: "rotate(-45deg)",
              filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))",
            }}
          />
          <div className="absolute -right-4 top-16 bg-white text-black rounded-lg p-4 shadow-xl max-w-[200px]">
            <p className="text-sm font-medium">{getInstructions()}</p>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        onClick={onClose}
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-white text-sm cursor-pointer hover:bg-white/20 transition-colors">
          Got it
        </div>
      </div>
    </div>
  );
};

export default BrowserGuideOverlay;
