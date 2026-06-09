import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern use of Fixit247 for customers, Fixers, and agencies.",
  alternates: {
    canonical: "/terms"
  }
};

import { PublicFooter, PublicHeader } from "@/components/ui";

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
              Fixit247 helps customers submit home, roadside, and scheduled service requests and helps matched Fixers
              receive, claim, and manage those requests. Unless a written Fixit247 plan says otherwise, the Fixer is
              responsible for quoting, completing, warranting, and charging for the work they perform.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[var(--text)]">Customer requests</h2>
            <p className="mt-2">
              Customers can start requests without paying Fixit247. Request descriptions, photos, contact details, location notes,
              urgency, and access instructions must be accurate enough for a Fixer to assess the request. Emergency
              situations should always be handled with appropriate emergency services first.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[var(--text)]">Fixer access</h2>
            <p className="mt-2">
              Fixers keep 100% of the work value agreed with the customer. Fixit247 may charge for subscriptions, lead
              credits, verification, profile placement, priority access, and business tools. Launch bonus credits can be used
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
      <PublicFooter />
    </main>
  );
}
