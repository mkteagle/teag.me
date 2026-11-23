import { TeagMark } from "@/components/brand/teag-mark";
import { cn } from "@/lib/utils";

export function ScannerLogo({ size = 30, className }: { size?: number; className?: string }) {
  return <span className={cn("inline-flex", className)} style={{ width: size, height: size }}><TeagMark tileClassName="h-full w-full" /></span>;
}

export function ScannerWordmark({ logoSize = 30, wordmarkClassName, showTag = true, className }: {
  logoSize?: number;
  wordmarkClassName?: string;
  showTag?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ScannerLogo size={logoSize} />
      <span className={cn("text-xl font-extrabold tracking-[-0.055em]", wordmarkClassName)}>teag.me</span>
      {showTag && <span className="text-xs font-semibold">QR Code</span>}
    </div>
  );
}

/** Apple "Download on the App Store" style dark pill. Link is a placeholder. */
export function AppStoreBadge({
  href = "#",
  className,
  analyticsAction,
}: {
  href?: string;
  className?: string;
  analyticsAction?: string;
}) {
  return (
    <a
      href={href}
      data-marketing-cta={analyticsAction}
      className={cn(
        "inline-flex items-center gap-3 rounded-[13px] bg-[#15181F] px-5 py-3 text-[#FFFDF8] shadow-[0_10px_26px_rgba(17,24,39,0.18)] transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      <svg
        viewBox="0 0 384 512"
        width="24"
        height="24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[10px] text-[#B7BDC8]">Download on the</span>
        <span className="block font-heading text-lg font-bold">App Store</span>
      </span>
    </a>
  );
}
