import { Badge, Card, PublicHeader } from "@/components/ui";

export default function AboutPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Badge>About Fixit247</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[56px]">
          Building the emergency operating system for Australian households.
        </h1>
        <Card className="mt-8 max-w-3xl">
          <p className="leading-8 text-[var(--text2)]">
            Fixit247 is designed for the moments when panic usually starts: leaks, lockouts, flat tyres, dead batteries,
            late-night repairs, and urgent household problems. The platform is launching suburb by suburb with a focus on
            calm customer experience, clear tradie economics, and responsible operations.
          </p>
        </Card>
      </section>
    </main>
  );
}
