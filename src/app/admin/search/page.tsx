import Link from "next/link";
import { ClipboardList, Search, Users, Wrench } from "lucide-react";
import { Badge, Card, DashboardHeader } from "@/components/ui";
import { searchAdminConsole, type AdminSearchResult } from "@/lib/jobs";

export const dynamic = "force-dynamic";

const sectionMeta = {
  request: { label: "Requests", icon: ClipboardList, tone: "amber" as const },
  fixer: { label: "Fixers", icon: Wrench, tone: "blue" as const },
  customer: { label: "Customers", icon: Users, tone: "green" as const }
};

export default async function AdminSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = await searchAdminConsole(query);

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Search" role="Admin" />

        <Card>
          <form action="/admin/search" method="get">
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg2)] px-4 py-3 focus-within:border-amber-300/40">
              <Search size={18} className="shrink-0 text-[var(--text3)]" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                autoFocus
                placeholder="Search by request reference, address, Fixer, ABN, customer name or email…"
                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none"
              />
              <button type="submit" className="shrink-0 rounded-xl bg-[var(--amber)] px-4 py-1.5 text-sm font-black text-[var(--text)]">
                Search
              </button>
            </div>
          </form>
          {query.length >= 2 ? (
            <p className="mt-3 text-sm text-[var(--text3)]">
              {results.total} {results.total === 1 ? "match" : "matches"} for “{query}”.
            </p>
          ) : (
            <p className="mt-3 text-sm text-[var(--text3)]">Enter at least two characters to search across the console.</p>
          )}
        </Card>

        {query.length >= 2 && results.total === 0 ? (
          <Card className="mt-4">
            <p className="text-[var(--text2)]">No requests, Fixers, or customers match “{query}”.</p>
          </Card>
        ) : null}

        <div className="mt-4 grid gap-4">
          <ResultGroup kind="request" items={results.requests} />
          <ResultGroup kind="fixer" items={results.fixers} />
          <ResultGroup kind="customer" items={results.customers} />
        </div>
      </section>
    </main>
  );
}

function ResultGroup({ kind, items }: { kind: keyof typeof sectionMeta; items: AdminSearchResult[] }) {
  if (!items.length) return null;
  const meta = sectionMeta[kind];
  const Icon = meta.icon;

  return (
    <Card>
      <div className="flex items-center gap-3">
        <Icon className="text-[var(--amber)]" size={18} />
        <Badge tone={meta.tone}>{meta.label}</Badge>
        <span className="text-sm text-[var(--text3)]">{items.length}</span>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={item.href}
            className="block rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 transition hover:border-amber-300/40 hover:bg-[var(--bg2)]"
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="truncate font-black">{item.title}</p>
                <p className="mt-0.5 truncate text-sm text-[var(--text2)]">{item.subtitle}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-[var(--text3)]">{item.meta}</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
