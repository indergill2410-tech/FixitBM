import { clsx } from "clsx";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Bell, Menu, ShieldCheck, Zap } from "lucide-react";
import { FixitMark } from "@/components/brand";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "dark" | "danger" | "success";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function Button({ href, children, variant = "primary", className, onClick, disabled }: ButtonProps) {
  const styles = clsx(
    "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
    {
      "bg-[var(--amber)] text-white shadow-[0_4px_14px_rgba(245,158,11,.34)] hover:bg-[var(--amber2)]":
        variant === "primary",
      "border border-[var(--border)] bg-white text-[var(--text2)] shadow-[var(--shadow)] hover:border-[var(--amber)] hover:text-[var(--amber2)]":
        variant === "ghost",
      "bg-[var(--text)] text-white shadow-[var(--shadow-md)]": variant === "dark",
      "border border-red-200 bg-[var(--red-light)] text-[var(--red)]": variant === "danger",
      "border border-green-200 bg-[var(--green-light)] text-[var(--green)]": variant === "success"
    },
    className
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function PublicHeader() {
  const navItems = [
    ["Home", "/"],
    ["PropertySafe", "/propertysafe"],
    ["Fixit Plus", "/fixit-plus"],
    ["Emergencies", "/home-emergencies"],
    ["Roadside", "/roadside-help"]
  ];

  const mobileInfoLinks = [
    ["How It Works", "/how-it-works"],
    ["Pricing", "/pricing"],
    ["All Trade Jobs", "/all-trade-jobs"],
    ["Guides", "/blog"],
    ["Contact", "/contact"]
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/92 backdrop-blur">
      <div className="container flex h-16 items-center gap-5">
        <Link href="/" className="flex items-center gap-3">
          <FixitMark size="sm" />
          <span className="text-base font-black tracking-tight">
            Fixit<span className="text-[var(--amber)]">247</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text2)] hover:bg-[var(--amber-dim)] hover:text-[var(--amber2)]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Button href="/become-a-fixer" variant="ghost" className="min-h-9 px-4">
            Become a Fixer
          </Button>
          <Button href="/dashboard" variant="ghost" className="min-h-9 px-4">
            Account
          </Button>
          <Button href="/post-job" className="min-h-9 px-4">
            Get Help Now
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Button href="/post-job" className="min-h-10 px-3 text-xs sm:px-4 sm:text-sm">
            Help Now
          </Button>
        <details className="group">
          <summary className="flex h-10 w-10 list-none items-center justify-center rounded-lg border border-[var(--border)] bg-white">
            <Menu size={18} />
          </summary>
          <div className="absolute left-3 right-3 top-[72px] grid gap-2 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-lg)]">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-xl bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text2)]">
                {label}
              </Link>
            ))}
            {mobileInfoLinks.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[var(--text2)]">
                {label}
              </Link>
            ))}
            <Link href="/become-a-fixer" className="rounded-xl bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text2)]">
              Become a Fixer
            </Link>
            <Link href="/dashboard" className="rounded-xl bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text2)]">
              Account
            </Link>
            <Button href="/post-job" className="w-full">
              Get Help Now
            </Button>
          </div>
        </details>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const groups = [
    {
      title: "Get Help",
      links: [
        ["Get Help Now", "/post-job"],
        ["Home Emergencies", "/home-emergencies"],
        ["Roadside Help", "/roadside-help"],
        ["All Trade Jobs", "/all-trade-jobs"]
      ]
    },
    {
      title: "Protection",
      links: [
        ["Fixit Plus", "/fixit-plus"],
        ["PropertySafe", "/propertysafe"],
        ["Pricing", "/pricing"]
      ]
    },
    {
      title: "Network",
      links: [
        ["Become a Fixer", "/become-a-fixer"],
        ["Account", "/dashboard"],
        ["Contact", "/contact"]
      ]
    },
    {
      title: "Company",
      links: [
        ["How It Works", "/how-it-works"],
        ["Guides", "/blog"],
        ["About", "/about"],
        ["Privacy", "/privacy"],
        ["Terms", "/terms"]
      ]
    }
  ];

  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="container grid gap-8 py-10 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <FixitMark size="sm" />
            <span className="text-base font-black">
              Fixit<span className="text-[var(--amber)]">247</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--text2)]">
            Fast help when things break, plus clearer records for homes, roads, rentals, and managed properties.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button href="/post-job" className="min-h-10 px-4">
              Get Help Now
            </Button>
            <Button href="/propertysafe" variant="ghost" className="min-h-10 px-4">
              PropertySafe
            </Button>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-black">{group.title}</h2>
              <div className="mt-3 grid gap-2">
                {group.links.map(([label, href]) => (
                  <Link key={href} href={href} className="text-sm font-medium text-[var(--text2)] hover:text-[var(--amber2)]">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container border-t border-[var(--border)] py-5 text-xs font-semibold text-[var(--text3)]">
        Fixit247 helps organise requests and connect customers with Fixers. Emergency services should be contacted first where there is immediate danger.
      </div>
    </footer>
  );
}

export function MobileBottomActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-white/95 p-3 shadow-[0_-12px_30px_rgba(30,26,23,.08)] backdrop-blur md:hidden">
      <Button href="/post-job" className="w-full">
        <Zap size={17} />
        Get Emergency Help Now
      </Button>
    </div>
  );
}

export function Card({
  children,
  className,
  variant = "default"
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "emergency" | "membership" | "dark";
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border p-5 transition",
        variant === "dark"
          ? "dark-command border-white/10 shadow-[var(--shadow-lg)]"
          : "border-[var(--border)] bg-white shadow-[var(--shadow)] hover:shadow-[var(--shadow-md)]",
        variant === "emergency" && "border-amber-200 bg-[var(--amber-light)]",
        variant === "membership" && "border-amber-200 bg-white shadow-[0_14px_40px_rgba(245,158,11,.12)]",
        variant === "elevated" && "shadow-[var(--shadow-lg)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "amber",
  className
}: {
  children: React.ReactNode;
  tone?: "amber" | "green" | "red" | "blue" | "purple" | "gray";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
        {
          "bg-[var(--amber-dim)] text-[var(--amber2)]": tone === "amber",
          "bg-[var(--green-light)] text-[var(--green)]": tone === "green",
          "bg-[var(--red-light)] text-[var(--red)]": tone === "red",
          "bg-[var(--blue-light)] text-[var(--blue)]": tone === "blue",
          "bg-[var(--purple-light)] text-[var(--purple)]": tone === "purple",
          "bg-[var(--bg2)] text-[var(--text2)]": tone === "gray"
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function EmergencyCTA() {
  return (
    <Card variant="emergency" className="relative overflow-hidden">
      <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-[var(--amber)] opacity-10" />
      <Badge tone="red">Emergency first</Badge>
      <h3 className="mt-4 text-2xl font-black tracking-tight">Something gone wrong?</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
        Tell us what happened and we will prepare the request for the right local help.
      </p>
      <Button href="/post-job" className="mt-5 w-full">
        Start emergency request
        <ArrowRight size={16} />
      </Button>
    </Card>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-[var(--text2)]">{detail}</p>
    </Card>
  );
}

export function DashboardHeader({ title, role }: { title: string; role: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div>
        <Badge tone="amber">{role}</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-tight">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow)]">
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--red)]" />
        </button>
        <FixitMark shape="circle" />
      </div>
    </div>
  );
}

export function IconTile({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex min-h-28 flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[var(--shadow-md)]">
      <Icon className="text-[var(--amber2)]" size={22} />
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

export function TrustStrip() {
  return (
    <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)] md:grid-cols-3">
      {["Free requests", "Fixit Plus from $29/month", "PropertySafe for owners and agencies"].map((item) => (
        <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[var(--text2)]">
          <ShieldCheck size={16} className="text-[var(--green)]" />
          {item}
        </div>
      ))}
    </div>
  );
}
