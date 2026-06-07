import { redirect } from "next/navigation";
import { Badge, Button, Card, PublicHeader } from "@/components/ui";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentAppUser, roleHome } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AgencyLoginPage() {
  const user = await getCurrentAppUser();

  if (user) {
    redirect(roleHome(user.role));
  }

  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container grid min-h-[calc(100vh-64px)] items-center py-12">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[.9fr_1fr] lg:items-center">
          <div>
            <Badge>PropertySafe agency access</Badge>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Sign in to manage properties, owner visibility, and repair records.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--text2)]">
              Agency accounts keep maintenance requests, Safety Check history, owner access, and follow-up work organised
              around the property record your team controls.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="/agency/register">Create agency account</Button>
              <Button href="/propertysafe/onboarding" variant="ghost">Book walkthrough</Button>
            </div>
          </div>
          <Card>
            <Badge>Agency sign in</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Open PropertySafe</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
              Use your agency account email. Customer and Fixer accounts stay separate so portfolio access stays clear.
            </p>
            <LoginForm redirectTo="/dashboard/agency" secondaryAction="agency" />
          </Card>
        </div>
      </section>
    </main>
  );
}
