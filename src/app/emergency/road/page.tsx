import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emergency Roadside Help — Start Now",
  description:
    "Start an urgent roadside request now. Flat tyre, battery, fuel, lockout, or towing coordination.",
  alternates: {
    canonical: "/emergency/road"
  }
};

import { redirect } from "next/navigation";

export default function RoadEmergencyPage() {
  redirect("/post-job");
}
