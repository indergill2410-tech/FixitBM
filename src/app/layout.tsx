import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fixit247.com.au";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Fixit247 | Emergency help for your home and road",
  description:
    "Emergency help for your home and road, 24/7. Built for emergencies and ready for any trade job.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Fixit247",
    description: "Emergency help for your home and road, 24/7. Built for emergencies and ready for any trade job.",
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
