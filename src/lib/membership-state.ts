import type { HomeProtectionSummary } from "@/lib/safety-checks";

// Pricing anchors — kept consistent with /fixit-plus and the homepage.
export const HOME_PRICE = "$29";
export const COMPLETE_PRICE = "$49";

export type ProtectionTier = "none" | "pending" | "home" | "complete";

export type ProtectionCta = { label: string; href: string; event: string };

export type ScoreAction = { label: string; points: number; href: string; done: boolean };

export type ProtectionState = {
  tier: ProtectionTier;
  heroBadge: string;
  heroTitle: string;
  heroCopy: string;
  primaryCta: ProtectionCta;
  secondaryCta: ProtectionCta | null;
  scoreActions: ScoreAction[];
  lossAversion: { title: string; copy: string; cta: ProtectionCta } | null;
  completeUpsell: { title: string; copy: string; cta: ProtectionCta } | null;
  membershipReceipt: { items: string[]; nextDueLabel: string; renewalLabel: string } | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

// Derives the whole dashboard narrative from the member's own data. Every line
// is grounded in real account state — no invented numbers — but framed for
// peace of mind and loss aversion.
export function getCustomerProtectionState(summary: HomeProtectionSummary): ProtectionState {
  const membership = summary.membership;
  const isActive = membership?.status === "active";
  const isComplete = isActive && membership?.plan === "complete";
  const isHome = isActive && !isComplete;
  const isPending = Boolean(membership) && !isActive;

  const hasAddress = summary.properties.some((property) => Boolean(property.address));
  const hasDefault = summary.properties.some((property) => property.is_default);
  const hasVehicle = summary.vehicles.length > 0;
  const completedCheck = summary.safetyChecks.find((check) => check.status === "completed");
  const openFindings = summary.recommendations.filter((item) => item.status === "recommended").length;
  const firstName = summary.properties[0]?.label ?? null;

  const tier: ProtectionTier = isComplete ? "complete" : isHome ? "home" : isPending ? "pending" : "none";

  // Profile-completion actions mirror the real scoring in getHomeProtectionSummary.
  const scoreActions: ScoreAction[] = [
    { label: "Save your home address", points: 10, href: "/dashboard/customer/properties", done: hasAddress },
    { label: "Set your default home", points: 5, href: "/dashboard/customer/properties", done: hasDefault },
    {
      label: "Activate Fixit Plus protection",
      points: 20,
      href: isActive ? "/dashboard/customer/membership" : "/fixit-plus",
      done: isActive
    },
    {
      label: "Complete your first Safety Check",
      points: 25,
      href: isActive ? "/dashboard/customer/safety-checks/book" : "/fixit-plus",
      done: Boolean(completedCheck)
    },
    {
      label: "Add a vehicle for roadside cover",
      points: 10,
      href: isComplete ? "/dashboard/customer/vehicles" : "/fixit-plus",
      done: hasVehicle
    }
  ];

  // ---- Hero by tier -------------------------------------------------------
  let heroBadge: string;
  let heroTitle: string;
  let heroCopy: string;
  let primaryCta: ProtectionCta;
  let secondaryCta: ProtectionCta | null = null;

  if (tier === "none") {
    heroBadge = "Your home is not protected yet";
    heroTitle = "The next emergency won't send a warning.";
    heroCopy = `A burst pipe at midnight. A lockout in the rain. Fixit Plus means one call, a saved home profile, and priority help when it matters most — from just ${HOME_PRICE}/month, with your first Safety Check included.`;
    primaryCta = { label: `Protect my home — ${HOME_PRICE}/mo`, href: "/fixit-plus", event: "dashboard_join_home" };
    secondaryCta = { label: "See what's included", href: "/fixit-plus", event: "dashboard_plus_learn" };
  } else if (tier === "pending") {
    heroBadge = "Protection activating";
    heroTitle = "You're almost covered.";
    heroCopy =
      "Your Fixit Plus membership is in its short activation window. You can still start urgent requests now — and the moment it activates, your Safety Check and priority help unlock.";
    primaryCta = { label: "View membership", href: "/dashboard/customer/membership", event: "dashboard_view_membership" };
    secondaryCta = { label: "Start a request", href: "/post-job", event: "dashboard_post_job" };
  } else if (tier === "home") {
    heroBadge = "Home protection active";
    heroTitle = "Your home is covered. Your car isn't.";
    heroCopy = `You'll never face a home emergency alone again. But life breaks down on the road too — flat tyres, dead batteries, lockouts far from home. Fixit Plus Complete adds roadside peace of mind for just ${COMPLETE_PRICE}/month.`;
    primaryCta = { label: "Upgrade to Complete", href: "/dashboard/customer/membership", event: "dashboard_upgrade_complete" };
    secondaryCta = summary.safetyCheckCta.includes("Book")
      ? { label: "Book my Safety Check", href: "/dashboard/customer/safety-checks/book", event: "dashboard_book_check" }
      : null;
  } else {
    heroBadge = "Home + road protected";
    heroTitle = "Peace of mind, wherever life happens.";
    heroCopy =
      "Your household is covered for the two places life breaks down most — at home and on the road. Keep your details current so help moves the moment you need it.";
    primaryCta = summary.safetyCheckCta.includes("Book")
      ? { label: "Book my Safety Check", href: "/dashboard/customer/safety-checks/book", event: "dashboard_book_check" }
      : { label: "View my protection", href: "/dashboard/customer/safety-checks", event: "dashboard_view_checks" };
    secondaryCta = hasVehicle
      ? null
      : { label: "Add your vehicle", href: "/dashboard/customer/vehicles", event: "dashboard_add_vehicle" };
  }

  // ---- Personalised loss-aversion (their data) ----------------------------
  let lossAversion: ProtectionState["lossAversion"] = null;
  if (isActive && openFindings > 0) {
    lossAversion = {
      title: `${openFindings} open ${openFindings === 1 ? "finding" : "findings"} from your last check`,
      copy: "Small issues rarely fix themselves — they wait for the worst moment. Turn them into quotes before they become emergencies.",
      cta: { label: "Review findings", href: "/dashboard/customer/safety-checks", event: "dashboard_review_findings" }
    };
  } else if (isActive && !completedCheck) {
    lossAversion = {
      title: firstName ? `${firstName} hasn't had a Safety Check yet` : "Your home hasn't had a Safety Check yet",
      copy: "A 6-monthly readiness check catches the leaks, faults, and worn alarms you can't see — before they wake you at 2am.",
      cta: { label: "Book it now", href: "/dashboard/customer/safety-checks/book", event: "dashboard_book_check" }
    };
  } else if (!isActive && summary.requestCount > 0) {
    lossAversion = {
      title: "You've needed urgent help before",
      copy: "Last time you handled it alone. Members get priority dispatch, a saved home profile, and a check-up so the next emergency is calmer and faster.",
      cta: { label: `Protect my home — ${HOME_PRICE}/mo`, href: "/fixit-plus", event: "dashboard_join_home" }
    };
  } else if (!isActive) {
    lossAversion = {
      title: "Emergencies cost more when you're unprepared",
      copy: "No saved details, no priority, scrambling for a number at the worst time. Membership turns panic into one calm call.",
      cta: { label: "See Fixit Plus", href: "/fixit-plus", event: "dashboard_plus_learn" }
    };
  }

  // ---- Complete upsell (home + road), shown to free & Home members --------
  let completeUpsell: ProtectionState["completeUpsell"] = null;
  if (isHome) {
    completeUpsell = {
      title: hasVehicle ? "Your car is saved — but not covered" : "Your home's protected. The road isn't.",
      copy: hasVehicle
        ? "We can see your vehicle on file. A flat tyre on the motorway or a dead battery in a dark car park is still on you. Complete covers both home and road from $49/month."
        : "Breakdowns don't happen at convenient times. Flat tyres, dead batteries, lockouts, fuel emergencies — Complete brings the same peace of mind to your car for an extra $20/month.",
      cta: { label: "Upgrade to Complete", href: "/dashboard/customer/membership", event: "dashboard_upgrade_complete" }
    };
  } else if (tier === "none") {
    completeUpsell = {
      title: "Cover home and road together",
      copy: `Most emergencies happen in two places — your home and your car. Complete protects both from ${COMPLETE_PRICE}/month, so you're never stranded either way.`,
      cta: { label: "Compare plans", href: "/fixit-plus", event: "dashboard_compare_plans" }
    };
  }

  // ---- Membership receipt (active members) --------------------------------
  let membershipReceipt: ProtectionState["membershipReceipt"] = null;
  if (isActive) {
    membershipReceipt = {
      items: [
        isComplete ? "Home + roadside emergency coordination" : "Home emergency coordination",
        "Priority dispatch on urgent requests",
        "6-monthly Safety & Readiness Check",
        "Saved home profile for faster help"
      ],
      nextDueLabel: summary.nextDueLabel,
      renewalLabel: formatDate(membership?.current_period_end)
        ? `Renews ${formatDate(membership?.current_period_end)}`
        : "Active membership"
    };
  }

  return {
    tier,
    heroBadge,
    heroTitle,
    heroCopy,
    primaryCta,
    secondaryCta,
    scoreActions,
    lossAversion,
    completeUpsell,
    membershipReceipt
  };
}

// Canonical request journey — used to render a real progress bar from the
// job's actual status (replacing the old hardcoded timeline).
const JOURNEY: { key: string; label: string }[] = [
  { key: "received", label: "Request received" },
  { key: "matching", label: "Finding your Fixer" },
  { key: "tradie_accepted", label: "Fixer assigned" },
  { key: "en_route", label: "On the way" },
  { key: "on_site", label: "On site" },
  { key: "work_in_progress", label: "Work underway" },
  { key: "completed", label: "Done" }
];

const STATUS_RANK: Record<string, number> = {
  received: 0,
  matching: 1,
  tradie_accepted: 2,
  quote_provided: 2,
  en_route: 3,
  on_site: 4,
  work_in_progress: 5,
  completed: 6,
  reviewed: 6,
  closed: 6
};

export function getRequestProgress(status: string) {
  const rank = STATUS_RANK[status] ?? 0;
  return JOURNEY.map((step, index) => ({
    label: step.label,
    state: index < rank ? "done" : index === rank ? "current" : "upcoming"
  }));
}
