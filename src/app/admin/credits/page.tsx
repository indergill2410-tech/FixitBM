import { Card, DashboardHeader } from "@/components/ui";
import { RefundLeadCreditsForm } from "@/components/admin-action-forms";

export default function AdminCreditsPage() {
  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Credits" role="Admin" />
        <Card>
          <h2 className="text-xl font-black">Credit refund review</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Refund credits when a request cannot be contacted, is not genuine, or was already resolved before first
            contact.
          </p>
          <div className="mt-5 max-w-xl">
            <RefundLeadCreditsForm />
          </div>
        </Card>
      </section>
    </main>
  );
}
