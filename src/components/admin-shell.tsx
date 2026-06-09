import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Gauge,
  Headphones,
  Home,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wrench
} from "lucide-react";
import { Badge } from "@/components/ui";

type AdminNavItem = { label: string; href: string; icon: LucideIcon; detail: string };
type AdminNavGroup = { group: string; items: AdminNavItem[] };

// Grouped by job-to-be-done so the console reads as an operations cockpit rather
// than a flat list. Search sits at the top; Disputes now lives under Revenue
// (previously orphaned with no nav entry).
const adminNav: AdminNavGroup[] = [
  {
    group: "Dispatch",
    items: [
      { label: "Operations", href: "/admin", icon: Gauge, detail: "Live queue" },
      { label: "Requests", href: "/admin/jobs", icon: ClipboardList, detail: "Dispatch queue" },
      { label: "Safety Checks", href: "/admin/safety-checks", icon: ShieldCheck, detail: "Member readiness" }
    ]
  },
  {
    group: "Network",
    items: [
      { label: "Fixers", href: "/admin/tradies", icon: Wrench, detail: "Supply network" },
      { label: "Verification", href: "/admin/tradies/verification", icon: CheckCircle2, detail: "Document review" },
      { label: "Customers", href: "/admin/customers", icon: Users, detail: "Profiles" }
    ]
  },
  {
    group: "PropertySafe",
    items: [
      { label: "Records", href: "/admin/propertysafe", icon: Building2, detail: "Shared access" }
    ]
  },
  {
    group: "Revenue",
    items: [
      { label: "Revenue", href: "/admin/revenue", icon: BarChart3, detail: "MRR & billing" },
      { label: "Memberships", href: "/admin/memberships", icon: Home, detail: "Fixit Plus" },
      { label: "Credits", href: "/admin/credits", icon: CreditCard, detail: "Refunds" },
      { label: "Disputes", href: "/admin/disputes", icon: Scale, detail: "Lead quality" }
    ]
  },
  {
    group: "System",
    items: [
      { label: "Support", href: "/admin/support", icon: Headphones, detail: "Tickets" },
      { label: "Settings", href: "/admin/settings", icon: Settings, detail: "Readiness" }
    ]
  }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#100d0a] text-white">
      <div className="grid min-h-dvh bg-[#100d0a] lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-[#15100c] p-4 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <Link href="/admin" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--amber)] text-white shadow-[0_10px_30px_rgba(245,158,11,.3)]">
              <Wrench size={22} />
            </span>
            <div>
              <p className="text-lg font-black">Fixit247 Operations</p>
              <p className="text-xs font-semibold text-white/55">Admin operations centre</p>
            </div>
          </Link>

          <form action="/admin/search" method="get" className="mt-5">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-amber-300/40">
              <Search size={16} className="shrink-0 text-white/45" />
              <input
                type="search"
                name="q"
                placeholder="Search requests, Fixers, customers…"
                aria-label="Search the operations console"
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
          </form>

          <nav className="mt-5 grid gap-5">
            {adminNav.map((section) => (
              <div key={section.group} className="grid gap-1.5">
                <p className="px-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">{section.group}</p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm transition hover:border-white/10 hover:bg-white/7"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/7 text-[var(--amber)] group-hover:bg-[var(--amber)] group-hover:text-white">
                        <Icon size={17} />
                      </span>
                      <span>
                        <span className="block font-black">{item.label}</span>
                        <span className="text-xs text-white/45">{item.detail}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 bg-[#120f0c]">{children}</div>
      </div>
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  detail,
  tone = "amber",
  icon: Icon
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "amber" | "green" | "red" | "blue" | "purple";
  icon: LucideIcon;
}) {
  const toneClass = {
    amber: "text-[var(--amber)] bg-amber-300/10 border-amber-300/20",
    green: "text-emerald-300 bg-emerald-400/10 border-emerald-300/20",
    red: "text-red-300 bg-red-400/10 border-red-300/20",
    blue: "text-blue-300 bg-blue-400/10 border-blue-300/20",
    purple: "text-purple-300 bg-purple-400/10 border-purple-300/20"
  }[tone];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_45px_rgba(0,0,0,.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-white/45">{label}</p>
          <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClass}`}>
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/60">{detail}</p>
    </div>
  );
}

export function AdminPriorityCard({
  href,
  title,
  copy,
  icon: Icon,
  tone = "amber"
}: {
  href: string;
  title: string;
  copy: string;
  icon: LucideIcon;
  tone?: "amber" | "green" | "red" | "blue" | "purple";
}) {
  const toneClass = tone === "red" ? "text-red-300" : tone === "green" ? "text-emerald-300" : tone === "blue" ? "text-blue-300" : tone === "purple" ? "text-purple-300" : "text-[var(--amber)]";

  return (
    <Link href={href} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:border-amber-300/40 hover:bg-white/[0.09]">
      <div className="flex items-center gap-3">
        <Icon className={toneClass} size={20} />
        <h3 className="font-black">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/62">{copy}</p>
    </Link>
  );
}

export const adminIcons = {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Headphones,
  ShieldCheck,
  Users,
  Wrench
};
