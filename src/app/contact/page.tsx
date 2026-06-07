import { Badge, Button, Card, PublicFooter, PublicHeader } from "@/components/ui";

export default function ContactPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Badge>Contact</Badge>
        <h1 className="mt-5 text-[40px] font-black tracking-tight md:text-[56px]">Choose the fastest path.</h1>
        <Card className="mt-8 max-w-2xl">
          <p className="leading-7 text-[var(--text2)]">
            For help, partnerships, or Fixer onboarding, choose the fastest path below.
          </p>
          <div className="mt-6 flex gap-3">
            <Button href="/post-job">Start a request</Button>
            <Button href="/propertysafe" variant="ghost">PropertySafe</Button>
            <Button href="/become-a-fixer" variant="ghost">Become a Fixer</Button>
          </div>
        </Card>
      </section>
      <PublicFooter />
    </main>
  );
}
