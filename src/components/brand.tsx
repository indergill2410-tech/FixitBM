import { clsx } from "clsx";
import { BadgeDollarSign, Car, Home, ShieldCheck, Siren, Wrench } from "lucide-react";

const symbolMap = {
  mark: Wrench,
  home: Home,
  road: Car,
  plus: ShieldCheck,
  verified: ShieldCheck,
  urgent: Siren,
  credits: BadgeDollarSign
};

export type FixitSymbolName = keyof typeof symbolMap;

export function FixitMark({
  size = "md",
  shape = "square",
  className
}: {
  size?: "sm" | "md" | "lg";
  shape?: "square" | "circle";
  className?: string;
}) {
  const dimension = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <span
      aria-hidden="true"
      className={clsx(
        "inline-flex shrink-0 items-center justify-center bg-[var(--amber)] text-white shadow-[0_6px_18px_rgba(245,158,11,.28)]",
        dimension,
        shape === "circle" ? "rounded-full" : "rounded-xl",
        className
      )}
    >
      <FixitWrenchGlyph />
    </span>
  );
}

function FixitWrenchGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-[62%] w-[62%] overflow-visible">
      <path
        d="M20.7 4.7c2.1-.5 4.3.1 5.9 1.7l-4 4 1.8 4.3 4.2-4.2c.8 2.9-.6 6.1-3.5 7.5-1.6.8-3.4.9-5 .4L10.2 28a3.2 3.2 0 0 1-4.5-4.5l9.6-9.8a6.8 6.8 0 0 1 5.4-9z"
        fill="currentColor"
      />
      <path d="M8.1 24.7a1.1 1.1 0 1 0 1.6 1.6 1.1 1.1 0 0 0-1.6-1.6z" fill="var(--amber)" />
      <path
        d="M5.2 10.8h5.1M7.8 8.2v5.1M4.9 17.3h3.3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.1"
        opacity=".82"
      />
    </svg>
  );
}

export function FixitSymbol({
  name,
  label,
  tone = "amber"
}: {
  name: FixitSymbolName;
  label: string;
  tone?: "amber" | "green" | "blue" | "red" | "dark";
}) {
  const Icon = symbolMap[name];

  return (
    <div className="flex min-h-24 flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)]">
      <span
        className={clsx("flex h-10 w-10 items-center justify-center rounded-xl", {
          "bg-[var(--amber-dim)] text-[var(--amber2)]": tone === "amber",
          "bg-[var(--green-light)] text-[var(--green)]": tone === "green",
          "bg-[var(--blue-light)] text-[var(--blue)]": tone === "blue",
          "bg-[var(--red-light)] text-[var(--red)]": tone === "red",
          "bg-[var(--text)] text-white": tone === "dark"
        })}
      >
        <Icon size={20} strokeWidth={2.2} />
      </span>
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

export const fixitSymbolSet = [
  { name: "mark", label: "Fixit mark", tone: "amber" },
  { name: "home", label: "Home help", tone: "green" },
  { name: "road", label: "Road help", tone: "blue" },
  { name: "plus", label: "Fixit Peace", tone: "amber" },
  { name: "urgent", label: "Urgent dispatch", tone: "red" },
  { name: "credits", label: "Lead credits", tone: "dark" }
] satisfies { name: FixitSymbolName; label: string; tone: "amber" | "green" | "blue" | "red" | "dark" }[];
