import { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket (QR codes + logos), e.g.
      // https://pub-xxxx.r2.dev/qr-codes/<id>.png
      { protocol: "https", hostname: "**.r2.dev" },
    ],
  },
};

export default nextConfig;
