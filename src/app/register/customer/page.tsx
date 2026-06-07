import { redirect } from "next/navigation";
import { Badge, Card, PublicHeader } from "@/components/ui";
import { CustomerRegisterForm } from "@/components/auth-forms";
import { getCurrentAppUser, roleHome } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CustomerRegisterPage({
  searchParams
}: {
  searchParams?: Promise<{ intent?: string }>;
}) {
  const user = await getCurrentAppUser();
  const params = await searchParams;
  const isAgency = params?.intent === "agency";

  if (isAgency) {
    redirect("/agency/register");
  }

  if (user) {
    redirect(roleHome(user.role));
  }

  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container grid min-h-[calc(100vh-64px)] items-center py-12">
        <Card className="mx-auto w-full max-w-xl">
          <Badge>{isAgency ? "Agency account" : "Customer account"}</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight">
            {isAgency ? "Create your PropertySafe agency account" : "Create your Fixit247 account"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            {isAgency
              ? "Use this account to prepare PropertySafe access, owner visibility, support requests, and managed property records."
              : "Save properties, track emergency jobs, manage vehicles, and activate Fixit Plus when ready."}
          </p>
          <CustomerRegisterForm intent={isAgency ? "agency" : undefined} />
        </Card>
      </section>
    </main>
  );
}
