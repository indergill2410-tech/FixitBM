export const fixerRole = "tradie" as const;

export const fixerRoutes = {
  dashboard: "/dashboard/tradie",
  register: "/register/tradie",
  publicApply: "/become-a-fixer"
} as const;

export const fixerTables = {
  profiles: "tradie_profiles",
  subscriptions: "tradie_subscriptions",
  wallets: "tradie_credit_wallets"
} as const;
