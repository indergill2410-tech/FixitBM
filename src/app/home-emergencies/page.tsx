import { Badge, Button, Card, IconTile, MobileBottomActionBar, PublicFooter, PublicHeader } from "@/components/ui";
import { homeCategories } from "@/lib/data";

export default function HomeEmergenciesPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container py-14">
        <Badge tone="red">Home emergencies</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
          When home panic starts, start with one clear request.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          Tell us what happened, where it is, and how urgent it feels. Fixit247 prepares the request so suitable Fixers
          get better context from the first message.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button href="/post-job">Get Help Now</Button>
          <Button href="/fixit-plus" variant="ghost">Join Fixit Plus</Button>
        </div>
      </section>
      <section className="container grid grid-cols-2 gap-3 pb-16 md:grid-cols-4 lg:grid-cols-5">
        {homeCategories.map((item) => (
          <IconTile key={item.label} icon={item.icon} label={item.label} />
        ))}
      </section>
      <PublicFooter />
      <MobileBottomActionBar />
    </main>
  );
}
