import { Card, DashboardHeader } from "@/components/ui";

export default function AdminTradiesPage() {
  return <AdminPlaceholder title="Tradies" />;
}

function AdminPlaceholder({ title }: { title: string }) {
  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title={title} role="Admin" />
        <Card variant="dark">Admin {title.toLowerCase()} management.</Card>
      </section>
    </main>
  );
}
