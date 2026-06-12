export type BillingProductType = "customer_membership" | "tradie_subscription" | "credit_pack" | "agency_subscription";

export type BillingPlan = {
  code: string;
  name: string;
  type: BillingProductType;
  priceCents: number;
  interval?: "month";
  stripePriceEnv: string;
  description: string;
};

export const billingPlans: BillingPlan[] = [
  {
    code: "home",
    name: "Fixit Peace Home",
    type: "customer_membership",
    priceCents: 2900,
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_FIXIT_PLUS_HOME",
    description: "Emergency peace of mind for your home."
  },
  {
    code: "complete",
    name: "Fixit Peace Complete",
    type: "customer_membership",
    priceCents: 4900,
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_FIXIT_PLUS_COMPLETE",
    description: "Home + roadside emergency peace of mind."
  },
  {
    code: "local_pro",
    name: "Local Pro",
    type: "tradie_subscription",
    priceCents: 9900,
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_TRADIE_LOCAL_PRO",
    description: "Local job alerts, stronger matching, and standard lead access."
  },
  {
    code: "emergency_pro",
    name: "Emergency Pro",
    type: "tradie_subscription",
    priceCents: 19900,
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_TRADIE_EMERGENCY_PRO",
    description: "Priority emergency alerts, higher ranking, and after-hours jobs."
  },
  {
    code: "growth_partner",
    name: "Growth Partner",
    type: "tradie_subscription",
    priceCents: 39900,
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_TRADIE_GROWTH_PARTNER",
    description: "Multi-suburb coverage, analytics, and higher lead volume."
  },
  {
    code: "credits_starter",
    name: "Starter credit pack",
    type: "credit_pack",
    priceCents: 4900,
    stripePriceEnv: "STRIPE_PRICE_CREDITS_STARTER",
    description: "Starter lead-credit pack."
  },
  {
    code: "credits_growth",
    name: "Growth credit pack",
    type: "credit_pack",
    priceCents: 14900,
    stripePriceEnv: "STRIPE_PRICE_CREDITS_GROWTH",
    description: "Growth lead-credit pack."
  },
  {
    code: "credits_emergency",
    name: "Emergency credit pack",
    type: "credit_pack",
    priceCents: 29900,
    stripePriceEnv: "STRIPE_PRICE_CREDITS_EMERGENCY",
    description: "Emergency lead-credit pack."
  },
  {
    code: "credits_business",
    name: "Business credit pack",
    type: "credit_pack",
    priceCents: 59900,
    stripePriceEnv: "STRIPE_PRICE_CREDITS_BUSINESS",
    description: "Business lead-credit pack."
  },
  {
    code: "credits_agency",
    name: "Agency credit pack",
    type: "credit_pack",
    priceCents: 99900,
    stripePriceEnv: "STRIPE_PRICE_CREDITS_AGENCY",
    description: "Agency lead-credit pack."
  },
  {
    code: "agency_starter",
    name: "PropertySafe Starter",
    type: "agency_subscription",
    priceCents: 4900,
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_AGENCY_STARTER",
    description: "PropertySafe for small portfolios (up to 10 properties)."
  },
  {
    code: "agency_growth",
    name: "PropertySafe Growth",
    type: "agency_subscription",
    priceCents: 14900,
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_AGENCY_GROWTH",
    description: "PropertySafe for growing portfolios (11–50 properties)."
  },
  {
    code: "agency_pro",
    name: "PropertySafe Pro",
    type: "agency_subscription",
    priceCents: 34900,
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_AGENCY_PRO",
    description: "PropertySafe for established portfolios (51–150 properties)."
  },
  {
    code: "agency_enterprise",
    name: "PropertySafe Enterprise",
    type: "agency_subscription",
    priceCents: 69900,
    interval: "month",
    stripePriceEnv: "STRIPE_PRICE_AGENCY_ENTERPRISE",
    description: "PropertySafe for large portfolios (151+ properties)."
  }
];

export const agencyPlanCodes = ["agency_starter", "agency_growth", "agency_pro", "agency_enterprise"] as const;

export const creditPackCredits: Record<string, number> = {
  credits_starter: 55,
  credits_growth: 180,
  credits_emergency: 380,
  credits_business: 800,
  credits_agency: 1500
};

export function getBillingPlan(code: string) {
  return billingPlans.find((plan) => plan.code === code) ?? null;
}

export function isStripeConfigured(plan?: BillingPlan | null) {
  return Boolean(process.env.STRIPE_SECRET_KEY && plan && process.env[plan.stripePriceEnv]);
}

export async function stripeRequest<T>(path: string, init: RequestInit = {}) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Checkout is temporarily unavailable.");

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(init.headers ?? {})
    }
  });

  const data = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Payment request failed.");
  }

  return data;
}

export function getCreditAmount(planCode: string) {
  return creditPackCredits[planCode] ?? 0;
}

export function formatMoney(priceCents: number) {
  return `$${Math.round(priceCents / 100).toLocaleString("en-AU")}`;
}
