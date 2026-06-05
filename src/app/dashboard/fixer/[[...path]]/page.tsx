import { redirect } from "next/navigation";

export default async function FixerDashboardAliasPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  redirect(`/dashboard/tradie${path?.length ? `/${path.join("/")}` : ""}`);
}
