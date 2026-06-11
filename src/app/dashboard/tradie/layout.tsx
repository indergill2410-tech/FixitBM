import { DashboardTabBar } from "@/components/mobile-nav";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TradieDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["tradie", "admin", "super_admin"]);

  return (
    <div className="pb-tabbar md:pb-0">
      {children}
      <DashboardTabBar role="tradie" />
    </div>
  );
}
