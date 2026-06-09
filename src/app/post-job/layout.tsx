import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Help Now — Post a Free Repair or Emergency Request",
  description:
    "Tell us what happened once. Home emergencies, roadside help, trade jobs, and project quotes — free to post, no account needed to start.",
  alternates: {
    canonical: "/post-job"
  }
};

export default function PostJobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
