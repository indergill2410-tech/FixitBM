import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Home,
  KeyRound,
  LineChart,
  LockKeyhole,
  MailCheck,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench
} from "lucide-react";
import {
  AgencyManagedPropertyForm,
  AgencyOwnerInviteForm,
  AgencyProfileForm,
  AgencyRulesForm
} from "@/components/agency-dashboard-forms";
import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import {
  getAgencyDashboard,
  type AgencyDashboardSummary,
  type AgencyManagedProperty,
  type AgencyOwnerInvite
} from "@/lib/agency";

export const dynamic = "force-dynamic";

export default async function AgencyDashboardPage() {
  const user = await requireRole(["agency", "admin", "super_admin"]);
  const summary = await getAgencyDashboard(user);
  const canManage = summary.memberRole !== "viewer";
  const displayName = summary.agency?.name ?? "PropertySafe agency setup";
  const commandQueue = buildCommandQueue(summary);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title={summary.agency ? displayName : "PropertySafe agency setup"} role="Agency portfolio" />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card variant="dark" className="overflow-hidden p-6 md:p-8">
            <Badge>{summary.stats.operatingMode}</Badge>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_260px] lg:items-end">
              <div>
                <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
                  Fewer follow-ups. Cleaner records. One organised view for every managed property.
                </h2>
                <p className="mt-5 max-w-2xl leading-7 text-white/72">
                  PropertySafe keeps requests moving through Fixit247 while the useful property record stays together:
                  portfolio maintenance notes, compliance-ready Safety Check records, follow-up work, and agency-approved
                  sharing.
                </p>
                <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[var(--amber)]">
                  Built for agency control first, then clear updates when a record is ready to share.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button href={summary.stats.nextActionHref}>
                    {summary.stats.nextActionLabel}
                    <ArrowRight size={17} />
                  </Button>
                  <Button href="/propertysafe/onboarding" variant="light">
                    Book walkthrough
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-black uppercase tracking-wide text-white/50">Setup health</p>
                  <Gauge size={18} className="text-[var(--amber)]" />
                </div>
                <p className="mt-4 text-6xl font-black tracking-tight">{summary.stats.readinessScore}%</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[var(--amber)]"
                    style={{ width: `${summary.stats.readinessScore}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-white/62">
                  The score stays honest: agency details, property records, sharing setup, maintenance preferences, and current attention all
                  matter.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="membership" className="p-6">
            <Sparkles className="text-[var(--amber2)]" />
            <Badge tone="green" className="mt-4">
              Next best action
            </Badge>
            <h2 className="mt-4 text-2xl font-black tracking-tight">{summary.stats.nextActionLabel}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{summary.stats.nextActionDetail}</p>
            <div className="mt-6 grid gap-3">
              <Button href={summary.stats.nextActionHref} className="w-full">
                Do this next
                <ArrowRight size={16} />
              </Button>
              <Button href="/post-job" variant="ghost" className="w-full">
                Start request
              </Button>
            </div>
          </Card>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <AgencyMetric
            icon={Gauge}
            label="Readiness"
            value={`${summary.stats.readinessScore}%`}
            detail={`${summary.stats.setupProgress}% setup path`}
            tone={summary.stats.readinessScore >= 70 ? "green" : summary.stats.readinessScore >= 40 ? "amber" : "gray"}
          />
          <AgencyMetric
            icon={Home}
            label="Properties"
            value={String(summary.stats.propertyCount)}
            detail={`${summary.stats.activeProperties} active records`}
            tone={summary.stats.propertyCount ? "green" : "gray"}
          />
          <AgencyMetric
            icon={LockKeyhole}
            label="Sharing"
            value={String(summary.stats.ownerVisible)}
            detail={`${summary.stats.pendingInvites} pending invites`}
            tone={summary.stats.ownerVisible ? "green" : "gray"}
          />
          <AgencyMetric
            icon={ClipboardCheck}
            label="Review queue"
            value={String(summary.stats.needsReview)}
            detail="Watch and follow-up work"
            tone={summary.stats.needsReview ? "amber" : "green"}
          />
          <AgencyMetric
            icon={ShieldCheck}
            label="Urgent"
            value={String(summary.stats.urgent)}
            detail="Needs fast triage"
            tone={summary.stats.urgent ? "red" : "green"}
          />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[.62fr_.38fr]">
          <Card>
            <ClipboardCheck className="text-[var(--green)]" />
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Guided setup path</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text2)]">
                  One ordered path keeps onboarding calm: agency details, first property, sharing setup, then maintenance
                  preferences.
                </p>
              </div>
              <Badge tone={summary.stats.setupProgress === 100 ? "green" : "amber"}>{summary.stats.setupProgress}% complete</Badge>
            </div>
            <SetupRail steps={summary.setupSteps} />
          </Card>

          <Card>
            <MapPinned className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-2xl font-black tracking-tight">Next actions</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              A short action list for the next agency call. Clear priorities, no scattered tasks.
            </p>
            <div className="mt-5 grid gap-3">
              {commandQueue.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-white hover:shadow-[var(--shadow)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text2)]">{item.detail}</p>
                    </div>
                    <Badge tone={item.tone}>{item.state}</Badge>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[.36fr_.64fr]">
          <Card id="agency-profile">
            <Building2 className="text-[var(--amber2)]" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{summary.agency ? "Agency profile" : "Create agency setup"}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                  This anchors the property list, update preferences, and maintenance preferences.
                </p>
              </div>
              {summary.agency ? (
                <Badge tone={summary.agency.status === "active" ? "green" : "amber"}>{labelize(summary.agency.status)}</Badge>
              ) : null}
            </div>
            <div className="mt-5">
              <AgencyProfileForm agency={summary.agency} />
            </div>
          </Card>

          <Card id="properties">
            <Home className="text-[var(--amber2)]" />
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Managed properties</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text2)]">
                  Start with one recognisable property. Each record can carry request history, compliance-ready check notes,
                  access notes, and next recommended fixes.
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

        <section className="mt-5 grid gap-5 xl:grid-cols-[.48fr_.52fr]">
          <Card id="owner-access">
            <MailCheck className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-2xl font-black tracking-tight">Agency-approved sharing</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Keep this inside the agency process. Prepare narrow sharing only after the property record is clear enough
              to be useful.
            </p>
            <div className="mt-5">
              <AgencyOwnerInviteForm properties={summary.properties} disabled={!summary.agency || !canManage} />
            </div>
          </Card>

          <Card>
            <Users className="text-[var(--green)]" />
            <h2 className="mt-4 text-2xl font-black tracking-tight">Sharing map</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Sharing is deliberate: the agency manages the process, owners see only the right record, and
              Fixers receive better repair context.
            </p>
            <AccessModel />
            <OwnerAccessList invites={summary.ownerInvites} properties={summary.properties} />
          </Card>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[.44fr_.56fr]">
          <Card variant="dark">
            <KeyRound className="text-[var(--amber)]" />
            <Badge className="mt-4">Agency operating logic</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Agency-led first. Shareable later. Useful always.</h2>
            <p className="mt-4 leading-7 text-white/72">
              PropertySafe should make the agency look organised, not exposed. It helps keep rental maintenance history,
              Safety Check notes, compliance-ready evidence, and follow-up work in one place while the agency stays in
              charge of the process.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Triage calmly", "Record clearly", "Share deliberately"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/8 p-3 text-sm font-black text-white/82">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card id="rules">
            <Wrench className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-2xl font-black tracking-tight">Maintenance preferences</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Set the agency defaults before volume grows: urgent contact, after-hours notes, preferred Fixers, and
              update preferences for rental safety and maintenance records.
            </p>
            <div className="mt-5">
              <AgencyRulesForm rules={summary.rules} disabled={!summary.agency || !canManage} />
            </div>
          </Card>
        </section>

        <section className="mt-5">
          <Card>
            <LineChart className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-2xl font-black tracking-tight">Portfolio signals</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              A quiet health view for the portfolio. It shows where the next call should focus without turning the page
              into a heavy analytics screen.
            </p>
            <PortfolioSignals summary={summary} />
          </Card>
        </section>
      </section>
    </main>
  );
}

function AgencyMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone: "green" | "amber" | "red" | "gray";
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${metricTone(tone)}`}>
          <Icon size={18} />
        </div>
        <p className="text-xs font-black uppercase tracking-wide text-[var(--text3)]">{label}</p>
      </div>
      <p className="mt-5 text-4xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--text2)]">{detail}</p>
    </div>
  );
}

function SetupRail({ steps }: { steps: AgencyDashboardSummary["setupSteps"] }) {
  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-4">
      {steps.map((step, index) => (
        <a
          key={step.label}
          href={stepHref(step.label)}
          className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-white hover:shadow-[var(--shadow)]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${stepTone(step.status)}`}>
              {step.status === "done" ? <CheckCircle2 size={17} /> : index + 1}
            </span>
            <Badge tone={step.status === "done" ? "green" : step.status === "next" ? "amber" : "gray"}>
              {step.status === "done" ? "Ready" : step.status === "next" ? "Next" : "Later"}
            </Badge>
          </div>
          <p className="mt-4 font-black">{step.label}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{step.detail}</p>
        </a>
      ))}
    </div>
  );
}

function PortfolioSignals({ summary }: { summary: AgencyDashboardSummary }) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summary.graph.map((item) => (
        <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="font-black">{item.label}</p>
            <Badge tone={item.tone === "red" ? "red" : item.tone === "green" ? "green" : item.tone === "blue" ? "blue" : "amber"}>
              {item.value}%
            </Badge>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className={`h-full rounded-full ${signalTone(item.tone)}`} style={{ width: `${item.value}%` }} />
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{signalCopy(item.label)}</p>
        </div>
      ))}
    </div>
  );
}

function AccessModel() {
  const items = [
    ["Agency", "Manages the process, preferences, property records, and sharing timing."],
    ["Owner", "Receives the useful property record when sharing is prepared."],
    ["Fixer", "Gets location, context, priority, and notes before quoting or attending."]
  ];

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      {items.map(([title, detail]) => (
        <div key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <p className="font-black">{title}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--text2)]">{detail}</p>
        </div>
      ))}
    </div>
  );
}

function PropertyAttentionList({ properties }: { properties: AgencyManagedProperty[] }) {
  if (!properties.length) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
        <p className="font-black">No properties yet.</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
          Add one real property first. The first record makes the rollout feel concrete immediately.
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
            {property.owner_email ? <span>{property.owner_email}</span> : <span>Owner sharing not prepared</span>}
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
      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
        <p className="font-black">No owner sharing prepared.</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
          Keep access closed until a property record is useful enough to share.
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
              {labelize(invite.access_level)} - {invite.owner_email}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function buildCommandQueue(summary: AgencyDashboardSummary) {
  const items = [
    {
      title: summary.stats.nextActionLabel,
      detail: summary.stats.nextActionDetail,
      href: summary.stats.nextActionHref,
      state: "Priority",
      tone: "amber" as const
    },
    {
      title: "Keep the first rollout small",
      detail: summary.stats.propertyCount
        ? "Use the first records to prove the maintenance path before expanding access."
        : "One recognisable property is enough for tomorrow's agency walkthrough.",
      href: "#properties",
      state: "Calm path",
      tone: "green" as const
    },
    {
      title: "Protect the compliance story",
      detail: "Use PropertySafe to organise Safety Check notes, repair history, and follow-up evidence. It supports records, not legal overclaims.",
      href: "#rules",
      state: "Evidence",
      tone: "blue" as const
    }
  ];

  return items;
}

function labelize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function metricTone(tone: "green" | "amber" | "red" | "gray") {
  if (tone === "green") return "bg-[var(--green-light)] text-[var(--green)]";
  if (tone === "red") return "bg-[var(--red-light)] text-[var(--red)]";
  if (tone === "amber") return "bg-[var(--amber-dim)] text-[var(--amber2)]";
  return "bg-[var(--bg2)] text-[var(--text3)]";
}

function signalTone(tone: AgencyDashboardSummary["graph"][number]["tone"]) {
  if (tone === "green") return "bg-[var(--green)]";
  if (tone === "blue") return "bg-[var(--blue)]";
  if (tone === "red") return "bg-[var(--red)]";
  return "bg-[var(--amber)]";
}

function signalCopy(label: string) {
  if (label === "Clear properties") return "active and ready to manage";
  if (label === "Sharing ready") return "sharing setup is prepared";
  if (label === "Records connected") return "linked to saved records or PropertySafe";
  if (label === "Needs attention") return "triage before broader rollout";
  return "portfolio setup signal";
}

function stepTone(status: AgencyDashboardSummary["setupSteps"][number]["status"]) {
  if (status === "done") return "bg-[var(--green-light)] text-[var(--green)]";
  if (status === "next") return "bg-[var(--amber-dim)] text-[var(--amber2)]";
  return "bg-white text-[var(--text3)]";
}

function stepHref(label: string) {
  if (label === "Agency profile") return "#agency-profile";
  if (label === "Managed properties") return "#properties";
  if (label === "Sharing setup") return "#owner-access";
  if (label === "Maintenance preferences") return "#rules";
  return "#agency-profile";
}
