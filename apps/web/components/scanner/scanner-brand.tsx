import { cn } from "@/lib/utils";

/**
 * The teag.me tag mark, drawn on the 32x32 brand viewBox.
 * `tagFill` lets dark surfaces punch the tag silhouette to the body color.
 */
export function ScannerLogo({
  size = 30,
  tagFill = "#FFFDF8",
  dotStroke = "#F6F4EF",
  className,
}: {
  size?: number;
  tagFill?: string;
  dotStroke?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#0F7BFF" />
      <path
        d="M9 11.3C9 10.0297 10.0297 9 11.3 9H16.89C17.5008 9 18.0865 9.24267 18.518 9.67416L22.3258 13.482C22.7573 13.9135 23 14.4992 23 15.11V20.7C23 21.9703 21.9703 23 20.7 23H11.3C10.0297 23 9 21.9703 9 20.7V11.3Z"
        fill={tagFill}
      />
      <path
        d="M18 9.5V14H22.5"
        stroke="#0F7BFF"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15.75" cy="15.75" r="2" fill="#0F7BFF" />
      <path
        d="M13.5 18L18.3 13.2"
        stroke="#0F7BFF"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle
        cx="24.5"
        cy="24.5"
        r="3.25"
        fill="#FF8A3D"
        stroke={dotStroke}
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** Wordmark lockup: mark + "teag.me" + the blue SCANNER tag. */
export function ScannerWordmark({
  logoSize = 30,
  wordmarkClassName,
  tagFill = "#FFFDF8",
  dotStroke = "#F6F4EF",
  showTag = true,
  className,
}: {
  logoSize?: number;
  wordmarkClassName?: string;
  tagFill?: string;
  dotStroke?: string;
  showTag?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ScannerLogo size={logoSize} tagFill={tagFill} dotStroke={dotStroke} />
      <span
        className={cn(
          "font-heading text-lg font-bold tracking-[-0.025em]",
          wordmarkClassName
        )}
      >
        teag.me
      </span>
      {showTag && (
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
          Scanner
        </span>
      )}
    </div>
  );
}

/** Apple "Download on the App Store" style dark pill. Link is a placeholder. */
export function AppStoreBadge({
  href = "#",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
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
