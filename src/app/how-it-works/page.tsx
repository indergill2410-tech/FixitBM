import { Badge, Card, PublicHeader } from "@/components/ui";

export default function HowItWorksPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Badge>How it works</Badge>
        <h1 className="mt-5 text-[40px] font-black tracking-tight md:text-[56px]">Fast help, calm steps.</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Tell us what happened", "Choose home, road, or scheduled work and share only what matters."],
            ["We prepare the match", "Fixit247 structures the request for local providers and ops visibility."],
            ["Track through resolution", "Timeline, chat, quotes, reviews, and support all live around the job."]
          ].map(([title, copy], index) => (
            <Card key={title}>
              <span className="text-4xl font-black text-[var(--amber)]">{index + 1}</span>
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-[var(--text2)]">{copy}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
