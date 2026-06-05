import { PublicHeader } from "@/components/ui";

export default function TermsPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <article className="container max-w-3xl py-14">
        <h1 className="text-4xl font-black tracking-tight">Terms</h1>
        <div className="mt-6 grid gap-6 leading-8 text-[var(--text2)]">
          <section>
            <h2 className="text-xl font-black text-[var(--text)]">Marketplace role</h2>
            <p className="mt-2">
              Fixit247 helps customers submit home, roadside, and scheduled service requests and helps matched tradies
              receive, claim, and manage those requests. Unless a written Fixit247 plan says otherwise, the tradie is
              responsible for quoting, completing, warranting, and charging for the work they perform.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[var(--text)]">Customer requests</h2>
            <p className="mt-2">
              Customers can post jobs without paying Fixit247. Job descriptions, photos, contact details, location notes,
              urgency, and access instructions must be accurate enough for a tradie to assess the request. Emergency
              situations should always be handled with appropriate emergency services first.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[var(--text)]">Tradie access</h2>
            <p className="mt-2">
              Tradies keep 100% of the job value agreed with the customer. Fixit247 may charge for subscriptions, lead
              credits, verification, visibility, priority placement, and business tools. Launch bonus credits can be used
              to claim eligible leads and may expire or be limited by anti-abuse rules.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[var(--text)]">Disputes and refunds</h2>
            <p className="mt-2">
              Fixit247 can review bad lead reports, suspected misuse, verification concerns, support tickets, and
              disputes. Admins may refund lead credits where a claimed lead is invalid, duplicated, unreachable, or
              otherwise fails marketplace quality checks.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
