import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fixit247.com.au";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Fixit247 | 24/7 Emergency Repairs, Trade Jobs & Roadside Help in Australia",
    template: "%s | Fixit247"
  },
  description:
    "Post urgent home repairs, roadside help, and trade jobs free. Verified Fixers, Fixit Peace protection, and PropertySafe records for Australian homes and rentals.",
  openGraph: {
    siteName: "Fixit247",
    title: "Fixit247 | 24/7 Emergency Repairs & Trade Jobs",
    description: "Fast help when things break. Free to post. Verified Fixers across Australia.",
    url: appUrl,
    type: "website",
    locale: "en_AU"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf8f4"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
