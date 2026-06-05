import { Badge, Button, Card, PublicHeader } from "@/components/ui";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container grid min-h-[calc(100vh-64px)] items-center py-12">
        <Card className="mx-auto w-full max-w-md">
          <Badge>Account access</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Sign in to Fixit247</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            Sign in with Supabase Auth. Guest emergency posting still stays open before account creation.
          </p>
          <LoginForm />
          <div className="mt-5 grid gap-2">
            <Button href="/register/customer" variant="ghost">
              Create customer account
            </Button>
            <Button href="/register/tradie" variant="ghost">
              Join as a tradie
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
