import { cn } from "@/lib/utils";

interface TeagMarkProps {
  className?: string;
  tileClassName?: string;
}

export function TeagMark({ className, tileClassName }: TeagMarkProps) {
  return (
    <div
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm",
        tileClassName
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("h-6 w-6", className)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.5 8.25C6.5 7.14543 7.39543 6.25 8.5 6.25H13.6716C14.202 6.25 14.7107 6.46071 15.0858 6.83579L17.1642 8.91421C17.5393 9.28929 17.75 9.79801 17.75 10.3284V15.5C17.75 16.6046 16.8546 17.5 15.75 17.5H8.5C7.39543 17.5 6.5 16.6046 6.5 15.5V8.25Z"
          fill="currentColor"
          opacity="0.98"
        />
        <path
          d="M14.75 6.5V9.25H17.5"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="11.9" r="1.4" fill="hsl(var(--primary))" />
        <path
          d="M10.35 13.65L13.95 10.05"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-accent" />
    </div>
  );
}
