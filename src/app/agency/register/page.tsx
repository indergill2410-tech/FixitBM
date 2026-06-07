import { redirect } from "next/navigation";
import { Badge, Card, PublicHeader } from "@/components/ui";
import { AgencyRegisterForm } from "@/components/auth-forms";
import { getCurrentAppUser, roleHome } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AgencyRegisterPage() {
  const user = await getCurrentAppUser();

  if (user) {
    redirect(roleHome(user.role));
  }

  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container grid min-h-[calc(100vh-64px)] items-center py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[.9fr_1fr] lg:items-start">
          <div className="pt-4">
            <Badge>PropertySafe agency account</Badge>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Set up the agency account before the first property goes live.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--text2)]">
              Start with the agency record, then add managed properties, sharing setup, and maintenance defaults. Your
              team decides what gets shared and when.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Agency-led", "Sharing setup", "Property records"].map((item) => (
                <div key={item} className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-black shadow-[var(--shadow)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <Card>
            <Badge>New agency</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Set up PropertySafe</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
              This creates a dedicated agency account and the first PropertySafe setup record.
            </p>
            <AgencyRegisterForm />
          </Card>
        </div>
      </section>
    </main>
  );
}
