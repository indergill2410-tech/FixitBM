import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fixit247.com.au";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Fixit247 | 24/7 Emergency Repairs, Trade Jobs & Roadside Help in Australia",
    template: "%s | Fixit247"
  },
  description:
    "Post urgent home repairs, roadside help, and trade jobs free. Verified Fixers, Fixit Plus protection, and PropertySafe records for Australian homes and rentals.",
  openGraph: {
    siteName: "Fixit247",
    title: "Fixit247 | 24/7 Emergency Repairs & Trade Jobs",
    description: "Fast help when things break. Free to post. Verified Fixers across Australia.",
    url: appUrl,
    type: "website",
    locale: "en_AU"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
