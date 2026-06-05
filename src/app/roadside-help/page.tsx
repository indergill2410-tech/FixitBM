import { Badge, Button, IconTile, MobileBottomActionBar, PublicHeader } from "@/components/ui";
import { roadsideCategories } from "@/lib/data";

export default function RoadsideHelpPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container py-14">
        <Badge tone="blue">Roadside help</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
          Road moments are stressful. Fixit247 gives you a plan.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          Start a request for flat tyres, batteries, lockouts, fuel emergencies, towing coordination, and mechanic support.
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
      <MobileBottomActionBar />
    </main>
  );
}
