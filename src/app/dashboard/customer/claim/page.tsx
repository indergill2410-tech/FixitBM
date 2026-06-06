import { Badge, Card, DashboardHeader } from "@/components/ui";
import { ClaimGuestJobForm } from "@/components/claim-guest-job-form";

export default function ClaimGuestJobPage() {
  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Claim a guest request" role="Customer" />
        <Card className="max-w-xl">
          <Badge>Post first, account later</Badge>
          <h1 className="mt-4 text-2xl font-black">Link an emergency request to your account.</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Enter the reference shown after submission and the phone number used on the guest request.
          </p>
          <ClaimGuestJobForm />
        </Card>
      </section>
    </main>
  );
}
