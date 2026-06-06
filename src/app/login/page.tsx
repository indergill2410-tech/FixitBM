import { redirect } from "next/navigation";
import { Badge, Button, Card, PublicHeader } from "@/components/ui";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentAppUser, roleHome } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentAppUser();

  if (user) {
    redirect(roleHome(user.role));
  }

  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container grid min-h-[calc(100vh-64px)] items-center py-12">
        <Card className="mx-auto w-full max-w-md">
          <Badge>Account access</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Sign in to Fixit247</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            Sign in securely to track requests, messages, photos, Fixit Plus, and saved home or road details.
          </p>
          <LoginForm />
          <div className="mt-5 grid gap-2">
            <Button href="/register/customer" variant="ghost">
              Create customer account
            </Button>
            <Button href="/register/fixer" variant="ghost">
              Join as a Fixer
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
