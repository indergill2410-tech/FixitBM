import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fixit247 | Emergency help for your home and road",
  description:
    "Post a job free, get matched with verified local tradies, or protect your household with Fixit Plus peace-of-mind memberships.",
  openGraph: {
    title: "Fixit247",
    description: "Emergency help for your home and road, 24/7.",
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
