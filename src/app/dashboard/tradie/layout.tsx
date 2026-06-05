import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TradieDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["tradie", "admin", "super_admin"]);

  return children;
}
