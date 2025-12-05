import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import { Metadata, Viewport } from "next/types";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https:/teag.me";

export const metadata: Metadata = {
  title: "Teag.me - QR Code Generation and Tracking",
  description:
    "Teag.me helps you create, manage, and track QR codes effortlessly. Monitor scan data, analyze trends, and optimize your QR campaigns with ease.",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Teag.me - QR Code Generation and Tracking",
    description:
      "Easily generate, customize, and track QR codes with Teag.me. Gain insights into scan data and maximize the effectiveness of your campaigns.",
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
    title: "Teag.me - QR Code Generation and Tracking",
    description:
      "Create and track QR codes with Teag.me. Monitor scan performance, analyze trends, and take your QR campaigns to the next level.",
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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b1e" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex min-h-screen">{children}</div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
