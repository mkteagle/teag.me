import { redact } from "@tanstack/redact/vinext";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import vinext from "vinext";

export default defineConfig(({ mode }) => ({
  plugins: [
    vinext(),
    redact(),
    mode === "vercel" && nitro({
      preset: "vercel",
      // Vinext relies on native Response semantics for redirects and API statuses.
      features: { fastResponse: false },
      noExternals: [/^@aws-sdk\//, /^@smithy\//],
    }),
  ],
}));
