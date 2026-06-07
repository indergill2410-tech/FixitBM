import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fixit247.com.au";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Fixit247 | Emergency help and PropertySafe records",
  description:
    "Start home, roadside, trade, and property maintenance requests with Fixit247. Add Fixit Plus protection and PropertySafe records for owned or managed properties.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Fixit247",
    description: "Fast help when things break, plus clearer records for homes, roads, rentals, and managed properties.",
    url: appUrl,
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
