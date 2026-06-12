"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

// Live notification bell: unread badge from real data, dropdown with the
// latest items, marks everything read when opened. Replaces the old
// decorative bell that showed a hardcoded red dot.
export function NotificationsBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notifications")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setItems(data.notifications ?? []);
        setUnread(data.unread ?? 0);
      })
      .catch(() => {
        // Bell is best-effort; never break the dashboard.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      void fetch("/api/notifications", { method: "POST" }).catch(() => {});
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        aria-label={unread ? `Notifications (${unread} unread)` : "Notifications"}
        aria-expanded={open}
        className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow)]"
      >
        <Bell size={17} />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--red)] px-1 text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-lg)]">
          <p className="px-2 pb-2 text-xs font-black uppercase tracking-wide text-[var(--text3)]">Notifications</p>
          {items.length ? (
            <div className="grid max-h-80 gap-1 overflow-y-auto">
              {items.map((item) => {
                const content = (
                  <>
                    <p className="text-sm font-bold leading-5">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[var(--text2)]">{item.body}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase text-[var(--text3)]">
                      {new Date(item.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                      {item.read_at ? "" : " · New"}
                    </p>
                  </>
                );
                return item.link ? (
                  <Link key={item.id} href={item.link} className="rounded-xl p-2 hover:bg-[var(--bg)]" onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.id} className="rounded-xl p-2">
                    {content}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl bg-[var(--bg)] p-3 text-sm leading-6 text-[var(--text2)]">
              Nothing yet. Updates about your requests and account will appear here.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
