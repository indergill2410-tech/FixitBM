"use client";

import Link from "next/link";
import { ArrowRight, Car, Home, Wrench } from "lucide-react";
import { track } from "@/lib/analytics-client";

// The hero's right panel: three tappable triage lanes that ARE the first step
// of the request funnel. Each deep-links into the wizard with the lane
// preselected, so a stressed visitor starts without realising they started.
const lanes = [
  {
    event: "hero_lane_home",
    href: "/post-job?lane=emergency_home",
    icon: Home,
    title: "My home — something's broken",
    copy: "Water where it shouldn't be, no power, locked out, roof leaking. Get it handled.",
    tone: "emergency" as const
  },
  {
    event: "hero_lane_road",
    href: "/post-job?lane=emergency_road",
    icon: Car,
    title: "My car — I'm stuck",
    copy: "Flat tyre, dead battery, locked out on the road. Help comes to you.",
    tone: "default" as const
  },
  {
    event: "hero_lane_planned",
    href: "/post-job?lane=standard_trade_job",
    icon: Wrench,
    title: "Planned work — get quotes",
    copy: "Repairs and projects, priced by verified Fixers before you commit.",
    tone: "default" as const
  }
];

export function HeroLanes() {
  return (
    <div className="grid gap-3">
      <p className="text-xs font-black uppercase tracking-wide text-[var(--text3)]">What&apos;s happening?</p>
      {lanes.map((lane) => (
        <Link
          key={lane.event}
          href={lane.href}
          onClick={() => track("cta_click", { source: "hero_lanes", action: lane.event })}
          className={`focus-ring group rounded-2xl border p-5 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${
            lane.tone === "emergency"
              ? "border-amber-200 bg-[var(--amber-light)] hover:border-amber-300"
              : "border-[var(--border)] bg-white hover:border-amber-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                lane.tone === "emergency" ? "bg-[var(--amber)] text-white" : "bg-[var(--amber-dim)] text-[var(--amber2)]"
              }`}
            >
              <lane.icon size={22} />
            </span>
            <div className="min-w-0">
              <p className="font-black leading-6">{lane.title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text2)]">{lane.copy}</p>
            </div>
            <ArrowRight size={18} className="ml-auto shrink-0 text-[var(--text3)] transition group-hover:translate-x-0.5 group-hover:text-[var(--amber2)]" />
          </div>
        </Link>
      ))}
      <p className="mt-1 text-center text-xs font-semibold text-[var(--text3)]">
        Free to start · About a minute · A verified Fixer sees the full picture
      </p>
    </div>
  );
}
