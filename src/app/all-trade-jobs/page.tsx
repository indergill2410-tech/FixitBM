import { Badge, Button, IconTile, MobileBottomActionBar, PublicHeader } from "@/components/ui";
import { tradeCategories } from "@/lib/data";

export default function AllTradeJobsPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container py-14">
        <Badge>All trade jobs</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
          Not an emergency? Fixit247 can still help.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          From small repairs and maintenance to installations, painting, roofing, landscaping, and larger property
          projects, you can start any trade request in one place.
        </p>
        <Button href="/post-job" className="mt-7">Start a Trade Request</Button>
      </section>
      <section className="container grid grid-cols-2 gap-3 pb-16 md:grid-cols-4 lg:grid-cols-5">
        {tradeCategories.map((item) => (
          <IconTile key={item.label} icon={item.icon} label={item.label} />
        ))}
      </section>
      <MobileBottomActionBar />
    </main>
  );
}
