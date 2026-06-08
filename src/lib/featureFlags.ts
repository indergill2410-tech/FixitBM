function publicFlag(name: string, fallback: boolean) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export const fixerRecruitmentMode = publicFlag("NEXT_PUBLIC_FIXER_RECRUITMENT_MODE", true);
export const fixerSubscriptionsEnabled = publicFlag("NEXT_PUBLIC_FIXER_SUBSCRIPTIONS_ENABLED", false);
export const showFixerPricing = publicFlag("NEXT_PUBLIC_SHOW_FIXER_PRICING", false);
export const fixerDirectToDashboard = publicFlag("NEXT_PUBLIC_FIXER_DIRECT_TO_DASHBOARD", true);

export const showFixerSubscriptionUi = fixerSubscriptionsEnabled || showFixerPricing;
export const showFixerRecruitmentUi = fixerRecruitmentMode && !showFixerSubscriptionUi;
