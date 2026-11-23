import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function TeagMark({ className, tileClassName }: {
  className?: string;
  tileClassName?: string;
}) {
  return (
    <span className={cn("inline-flex h-9 w-8 shrink-0 items-center justify-center", tileClassName)} aria-hidden="true">
      <Image
        src="/assets/folded-t.png"
        alt=""
        width={122}
        height={192}
        unoptimized
        className={cn("h-full w-full object-contain", className)}
      />
    </span>
  );
}

export function TeagWordmark({ href }: { href: string }) {
  return (
    <Link href={href} className="flex w-fit items-center gap-2 py-2 text-[1.375rem] font-extrabold tracking-[-0.055em] sm:gap-3 sm:text-[2rem]">
      <TeagMark tileClassName="h-9 w-7 sm:h-12 sm:w-9" />
      teag.me
    </Link>
  );
}
