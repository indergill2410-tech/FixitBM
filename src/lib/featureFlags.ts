function publicFlag(name: string, fallback: boolean) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export const fixerRecruitmentMode = publicFlag("NEXT_PUBLIC_FIXER_RECRUITMENT_MODE", true);
export const fixerSubscriptionsEnabled = publicFlag("NEXT_PUBLIC_FIXER_SUBSCRIPTIONS_ENABLED", false);
export const showFixerPricing = publicFlag("NEXT_PUBLIC_SHOW_FIXER_PRICING", false);
export const fixerDirectToDashboard = publicFlag("NEXT_PUBLIC_FIXER_DIRECT_TO_DASHBOARD", true);

// Master switch for the Fixer-facing lead marketplace (self-serve lead feed,
// credit wallet, claim-by-credits). Off at launch: jobs are dispatched by admins
// and Fixers only ever see work that has been assigned to them. The credit and
// subscription backend stays intact behind this flag for a future launch.
export const fixerMarketplaceEnabled = publicFlag("NEXT_PUBLIC_FIXER_MARKETPLACE_ENABLED", false);

export const showFixerSubscriptionUi = (fixerSubscriptionsEnabled || showFixerPricing) && fixerMarketplaceEnabled;
export const showFixerRecruitmentUi = fixerRecruitmentMode && !showFixerSubscriptionUi;
