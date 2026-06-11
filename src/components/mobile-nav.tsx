"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarCheck,
  ClipboardList,
  Home,
  Inbox,
  Menu,
  ShieldCheck,
  UserCircle,
  Wallet,
  Wrench,
  X
} from "lucide-react";

// Slide-down nav drawer for the public header. Replaces the old <details>
// hack: closes on route change, locks body scroll, and is keyboard escapable.
export function MobileNavDrawer({
  navItems,
  infoLinks
}: {
  navItems: string[][];
  infoLinks: string[][];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close whenever navigation happens (adjust-state-during-render pattern).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="focus-ring flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 top-16 z-40 bg-black/30" onClick={() => setOpen(false)} aria-hidden />
          <div className="drawer-panel fixed inset-x-3 top-[72px] z-50 max-h-[calc(100dvh-92px)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-lg)]">
            <div className="grid gap-2">
              {navItems.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-xl bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text2)]">
                  {label}
                </Link>
              ))}
              <div className="my-1 border-t border-[var(--border)]" />
              {infoLinks.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--text2)]">
                  {label}
                </Link>
              ))}
              <div className="my-1 border-t border-[var(--border)]" />
              <Link href="/become-a-fixer" className="rounded-xl bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text2)]">
                Become a Fixer
              </Link>
              <Link href="/dashboard" className="rounded-xl bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text2)]">
                Account
              </Link>
              <Link
                href="/post-job"
                className="app-button app-button-primary focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-black"
              >
                Get help now
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

type TabItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const customerTabs: TabItem[] = [
  { label: "Home", href: "/dashboard/customer", icon: Home },
  { label: "Requests", href: "/dashboard/customer/requests", icon: ClipboardList },
  { label: "Safety", href: "/dashboard/customer/safety-checks", icon: ShieldCheck },
  { label: "Property", href: "/dashboard/customer/propertysafe", icon: Building2 },
  { label: "Account", href: "/dashboard/customer/membership", icon: UserCircle }
];

const tradieTabs: TabItem[] = [
  { label: "Hub", href: "/dashboard/tradie", icon: Home },
  { label: "Leads", href: "/dashboard/tradie/leads", icon: Inbox },
  { label: "Jobs", href: "/dashboard/tradie/jobs", icon: Wrench },
  { label: "Checks", href: "/dashboard/tradie/safety-checks", icon: CalendarCheck },
  { label: "Wallet", href: "/dashboard/tradie/wallet", icon: Wallet }
];

// Fixed bottom tab bar so dashboard sections are reachable with a thumb.
export function DashboardTabBar({ role }: { role: "customer" | "tradie" }) {
  const pathname = usePathname();
  const tabs = role === "tradie" ? tradieTabs : customerTabs;

  return (
    <nav
      aria-label="Dashboard navigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[var(--border)] bg-white/95 px-2 pt-2 backdrop-blur md:hidden"
    >
      {tabs.map((tab) => {
        const active =
          tab.href === pathname ||
          (tab.href !== `/dashboard/${role}` && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold ${
              active ? "text-[var(--amber2)]" : "text-[var(--text3)]"
            }`}
          >
            <tab.icon size={19} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
