import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadside Help — Flat Tyre, Battery, Fuel & Towing",
  description:
    "Stuck on the road? Post a free roadside request for flat tyres, dead batteries, fuel, lockouts, or towing coordination anywhere in Australia.",
  alternates: {
    canonical: "/roadside-help"
  }
};

import { Badge, Button, IconTile, MobileBottomActionBar, PublicFooter, PublicHeader } from "@/components/ui";
import { roadsideCategories } from "@/lib/data";

export default function RoadsideHelpPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container py-14">
        <Badge tone="blue">Roadside help</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
          Stuck on the road? Start the request calmly.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          Flat tyre, battery, lockout, fuel issue, towing, or mechanic help. Share your location and situation once so the
          next step is clearer.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button href="/post-job">Get Roadside Help</Button>
          <Button href="/fixit-plus" variant="ghost">See Complete cover</Button>
        </div>
      </section>
      <section className="container grid grid-cols-2 gap-3 pb-16 md:grid-cols-4">
        {roadsideCategories.map((item) => (
          <IconTile key={item.label} icon={item.icon} label={item.label} />
        ))}
      </section>
      <PublicFooter />
      <MobileBottomActionBar />
    </main>
  );
}
