import { ScannerLogo } from "@/components/scanner/scanner-brand";

/**
 * Hero phone — large device frame showing the URL result sheet on a dark body.
 * Pure CSS/markup mockup; no images.
 */
export function HeroPhone() {
  return (
    <div
      className="relative h-[620px] w-[300px] rounded-[48px] border border-[#2A2A2C] bg-[#0A0A0A] p-[11px] shadow-[0_40px_90px_rgba(17,24,39,0.28)]"
      role="img"
      aria-label="QR Code by teag.me showing a decoded link for marriott.com"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-[linear-gradient(155deg,#1A1C20,#0E1013)]">
        <div className="absolute inset-0 bg-[rgba(10,10,10,0.5)]" />
        {/* status bar */}
        <div className="relative z-[3] flex items-center justify-between px-6 pt-4 font-mono text-xs text-[#FFFDF8]">
          <span>9:41</span>
          <span className="tracking-wider">▮▮▮ ◓ ▭</span>
        </div>
        {/* result sheet */}
        <div className="absolute inset-x-[10px] bottom-[10px] rounded-[30px] border border-[#262626] bg-[#141414] px-[22px] py-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#3A3A3C]" />
          <div className="mb-3 inline-flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.12em] text-primary">
            <span className="h-[5px] w-[5px] rounded-full bg-primary" />
            QR DETECTED · WEB LINK
          </div>
          <div className="font-heading text-[32px] font-bold leading-none tracking-[-0.025em] text-[#FFFDF8]">
            marriott.com
          </div>
          <div className="mt-[11px] break-all font-mono text-xs leading-[1.45] text-primary">
            https://marriott.com/offers/spring-stay
          </div>
          <div className="mt-[22px] flex flex-col gap-2.5">
            <button className="rounded-[14px] bg-primary px-4 py-[15px] text-[15px] font-semibold text-white">
              Open link
            </button>
            <button className="rounded-[14px] border border-[#2E2E31] bg-[#1F1F22] px-4 py-[15px] text-[15px] font-semibold text-[#FFFDF8]">
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryFrame({
  children,
  label,
  bodyClassName = "bg-[linear-gradient(155deg,#1A1C20,#0E1013)]",
}: {
  children: React.ReactNode;
  label: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className="relative h-[506px] w-[240px] rounded-[40px] border border-[#2A2A2C] bg-[#0A0A0A] p-[9px] shadow-[0_24px_56px_rgba(17,24,39,0.2)]"
      role="img"
      aria-label={label}
    >
      <div className={`relative h-full w-full overflow-hidden rounded-[32px] ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}

/** Gallery 1 — scanner viewfinder with corner reticle. */
export function GalleryScanner() {
  return (
    <GalleryFrame
      label="Scanner viewfinder with targeting reticle"
      bodyClassName="bg-[linear-gradient(155deg,#23262B,#0E1013)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(60,66,78,0.5),transparent_60%)]" />
      <div className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute left-0 top-0 h-[30px] w-[30px] rounded-tl-[9px] border-l-[3px] border-t-[3px] border-primary" />
        <div className="absolute right-0 top-0 h-[30px] w-[30px] rounded-tr-[9px] border-r-[3px] border-t-[3px] border-primary" />
        <div className="absolute bottom-0 left-0 h-[30px] w-[30px] rounded-bl-[9px] border-b-[3px] border-l-[3px] border-primary" />
        <div className="absolute bottom-0 right-0 h-[30px] w-[30px] rounded-br-[9px] border-b-[3px] border-r-[3px] border-primary" />
        <div className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-primary/70 shadow-[0_0_12px_2px_rgba(15,123,255,0.6)] animate-teag-scanline" />
      </div>
      <div className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 items-center gap-[7px] whitespace-nowrap rounded-full border border-white/10 bg-[rgba(10,10,10,0.66)] px-3.5 py-2 text-[11px] font-medium text-[#FFFDF8]">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-teag-pulse" />
        Point at a QR code
      </div>
    </GalleryFrame>
  );
}

/** Gallery 2 — compact URL result sheet. */
export function GalleryResult() {
  return (
    <GalleryFrame label="Decoded web link result sheet">
      <div className="absolute inset-0 bg-[rgba(10,10,10,0.62)]" />
      <div className="absolute inset-x-2 bottom-2 rounded-[26px] border border-[#262626] bg-[#141414] px-4 py-[18px]">
        <div className="mx-auto mb-3.5 h-1 w-[34px] rounded-full bg-[#3A3A3C]" />
        <div className="mb-2 font-mono text-[8.5px] tracking-[0.1em] text-primary">
          ● QR DETECTED · WEB LINK
        </div>
        <div className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#FFFDF8]">
          marriott.com
        </div>
        <div className="mt-2 break-all font-mono text-[10px] text-primary">
          marriott.com/offers/spring
        </div>
        <div className="mt-4 flex flex-col gap-[7px]">
          <button className="rounded-[11px] bg-primary py-[11px] text-[12.5px] font-semibold text-white">
            Open link
          </button>
          <button className="rounded-[11px] border border-[#2E2E31] bg-[#1F1F22] py-[11px] text-[12.5px] font-semibold text-[#FFFDF8]">
            Copy
          </button>
        </div>
      </div>
    </GalleryFrame>
  );
}

/** Gallery 3 — Wi-Fi network result. */
export function GalleryWifi() {
  return (
    <GalleryFrame label="Wi-Fi network result sheet">
      <div className="absolute inset-0 bg-[rgba(10,10,10,0.62)]" />
      <div className="absolute inset-x-2 bottom-2 rounded-[26px] border border-[#262626] bg-[#141414] px-4 py-[18px]">
        <div className="mx-auto mb-3.5 h-1 w-[34px] rounded-full bg-[#3A3A3C]" />
        <div className="mb-[11px] font-mono text-[8.5px] tracking-[0.1em] text-accent">
          ● WI-FI NETWORK
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border border-accent/30 bg-accent/[0.14] text-lg">
            📶
          </div>
          <div className="text-left">
            <div className="font-heading text-base font-bold text-[#FFFDF8]">
              Cafe_Guest
            </div>
            <div className="font-mono text-[9px] text-[#8A909C]">WPA2</div>
          </div>
        </div>
        <button className="mt-4 w-full rounded-[11px] bg-primary py-[11px] text-[12.5px] font-semibold text-white">
          Join network
        </button>
      </div>
    </GalleryFrame>
  );
}

/** Gallery 4 — camera permission screen. */
export function GalleryPermission() {
  return (
    <GalleryFrame
      label="Camera permission request screen"
      bodyClassName="bg-[#0A0A0A]"
    >
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-[18px]">
          <ScannerLogo size={56} tagFill="#0A0A0A" dotStroke="#0A0A0A" />
        </div>
        <div className="mb-3 font-heading text-lg font-bold text-[#FFFDF8]">
          teag.me{" "}
          <span className="font-mono text-[8px] tracking-[0.18em] text-primary">
            QR CODE
          </span>
        </div>
        <p className="mb-[22px] text-[12.5px] leading-[1.5] text-[#9AA1AE]">
          Point your camera at any QR code. Nothing leaves your phone.
        </p>
        <button className="w-full rounded-xl bg-primary py-[13px] text-[13px] font-semibold text-white">
          Enable camera
        </button>
      </div>
    </GalleryFrame>
  );
}
