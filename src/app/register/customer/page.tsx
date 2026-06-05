import { Badge, Card, PublicHeader } from "@/components/ui";
import { CustomerRegisterForm } from "@/components/auth-forms";

export default function CustomerRegisterPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container grid min-h-[calc(100vh-64px)] items-center py-12">
        <Card className="mx-auto w-full max-w-xl">
          <Badge>Customer account</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Create your Fixit247 account</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            Save properties, track emergency jobs, manage vehicles, and activate Fixit Plus when ready.
          </p>
          <CustomerRegisterForm />
        </Card>
      </section>
    </main>
  );
}
