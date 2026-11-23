import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    applinks: {
      details: [{
        appIDs: ["L2T2KBN2GC.me.teag.scanner"],
        components: [
          { "/": "/r/*", "?": { open: "web" }, exclude: true },
          { "/": "/??????", "?": { open: "web" }, exclude: true },
          { "/": "/assets", exclude: true },
          { "/": "/r/*" },
          { "/": "/??????" },
        ],
      }],
    },
  }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
