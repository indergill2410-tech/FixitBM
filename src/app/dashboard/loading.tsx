export default function DashboardLoading() {
  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8" aria-busy="true" aria-label="Loading your dashboard">
        <div className="h-7 w-28 animate-pulse rounded-full bg-[var(--bg2)]" />
        <div className="mt-4 h-9 w-2/3 max-w-sm animate-pulse rounded-xl bg-[var(--bg2)]" />
        <div className="mt-8 grid gap-5 lg:grid-cols-[.62fr_.38fr]">
          <div className="grid gap-5">
            <div className="h-48 animate-pulse rounded-2xl border border-[var(--border)] bg-white" />
            <div className="h-40 animate-pulse rounded-2xl border border-[var(--border)] bg-white" />
          </div>
          <div className="grid gap-5">
            <div className="h-32 animate-pulse rounded-2xl border border-[var(--border)] bg-white" />
            <div className="h-32 animate-pulse rounded-2xl border border-[var(--border)] bg-white" />
          </div>
        </div>
      </section>
    </main>
  );
}
