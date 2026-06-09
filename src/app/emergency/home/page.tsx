import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emergency Home Help — Start Now",
  description:
    "Start an urgent home repair request now. Leaks, faults, lockouts, and storm damage handled fast.",
  alternates: {
    canonical: "/emergency/home"
  }
};

import { redirect } from "next/navigation";

export default function HomeEmergencyPage() {
  redirect("/post-job");
}
