"use client";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href="https://www.mkteagle.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Michael Teagle
            </a>
            . © {currentYear} MKTEAGLE. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/privacy"
            className="text-sm font-medium underline-offset-4 hover:underline text-muted-foreground"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm font-medium underline-offset-4 hover:underline text-muted-foreground"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
