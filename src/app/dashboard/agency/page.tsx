import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Home,
  KeyRound,
  LineChart,
  MailCheck,
  ShieldCheck,
  Users,
  Wrench
} from "lucide-react";
import {
  AgencyManagedPropertyForm,
  AgencyOwnerInviteForm,
  AgencyProfileForm,
  AgencyRulesForm
} from "@/components/agency-dashboard-forms";
import { Badge, Button, Card, DashboardHeader, StatCard } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getAgencyDashboard, type AgencyDashboardSummary, type AgencyManagedProperty, type AgencyOwnerInvite } from "@/lib/agency";

export const dynamic = "force-dynamic";

export default async function AgencyDashboardPage() {
  const user = await requireRole(["agency", "admin", "super_admin"]);
  const summary = await getAgencyDashboard(user);
  const canManage = summary.memberRole !== "viewer";
  const displayName = summary.agency?.name ?? "PropertySafe agency workspace";

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title={summary.agency ? displayName : "PropertySafe agency dashboard"} role="Agency command" />

        <section className="grid gap-5 lg:grid-cols-[1fr_.42fr]">
          <Card variant="dark" className="overflow-hidden">
            <Badge>PropertySafe for agencies</Badge>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_.55fr] lg:items-end">
              <div>
                <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
                  {summary.agency ? "Owners see the record. Your team keeps control." : "Set up the agency workspace before the first onboarding call."}
                </h2>
                <p className="mt-5 max-w-2xl leading-7 text-white/70">
                  PropertySafe keeps urgent requests, managed properties, owner access, Safety Check history, and next
                  fixes connected without replacing the current Fixit247 request flow.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button href="/post-job">
                    Start maintenance request
                    <ArrowRight size={17} />
                  </Button>
                  <Button href="/propertysafe/onboarding">
                    Book walkthrough
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-white/50">Portfolio readiness</p>
                <p className="mt-2 text-6xl font-black tracking-tight">{summary.stats.readinessScore}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Score improves as the agency profile, managed properties, owner access, and rules are completed.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="membership">
            <ShieldCheck className="text-[var(--green)]" />
            <Badge tone="green" className="mt-4">Tomorrow-ready</Badge>
            <h2 className="mt-4 text-2xl font-black">Best first onboarding story.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
              Show the agency a controlled workspace: properties, owner visibility, attention status, and the rules that
              make maintenance feel organised.
            </p>
            <Button href="/propertysafe" variant="ghost" className="mt-5 w-full">
              View public PropertySafe page
            </Button>
          </Card>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Readiness" value={`${summary.stats.readinessScore}%`} detail="Agency setup strength" />
          <StatCard label="Properties" value={String(summary.stats.propertyCount)} detail={`${summary.stats.activeProperties} active`} />
          <StatCard label="Owner access" value={String(summary.stats.ownerVisible)} detail={`${summary.stats.pendingInvites} pending`} />
          <StatCard label="Needs review" value={String(summary.stats.needsReview)} detail="Watch and follow-up work" />
          <StatCard label="Urgent" value={String(summary.stats.urgent)} detail="Needs fast triage" />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[.42fr_.58fr]">
          <Card>
            <Building2 className="text-[var(--amber2)]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{summary.agency ? "Agency profile" : "Create agency workspace"}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                  This anchors the portfolio, owner access, and maintenance rules to the signed-in account.
                </p>
              </div>
              {summary.agency ? <Badge tone={summary.agency.status === "active" ? "green" : "amber"}>{labelize(summary.agency.status)}</Badge> : null}
            </div>
            <div className="mt-5">
              <AgencyProfileForm agency={summary.agency} />
            </div>
          </Card>

          <Card>
            <LineChart className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-2xl font-black">Portfolio readiness signals</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              A quick, practical view of whether the agency has enough structure to onboard owners and route work cleanly.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {summary.graph.map((item) => (
                <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`mt-1 h-3 w-3 rounded-full ${signalTone(item.tone)}`} />
                    <Badge tone={item.tone === "red" ? "red" : item.tone === "green" ? "green" : item.tone === "blue" ? "blue" : "amber"}>
                      {item.label}
                    </Badge>
                  </div>
                  <p className="mt-5 text-4xl font-black tracking-tight">
                    {item.value}
                    <span className="text-xl text-[var(--text3)]">%</span>
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{signalCopy(item.label)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-amber-200 bg-[var(--amber-light)] p-4">
              <p className="text-sm font-black">What this means on a walkthrough</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Start with the lowest signal. If owner access is low, set sharing rules. If records are not connected,
                attach the first properties before inviting owners.
              </p>
            </div>
          </Card>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[.35fr_.65fr]">
          <Card>
            <ClipboardCheck className="text-[var(--green)]" />
            <h2 className="mt-4 text-2xl font-black">Setup path</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Keep the first agency onboarding focused. Finish each layer before promising deeper automation.
            </p>
            <div className="mt-5 grid gap-3">
              {summary.setupSteps.map((step) => (
                <div key={step.label} className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${stepTone(step.status)}`}>
                    {step.status === "done" ? <CheckCircle2 size={16} /> : step.status === "next" ? <ArrowRight size={16} /> : <ShieldCheck size={16} />}
                  </span>
                  <div>
                    <p className="text-sm font-black">{step.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text2)]">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Home className="text-[var(--amber2)]" />
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Managed property register</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text2)]">
                  Add the properties the agency wants to organise first. Owner access and future PropertySafe records can
                  attach to these rows.
                </p>
              </div>
              <Badge tone={summary.properties.length ? "green" : "gray"}>{summary.properties.length || "No"} properties</Badge>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
              <AgencyManagedPropertyForm disabled={!summary.agency || !canManage} />
              <PropertyAttentionList properties={summary.properties} />
            </div>
          </Card>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[.52fr_.48fr]">
          <Card>
            <MailCheck className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-2xl font-black">Owner access</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Prepare owner visibility from the agency side. Existing Fixit247 accounts become active access; new owners
              receive a clear email path.
            </p>
            <div className="mt-5">
              <AgencyOwnerInviteForm properties={summary.properties} disabled={!summary.agency || !canManage} />
            </div>
          </Card>

          <Card>
            <Users className="text-[var(--green)]" />
            <h2 className="mt-4 text-2xl font-black">Visibility map</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Owner access should be useful, calm, and controlled. This list shows who can see which property record.
            </p>
            <OwnerAccessList invites={summary.ownerInvites} properties={summary.properties} />
          </Card>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[.46fr_.54fr]">
          <Card variant="dark">
            <KeyRound className="text-[var(--amber)]" />
            <Badge className="mt-4">Business logic</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Agency controlled. Owner visible. Permission based.</h2>
            <p className="mt-4 leading-7 text-white/70">
              PropertySafe should make the agency look organised, not exposed. The owner sees the useful record when the
              agency is ready, while maintenance requests still move through Fixit247.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Controlled access", "Useful history", "Clear next step"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/8 p-3 text-sm font-black text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Wrench className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-2xl font-black">Maintenance rules</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Set the default rules before volume grows. These notes guide urgent contact, owner updates, and Fixer context.
            </p>
            <div className="mt-5">
              <AgencyRulesForm rules={summary.rules} disabled={!summary.agency || !canManage} />
            </div>
          </Card>
        </section>
      </section>
    </main>
  );
}

function PropertyAttentionList({ properties }: { properties: AgencyManagedProperty[] }) {
  if (!properties.length) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <p className="font-black">No properties yet.</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
          Start with one property the agency can recognise immediately in the onboarding call.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {properties.slice(0, 6).map((property) => (
        <div key={property.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-black">{property.label}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text2)]">
                {property.address}, {[property.suburb, property.postcode, property.state].filter(Boolean).join(" ")}
              </p>
            </div>
            <Badge tone={property.risk_status === "urgent" ? "red" : property.risk_status === "clear" ? "green" : "amber"}>
              {labelize(property.risk_status)}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[var(--text3)]">
            <span>{labelize(property.management_status)}</span>
            {property.owner_email ? <span>{property.owner_email}</span> : <span>Owner access not set</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function OwnerAccessList({
  invites,
  properties
}: {
  invites: AgencyOwnerInvite[];
  properties: AgencyManagedProperty[];
}) {
  if (!invites.length) {
    return (
      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <p className="font-black">No owner access yet.</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
          Prepare owner access after the first property is added. Keep access narrow at first.
        </p>
      </div>
    );
  }

  const propertyById = new Map(properties.map((property) => [property.id, property]));

  return (
    <div className="mt-5 grid gap-3">
      {invites.slice(0, 7).map((invite) => {
        const property = invite.managed_property_id ? propertyById.get(invite.managed_property_id) : null;
        return (
          <div key={invite.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-black">{invite.owner_name || invite.owner_email}</p>
                <p className="mt-1 text-sm text-[var(--text2)]">{property?.label ?? "Agency-level access"}</p>
              </div>
              <Badge tone={invite.status === "active" ? "green" : "amber"}>{labelize(invite.status)}</Badge>
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--text3)]">
              {labelize(invite.access_level)} · {invite.owner_email}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function labelize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function signalTone(tone: AgencyDashboardSummary["graph"][number]["tone"]) {
  if (tone === "green") return "bg-[var(--green)]";
  if (tone === "blue") return "bg-[var(--blue)]";
  if (tone === "red") return "bg-[var(--red)]";
  return "bg-[var(--amber)]";
}

function signalCopy(label: string) {
  if (label === "Clear properties") return "active and ready to manage";
  if (label === "Owner access ready") return "owners can be invited or active";
  if (label === "Records connected") return "linked to saved records or PropertySafe";
  if (label === "Needs attention") return "triage before owner rollout";
  return "portfolio setup signal";
}

function stepTone(status: AgencyDashboardSummary["setupSteps"][number]["status"]) {
  if (status === "done") return "bg-[var(--green-light)] text-[var(--green)]";
  if (status === "next") return "bg-[var(--amber-dim)] text-[var(--amber2)]";
  return "bg-[var(--bg2)] text-[var(--text3)]";
}
