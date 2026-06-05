import { Badge, Card, DashboardHeader } from "@/components/ui";
import { SavedPropertyForm } from "@/components/saved-asset-forms";
import { requireRole } from "@/lib/auth";
import { getCustomerSavedProperties } from "@/lib/jobs";

export default async function CustomerPropertiesPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const properties = await getCustomerSavedProperties(user);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Saved properties" role="Customer" />
        <div className="grid gap-5 lg:grid-cols-[.62fr_.38fr]">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {properties.length ? (
              properties.map((property) => (
                <Card key={property.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge tone={property.is_default ? "green" : "gray"}>{property.is_default ? "Default" : "Property"}</Badge>
                      <h2 className="mt-4 text-xl font-black">{property.label ?? "Property"}</h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                        {property.address}, {[property.suburb, property.postcode, property.state].filter(Boolean).join(" ")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <h2 className="font-black">No saved properties yet</h2>
                <p className="mt-2 text-[var(--text2)]">Properties appear here after signup or membership setup.</p>
              </Card>
            )}
          </div>
          <Card>
            <Badge tone="blue">Add property</Badge>
            <h2 className="mt-4 text-xl font-black">Save a home or rental</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Saved properties make future emergency requests faster.</p>
            <div className="mt-5">
              <SavedPropertyForm />
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
