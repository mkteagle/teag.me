import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import { Metadata } from "next/types";

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
    icon: "/favicons/favicon-32x32.png",
    shortcut: "/favicons/favicon.ico",
    apple: "/favicons/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b1e" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Teag.me",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0b1e]`}>
        <ThemeProvider>
          <div className="flex min-h-screen">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
