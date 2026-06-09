import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fixit247 for Tradies — Local Leads, No Commission",
  description:
    "Grow your trade business with local emergency and project leads. Transparent credits, no commission on completed work.",
  alternates: {
    canonical: "/for-tradies"
  }
};

import { redirect } from "next/navigation";

export default function ForTradiesPage() {
  redirect("/become-a-fixer");
}
