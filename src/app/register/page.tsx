import { redirect } from "next/navigation";
import { BriefcaseBusiness, Building2, Home } from "lucide-react";
import { Badge, Button, Card, PublicHeader } from "@/components/ui";
import { getCurrentAppUser, roleHome } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentAppUser();

  if (user) {
    redirect(roleHome(user.role));
  }

  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container grid min-h-[calc(100vh-64px)] items-center py-12">
        <div className="mx-auto w-full max-w-3xl">
          <Badge>Choose account type</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-tight">What brings you to Fixit247?</h1>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            <Card>
              <Home className="text-[var(--amber2)]" />
              <h2 className="mt-4 text-xl font-black">I need help</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Create a customer account for tracking requests, properties, vehicles, messages, and Fixit Plus.</p>
              <Button href="/register/customer" className="mt-5 w-full">Customer account</Button>
            </Card>
            <Card>
              <Building2 className="text-[var(--amber2)]" />
              <h2 className="mt-4 text-xl font-black">I manage properties</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Create a PropertySafe agency account for managed properties, sharing setup, and maintenance records.</p>
              <Button href="/agency/register" variant="ghost" className="mt-5 w-full">Agency account</Button>
            </Card>
            <Card>
              <BriefcaseBusiness className="text-[var(--purple)]" />
              <h2 className="mt-4 text-xl font-black">I am a Fixer</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Create a business profile, manage availability, and access local leads without commission.</p>
              <Button href="/register/fixer" variant="dark" className="mt-5 w-full">Fixer onboarding</Button>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
