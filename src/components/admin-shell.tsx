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
  Settings,
  ShieldCheck,
  Users,
  Wrench
} from "lucide-react";
import { Badge } from "@/components/ui";

const adminNav: { label: string; href: string; icon: LucideIcon; detail: string }[] = [
  { label: "Operations", href: "/admin", icon: Gauge, detail: "Live queue" },
  { label: "Requests", href: "/admin/jobs", icon: ClipboardList, detail: "Queue" },
  { label: "Safety Checks", href: "/admin/safety-checks", icon: ShieldCheck, detail: "Member readiness" },
  { label: "PropertySafe", href: "/admin/propertysafe", icon: Building2, detail: "Shared access" },
  { label: "Customers", href: "/admin/customers", icon: Users, detail: "Profiles" },
  { label: "Fixers", href: "/admin/tradies", icon: Wrench, detail: "Network" },
  { label: "Memberships", href: "/admin/memberships", icon: Home, detail: "Fixit Plus" },
  { label: "Revenue", href: "/admin/revenue", icon: BarChart3, detail: "Billing" },
  { label: "Credits", href: "/admin/credits", icon: CreditCard, detail: "Refunds" },
  { label: "Support", href: "/admin/support", icon: Headphones, detail: "Tickets" },
  { label: "Settings", href: "/admin/settings", icon: Settings, detail: "Readiness" }
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

          <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4">
            <Badge>Protected</Badge>
            <p className="mt-3 text-sm font-bold text-white">Super admin area</p>
            <p className="mt-1 text-xs leading-5 text-white/60">Requests, Fixers, Safety Checks, billing readiness, and customer support.</p>
          </div>

          <nav className="mt-5 grid gap-2">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm transition hover:border-white/10 hover:bg-white/7"
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
