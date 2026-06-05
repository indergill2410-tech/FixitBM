import { Card, DashboardHeader } from "@/components/ui";
import { RefundLeadCreditsForm } from "@/components/admin-action-forms";

export default function AdminCreditsPage() {
  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Credits" role="Admin" />
        <Card variant="dark">
          <h2 className="text-xl font-black">Credit refund review</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Refund credits when the customer is unreachable, fake, or already booked before contact.
          </p>
          <div className="mt-5 max-w-xl">
            <RefundLeadCreditsForm />
          </div>
        </Card>
      </section>
    </main>
  );
}
