import { Badge, Button, IconTile, MobileBottomActionBar, PublicFooter, PublicHeader } from "@/components/ui";
import { projectCategories } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container py-14">
        <Badge tone="purple">Project quotes</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
          Bigger property work starts with one clear brief.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          Use Fixit247 for renovations, upgrades, make-good works, investment property improvements, and multi-trade
          project quote requests.
        </p>
        <Button href="/post-job" className="mt-7">Request Project Quotes</Button>
      </section>
      <section className="container grid grid-cols-2 gap-3 pb-16 md:grid-cols-4">
        {projectCategories.map((item) => (
          <IconTile key={item.label} icon={item.icon} label={item.label} />
        ))}
      </section>
      <PublicFooter />
      <MobileBottomActionBar />
    </main>
  );
}
