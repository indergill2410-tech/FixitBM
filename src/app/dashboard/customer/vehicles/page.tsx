import { Badge, Card, DashboardHeader } from "@/components/ui";
import { SavedVehicleForm } from "@/components/saved-asset-forms";
import { requireRole } from "@/lib/auth";
import { getCustomerSavedVehicles } from "@/lib/jobs";

export default async function CustomerVehiclesPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const vehicles = await getCustomerSavedVehicles(user);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Saved vehicles" role="Customer" />
        <div className="grid gap-5 lg:grid-cols-[.62fr_.38fr]">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {vehicles.length ? (
              vehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <Badge tone={vehicle.is_default ? "green" : "gray"}>{vehicle.is_default ? "Default" : "Vehicle"}</Badge>
                  <h2 className="mt-4 text-xl font-black">
                    {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || vehicle.label || "Vehicle"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                    {vehicle.registration ?? "No registration"} · {vehicle.fuel_type ?? "Fuel type pending"}
                  </p>
                </Card>
              ))
            ) : (
              <Card>
                <h2 className="font-black">No saved vehicles yet</h2>
                <p className="mt-2 text-[var(--text2)]">Vehicles support Fixit Peace Complete and roadside requests.</p>
              </Card>
            )}
          </div>
          <Card>
            <Badge tone="blue">Add vehicle</Badge>
            <h2 className="mt-4 text-xl font-black">Save a roadside profile</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Vehicle details help roadside requests move faster.</p>
            <div className="mt-5">
              <SavedVehicleForm />
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
