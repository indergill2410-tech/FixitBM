import { redirect } from "next/navigation";
import { getCurrentAppUser, roleHome } from "@/lib/auth";
import { getAgencyAccessForUser } from "@/lib/agency";

export const dynamic = "force-dynamic";

export default async function DashboardIndexPage() {
  const user = await getCurrentAppUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "customer") {
    const agencyAccess = await getAgencyAccessForUser(user);
    if (agencyAccess.agency) {
      redirect("/dashboard/agency");
    }
  }

  redirect(roleHome(user.role));
}
