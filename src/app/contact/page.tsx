import { Badge, Button, Card, PublicHeader } from "@/components/ui";

export default function ContactPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Badge>Contact</Badge>
        <h1 className="mt-5 text-[40px] font-black tracking-tight md:text-[56px]">Talk to Fixit247.</h1>
        <Card className="mt-8 max-w-2xl">
          <p className="leading-7 text-[var(--text2)]">
            For launch enquiries, tradie onboarding, partnerships, or support, use the product flows while contact
            operations are being configured.
          </p>
          <div className="mt-6 flex gap-3">
            <Button href="/post-job">Post a job</Button>
            <Button href="/for-tradies" variant="ghost">For tradies</Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
