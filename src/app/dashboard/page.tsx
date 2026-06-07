import { redirect } from "next/navigation";
import { getCurrentAppUser, roleHome } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardIndexPage() {
  const user = await getCurrentAppUser();

  if (!user) {
    redirect("/login");
  }

  redirect(roleHome(user.role));
}
