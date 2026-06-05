import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["customer", "admin", "super_admin"]);

  return children;
}
