import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import { Metadata, Viewport } from "next/types";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://teag.me";

export const metadata: Metadata = {
  title: "teag.me | Free QR Tracking Without the Paywall",
  description:
    "Create QR codes, shorten links, and track scans with a generous free tier. Upgrade only when you need more volume, branding, and deeper analytics.",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "teag.me | Free QR Tracking Without the Paywall",
    description:
      "Create QR codes, shorten links, and see scan analytics without getting forced into a paid plan just to unlock the basics.",
    url: baseUrl,
    siteName: "Teag.me",
    images: [
      {
        url: "/og-image.png", // Replace with your actual image path
        width: 1200,
        height: 630,
        alt: "Teag.me - QR Code Generation and Tracking",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "teag.me | Free QR Tracking Without the Paywall",
    description:
      "Generate QR codes, shorten links, and track scans with a generous free tier.",
    images: ["/og-image.png"], // Replace with your actual image path
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Teag.me",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#16181d" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen">{children}</div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
