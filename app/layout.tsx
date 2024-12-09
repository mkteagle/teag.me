// app/layout.tsx
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import { type Metadata } from "next/types";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "QR Code Analytics Dashboard",
    template: "%s | QR Code Analytics",
  },
  description:
    "Track and analyze QR code engagement with real-time statistics, user demographics, and scan history.",
  keywords: [
    "QR code analytics",
    "QR tracking",
    "scan metrics",
    "engagement analytics",
    "QR code management",
  ],
  authors: [{ name: "Michael Teagle" }],
  creator: "Mkteagle.com",
  viewport: "width=device-width, initial-scale=1",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "QR Code Analytics Dashboard",
    description:
      "Generate and track QR codes with comprehensive analytics and insights",
    images: [
      {
        url: "/og-image.png", // Add your actual OG image path
        width: 1200,
        height: 630,
        alt: "QR Code Analytics Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Code Analytics Dashboard",
    description:
      "Generate and track QR codes with comprehensive analytics and insights",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} min-h-screen bg-[#0a0b1e]`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
