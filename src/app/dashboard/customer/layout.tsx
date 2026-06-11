import { DashboardTabBar } from "@/components/mobile-nav";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["customer", "admin", "super_admin"]);

  return (
    <div className="pb-tabbar md:pb-0">
      {children}
      <DashboardTabBar role="customer" />
    </div>
  );
}
