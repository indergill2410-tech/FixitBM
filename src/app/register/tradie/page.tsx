import { redirect } from "next/navigation";
import { Badge, Card, PublicHeader } from "@/components/ui";
import { TradieRegisterForm } from "@/components/auth-forms";
import { getCurrentAppUser, roleHome } from "@/lib/auth";
import { showFixerRecruitmentUi } from "@/lib/featureFlags";

export const dynamic = "force-dynamic";

export default async function TradieRegisterPage() {
  const user = await getCurrentAppUser();

  if (user) {
    redirect(roleHome(user.role));
  }

  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-12">
        <Card className="mx-auto w-full max-w-2xl">
          <Badge tone="purple">Fixer onboarding</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Create your Fixer account</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            {showFixerRecruitmentUi
              ? "Create your account, then complete your Fixer profile in the dashboard so our team can review your trade, service area, availability, documents, and work interests."
              : "Build your profile, set your emergency availability, and get 111 bonus lead credits every month for your first 6 months. No commission and no paid subscription required to try leads."}
          </p>
          <TradieRegisterForm />
        </Card>
      </section>
    </main>
  );
}
