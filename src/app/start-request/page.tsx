import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a Request",
  description:
    "Start a free home emergency, roadside, trade, or project request with Fixit247.",
  alternates: {
    canonical: "/start-request"
  }
};

import { redirect } from "next/navigation";

export default function StartRequestPage() {
  redirect("/post-job");
}
