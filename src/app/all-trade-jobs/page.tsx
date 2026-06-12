import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Trade Jobs — Plumbing, Electrical, Roofing & More",
  description:
    "Post any trade job free: plumbing, electrical, roofing, painting, carpentry, landscaping, concreting, and larger property projects.",
  alternates: {
    canonical: "/all-trade-jobs"
  }
};

import { Badge, Button, IconTile, MobileBottomActionBar, PublicFooter, PublicHeader } from "@/components/ui";
import { tradeCategories } from "@/lib/data";

export default function AllTradeJobsPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container py-14">
        <Badge>All trade jobs</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
          One place for repairs, maintenance, and property work.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          Small repair, planned maintenance, installation, painting, roofing, landscaping, or larger property work. Start
          with one clear brief and keep the next step simple.
        </p>
        <Button href="/post-job" className="mt-7">Start a Trade Request</Button>
      </section>
      <section className="container grid grid-cols-2 gap-3 pb-16 md:grid-cols-4 lg:grid-cols-5">
        {tradeCategories.map((item) => (
          <IconTile
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={`/post-job?lane=standard_trade_job&category=${encodeURIComponent(item.label)}`}
          />
        ))}
      </section>
      <PublicFooter />
      <MobileBottomActionBar />
    </main>
  );
}
