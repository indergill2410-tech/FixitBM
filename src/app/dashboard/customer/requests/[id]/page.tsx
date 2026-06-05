import { redirect } from "next/navigation";

export default async function CustomerRequestDetailAliasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/customer/jobs/${id}`);
}
