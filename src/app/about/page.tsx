import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Fixit247 — Emergency-First Help for Australian Properties",
  description:
    "Why we built Fixit247: faster urgent repairs, fairer leads for tradies, and clearer property records for homes and rentals.",
  alternates: {
    canonical: "/about"
  }
};

import { Badge, Card, PublicFooter, PublicHeader } from "@/components/ui";

export default function AboutPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Badge>About Fixit247</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[56px]">
          A calmer way to handle urgent property and roadside moments.
        </h1>
        <Card className="mt-8 max-w-3xl">
          <p className="leading-8 text-[var(--text2)]">
            Fixit247 is designed for the moments when panic usually starts: leaks, lockouts, flat tyres, dead batteries,
            late-night repairs, urgent household problems, and managed property maintenance. It brings request details,
            Fixers, tracking, support, and readiness records into one calm place for Australian households and property teams.
          </p>
        </Card>
      </section>
      <PublicFooter />
    </main>
  );
}
