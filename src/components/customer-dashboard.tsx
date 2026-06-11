"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Car, CheckCircle2, Circle, ShieldCheck, Sparkles } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { track } from "@/lib/analytics-client";
import type { ProtectionCta, ProtectionState } from "@/lib/membership-state";

// Tracked CTA — fires a funnel event then navigates. Keeps the dashboard a
// server component while still instrumenting every conversion surface.
export function TrackedCTA({
  cta,
  variant = "primary",
  className
}: {
  cta: ProtectionCta;
  variant?: "primary" | "ghost" | "dark" | "light";
  className?: string;
}) {
  const base =
    "app-button focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-5 text-center text-sm font-black transition hover:-translate-y-0.5";
  const tone =
    variant === "primary"
      ? "app-button-primary"
      : variant === "dark"
        ? "app-button-dark"
        : variant === "light"
          ? "app-button-light"
          : "app-button-ghost";

  return (
    <Link
      href={cta.href}
      onClick={() => track("cta_click", { source: "customer_dashboard", action: cta.event })}
      className={`${base} ${tone} ${className ?? ""}`}
    >
      {cta.label}
      <ArrowRight size={16} />
    </Link>
  );
}

export function ProtectionHero({ state, score }: { state: ProtectionState; score: number }) {
  const ringColor = score >= 75 ? "var(--green)" : score >= 45 ? "var(--amber)" : "var(--red)";

  return (
    <Card variant="membership" className="relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--amber)] opacity-10" />
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Badge>{state.heroBadge}</Badge>
          <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight md:text-4xl">{state.heroTitle}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[var(--text2)]">{state.heroCopy}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <TrackedCTA cta={state.primaryCta} />
            {state.secondaryCta ? <TrackedCTA cta={state.secondaryCta} variant="ghost" /> : null}
          </div>
        </div>
        <div
          className="mx-auto grid h-32 w-32 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${ringColor} ${score * 3.6}deg, var(--bg2) 0deg)` }}
          aria-label={`Protection score ${score} percent`}
        >
          <div className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-[var(--shadow)]">
            <div className="text-center">
              <p className="text-2xl font-black">{score}%</p>
              <p className="text-[9px] font-bold uppercase text-[var(--text3)]">Protected</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ProtectionScoreBuilder({ state }: { state: ProtectionState }) {
  const remaining = state.scoreActions.filter((action) => !action.done);

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-[var(--amber2)]" />
        <h2 className="text-xl font-black">Raise your protection</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
        {remaining.length
          ? "Each step makes the next emergency faster and calmer."
          : "You've done it all — your household is fully prepared."}
      </p>
      <div className="mt-4 grid gap-2">
        {state.scoreActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            onClick={() => track("cta_click", { source: "score_builder", action: action.label })}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-sm font-semibold transition ${
              action.done
                ? "border-[var(--border)] bg-[var(--bg)] text-[var(--text3)]"
                : "border-amber-200 bg-[var(--amber-light)] text-[var(--text)] hover:bg-white"
            }`}
          >
            <span className="flex items-center gap-2">
              {action.done ? (
                <CheckCircle2 size={16} className="text-[var(--green)]" />
              ) : (
                <Circle size={16} className="text-[var(--amber2)]" />
              )}
              {action.label}
            </span>
            {action.done ? (
              <Badge tone="green">Done</Badge>
            ) : (
              <span className="shrink-0 font-black text-[var(--amber2)]">+{action.points}</span>
            )}
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function LossAversionCard({ state }: { state: ProtectionState }) {
  if (!state.lossAversion) return null;
  const { title, copy, cta } = state.lossAversion;

  return (
    <Card variant="emergency">
      <AlertTriangle size={18} className="text-[var(--amber2)]" />
      <h2 className="mt-3 text-lg font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{copy}</p>
      <TrackedCTA cta={cta} className="mt-4 w-full" />
    </Card>
  );
}

export function CompletePeaceOfMindCard({ state }: { state: ProtectionState }) {
  if (!state.completeUpsell) return null;
  const { title, copy, cta } = state.completeUpsell;

  return (
    <Card variant="dark" className="relative overflow-hidden">
      <Car className="text-[var(--amber)]" />
      <Badge className="mt-4">Home + Road</Badge>
      <h2 className="mt-3 text-xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/70">{copy}</p>
      <TrackedCTA cta={cta} variant="light" className="mt-5 w-full" />
    </Card>
  );
}

export function MembershipReceiptCard({ state }: { state: ProtectionState }) {
  if (!state.membershipReceipt) return null;
  const { items, nextDueLabel, renewalLabel } = state.membershipReceipt;

  return (
    <Card>
      <ShieldCheck className="text-[var(--green)]" />
      <h2 className="mt-3 text-xl font-black">What your membership covers</h2>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[var(--text2)]">
            <CheckCircle2 size={15} className="shrink-0 text-[var(--green)]" />
            {item}
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-1 rounded-xl bg-[var(--bg)] p-3 text-xs font-bold uppercase tracking-wide text-[var(--text3)]">
        <span>{nextDueLabel}</span>
        <span>{renewalLabel}</span>
      </div>
    </Card>
  );
}

export function RequestProgress({ steps }: { steps: { label: string; state: string }[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {steps.map((step) => (
        <div key={step.label} className="rounded-xl border border-[var(--border)] bg-white p-3">
          <div
            className={`h-2 w-2 rounded-full ${
              step.state === "done" ? "bg-[var(--green)]" : step.state === "current" ? "bg-[var(--amber)]" : "bg-[var(--border2)]"
            }`}
          />
          <p className={`mt-3 text-xs font-bold ${step.state === "upcoming" ? "text-[var(--text3)]" : "text-[var(--text)]"}`}>
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}
