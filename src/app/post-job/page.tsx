"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Home, Loader2, MapPin, Phone, ShieldAlert, ShieldCheck, Upload } from "lucide-react";
import { Badge, Button, Card, PublicHeader } from "@/components/ui";
import { track } from "@/lib/analytics-client";
import { homeCategories, projectCategories, requestLanes, roadsideCategories, tradeCategories, type RequestLane } from "@/lib/data";

type FormState = {
  type: "home" | "road" | "scheduled";
  serviceLane: RequestLane;
  category: string;
  title: string;
  description: string;
  danger: string;
  utilities: string;
  address: string;
  suburb: string;
  postcode: string;
  state: string;
  roadName: string;
  roadDirection: string;
  landmark: string;
  firstName: string;
  phone: string;
  email: string;
  contact: "call" | "sms" | "in_app";
  timing: string;
  budgetRange: string;
  consent: boolean;
};

const initialState: FormState = {
  type: "home",
  serviceLane: "emergency_home",
  category: "Plumbing",
  title: "",
  description: "",
  danger: "No immediate danger",
  utilities: "Not sure",
  address: "",
  suburb: "",
  postcode: "",
  state: "NSW",
  roadName: "",
  roadDirection: "",
  landmark: "",
  firstName: "",
  phone: "",
  email: "",
  contact: "call",
  timing: "Now",
  budgetRange: "Not sure yet",
  consent: false
};

// Four steps. Every extra step is a drop-off point — emergencies need speed.
const steps = ["What's wrong", "Details", "Location & timing", "Contact"];

const laneValues = new Set<string>(["emergency_home", "emergency_road", "standard_trade_job", "larger_project"]);

function categoriesForLane(value: RequestLane) {
  if (value === "emergency_road") return roadsideCategories;
  if (value === "standard_trade_job") return tradeCategories;
  if (value === "larger_project") return projectCategories;
  return homeCategories;
}

// Pure: applies a lane choice to a form. Used both for the live lane buttons
// and to seed the initial form from a ?lane= deep link.
function applyLane(current: FormState, value: RequestLane): FormState {
  const nextLane = requestLanes.find((item) => item.value === value) ?? requestLanes[0];
  return {
    ...current,
    serviceLane: value,
    type: nextLane.requestType,
    category: categoriesForLane(value)[0]?.label ?? current.category,
    timing: value === "emergency_home" || value === "emergency_road" ? "Now" : value === "larger_project" ? "Need quote first" : "This week"
  };
}

// useSearchParams requires a Suspense boundary during prerender.
export default function PostJobPage() {
  return (
    <Suspense fallback={null}>
      <PostJobWizard />
    </Suspense>
  );
}

function PostJobWizard() {
  const searchParams = useSearchParams();

  // Hero triage lanes deep-link here with ?lane=; seed the form from it on
  // first render so the visitor lands with their situation already selected
  // (no effect, no flash of the default lane).
  const laneParam = searchParams.get("lane");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() =>
    laneParam && laneValues.has(laneParam) ? applyLane(initialState, laneParam as RequestLane) : initialState
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [result, setResult] = useState<{ ok: boolean; reference?: string; message: string; dashboardUrl?: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function chooseLane(value: RequestLane) {
    setForm((current) => applyLane(current, value));
  }

  const lane = requestLanes.find((item) => item.value === form.serviceLane) ?? requestLanes[0];
  const isRoad = form.serviceLane === "emergency_road";
  const isQuoteLane = form.serviceLane === "standard_trade_job" || form.serviceLane === "larger_project";
  const categories = useMemo(() => categoriesForLane(form.serviceLane), [form.serviceLane]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validateStep(current: number): string | null {
    if (current === 1 && !form.title.trim()) {
      return "Add a short line about what happened so the right Fixer can respond.";
    }
    if (current === 2) {
      if (isRoad && (!form.roadName.trim() || !form.suburb.trim())) {
        return "Add the road name and nearest suburb so help can find you.";
      }
      if (!isRoad && (!form.address.trim() || !form.suburb.trim())) {
        return "Add the address and suburb so help can find you.";
      }
    }
    return null;
  }

  function goNext() {
    const error = validateStep(step);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    const next = Math.min(steps.length - 1, step + 1);
    setStep(next);
    track("wizard_step", { step: next, lane: form.serviceLane });
    window.scrollTo({ top: 0 });
  }

  function goBack() {
    setStepError(null);
    setStep(Math.max(0, step - 1));
  }

  async function submit() {
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.set("request", JSON.stringify(form));
    photos.forEach((photo) => formData.append("photos", photo));

    const response = await fetch("/api/jobs", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    track("wizard_submit", { lane: form.serviceLane, ok: response.ok });
    setResult({
      ok: response.ok,
      reference: data.reference,
      dashboardUrl: data.dashboardUrl,
      message: response.ok
        ? "Your request has been received."
        : data.error ?? "The request could not be saved yet."
    });
    setLoading(false);
    window.scrollTo({ top: 0 });
  }

  function updatePhotos(files: FileList | null) {
    setPhotos(Array.from(files ?? []).slice(0, 6));
  }

  // Success replaces the form — on mobile the old sidebar success was below
  // the fold and easy to miss entirely.
  if (result?.ok) {
    return (
      <main className="premium-shell min-h-screen pb-10">
        <PublicHeader />
        <section className="container max-w-2xl py-12">
          <Card variant="membership">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--green-light)] text-[var(--green)]">
              <CheckCircle2 size={28} />
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight">Your request is in.</h1>
            <p className="mt-3 leading-7 text-[var(--text2)]">
              We are preparing it for the right local Fixers now. Keep your phone nearby —{" "}
              {form.contact === "call" ? "you asked to be called" : form.contact === "sms" ? "you asked for SMS updates" : "updates arrive in your account"}.
            </p>
            {result.reference ? (
              <p className="mt-4 rounded-2xl bg-[var(--bg)] p-4 text-sm font-bold">
                Reference: <span className="text-[var(--amber2)]">{result.reference}</span>
              </p>
            ) : null}
            <div className="mt-6 grid gap-2">
              {result.dashboardUrl ? (
                <Button href={result.dashboardUrl}>Track this request</Button>
              ) : (
                <Button href="/login">Create a free account to track it</Button>
              )}
              <Button href="/fixit-peace" variant="ghost">
                Protect your home with Fixit Peace
              </Button>
            </div>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-shell min-h-screen pb-10">
      <PublicHeader />
      <section className="container py-8">
        <Badge>Free to post · No account needed</Badge>
        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">Tell us what happened. We will prepare the right request.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text2)]">
          Four quick steps. Verified Fixers see the details once you submit.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[.72fr_.28fr]">
          <Card>
            <div className="mb-6 grid grid-cols-4 gap-2">
              {steps.map((label, index) => (
                <div key={label} className="min-w-0">
                  <div className={`h-1.5 rounded-full ${index <= step ? "bg-[var(--amber)]" : "bg-[var(--bg2)]"}`} />
                  <p className={`mt-2 truncate text-xs font-bold ${index === step ? "text-[var(--amber2)]" : "text-[var(--text3)]"}`}>
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="grid gap-5">
                <div className="grid gap-3 md:grid-cols-2">
                  {requestLanes.map(({ value, title, copy }) => {
                    const Icon = value === "emergency_road" ? MapPin : value === "standard_trade_job" ? CheckCircle2 : Home;
                    return (
                      <button
                        key={String(value)}
                        onClick={() => chooseLane(value)}
                        className={`focus-ring rounded-2xl border p-4 text-left shadow-[var(--shadow)] transition ${
                          form.serviceLane === value ? "border-amber-300 bg-[var(--amber-light)]" : "border-[var(--border)] bg-white"
                        }`}
                      >
                        <Icon className="text-[var(--amber2)]" size={20} />
                        <h2 className="mt-3 font-black">{String(title)}</h2>
                        <p className="mt-1 text-sm leading-6 text-[var(--text2)]">{String(copy)}</p>
                      </button>
                    );
                  })}
                </div>
                <div>
                  <p className="text-sm font-black">Pick the closest category</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                    {categories.map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() => update("category", label)}
                        className={`focus-ring flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2 text-left shadow-[var(--shadow)] ${
                          form.category === label ? "border-amber-300 bg-[var(--amber-light)]" : "border-[var(--border)] bg-white"
                        }`}
                      >
                        <Icon size={18} className="shrink-0 text-[var(--amber2)]" />
                        <span className="text-sm font-bold">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4">
                <Input
                  label={form.serviceLane === "larger_project" ? "What do you want done?" : form.serviceLane === "standard_trade_job" ? "What needs fixing or improving?" : "What happened?"}
                  value={form.title}
                  onChange={(value) => update("title", value)}
                  placeholder="Burst pipe under kitchen sink"
                />
                <TextArea
                  label={
                    form.serviceLane === "larger_project"
                      ? "Describe the project"
                      : form.serviceLane === "standard_trade_job"
                        ? "Describe the trade request"
                        : "Describe the problem"
                  }
                  value={form.description}
                  onChange={(value) => update("description", value)}
                />
                {form.serviceLane === "emergency_home" || form.serviceLane === "emergency_road" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Select label="Is anyone in immediate danger?" value={form.danger} onChange={(value) => update("danger", value)} options={["No immediate danger", "Someone may be at risk", "Emergency services may be needed"]} />
                    <Select label="Water, electricity, gas, or vehicle safety involved?" value={form.utilities} onChange={(value) => update("utilities", value)} options={["Not sure", "Water", "Electricity", "Gas", "Vehicle safety", "Multiple"]} />
                  </div>
                ) : null}
                <div className="rounded-2xl border border-dashed border-[var(--border2)] bg-[var(--bg)] p-5 text-sm text-[var(--text2)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--amber-dim)] text-[var(--amber2)]">
                      <Upload size={18} />
                    </span>
                    <div>
                      <p className="font-bold text-[var(--text)]">Add photos (optional)</p>
                      <p className="mt-1">Requests with photos get clearer responses, faster.</p>
                    </div>
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="mt-4 w-full rounded-xl border border-[var(--border)] bg-white p-3"
                    onChange={(event) => updatePhotos(event.target.files)}
                  />
                  {photos.length ? (
                    <div className="mt-3 grid gap-2">
                      {photos.map((photo) => (
                        <div key={`${photo.name}-${photo.size}`} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[var(--text2)]">
                          {photo.name}
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        className="min-h-9 px-3"
                        onClick={() => {
                          setPhotos([]);
                          if (photoInputRef.current) photoInputRef.current.value = "";
                        }}
                      >
                        Clear photos
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4">
                {isRoad ? (
                  <>
                    <Input label="Road name" value={form.roadName} onChange={(value) => update("roadName", value)} />
                    <Input label="Nearest suburb" value={form.suburb} onChange={(value) => update("suburb", value)} autoComplete="address-level2" />
                    <Input label="Direction or side of road (optional)" value={form.roadDirection} onChange={(value) => update("roadDirection", value)} />
                    <Input label="Landmark (optional)" value={form.landmark} onChange={(value) => update("landmark", value)} />
                  </>
                ) : (
                  <>
                    <Input label="Address" value={form.address} onChange={(value) => update("address", value)} autoComplete="street-address" />
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input label="Suburb" value={form.suburb} onChange={(value) => update("suburb", value)} autoComplete="address-level2" />
                      <Input label="Postcode" value={form.postcode} onChange={(value) => update("postcode", value)} inputMode="numeric" autoComplete="postal-code" />
                      <Input label="State" value={form.state} onChange={(value) => update("state", value)} autoComplete="address-level1" />
                    </div>
                  </>
                )}
                <Select
                  label="When do you need help?"
                  value={form.timing}
                  onChange={(value) => update("timing", value)}
                  options={
                    form.serviceLane === "larger_project"
                      ? ["Ready to start", "Need quote first", "Planning stage", "Flexible"]
                      : form.serviceLane === "standard_trade_job"
                        ? ["Today", "This week", "Next week", "Flexible"]
                        : ["Now", "Today"]
                  }
                />
                {isQuoteLane ? (
                  <Select
                    label="Budget range"
                    value={form.budgetRange}
                    onChange={(value) => update("budgetRange", value)}
                    options={["Not sure yet", "Under $500", "$500-$2,000", "$2,000-$5,000", "$5,000-$15,000", "$15,000-$50,000", "$50,000+"]}
                  />
                ) : null}
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4">
                <Input label="First name" value={form.firstName} onChange={(value) => update("firstName", value)} autoComplete="given-name" />
                <Input label="Phone number" value={form.phone} onChange={(value) => update("phone", value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="04xx xxx xxx" />
                <Input label="Email (optional)" value={form.email} onChange={(value) => update("email", value)} type="email" autoComplete="email" />
                <Select label="Preferred contact method" value={form.contact} onChange={(value) => update("contact", value as FormState["contact"])} options={["call", "sms", "in_app"]} />
                <label className="flex gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--text2)]">
                  <input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} className="mt-0.5 h-4 w-4" />
                  I agree Fixit247 can contact me about this request.
                </label>
                <div className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">Your request</p>
                  <p className="font-bold">{lane.title} · {form.category}</p>
                  <p className="text-[var(--text2)]">{form.title || "—"}</p>
                  <p className="text-[var(--text2)]">
                    {isRoad ? `${form.roadName}, ${form.suburb}` : `${form.address}, ${form.suburb}`} · {form.timing}
                    {photos.length ? ` · ${photos.length} photo${photos.length > 1 ? "s" : ""}` : ""}
                  </p>
                </div>
                {result && !result.ok ? (
                  <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-[var(--red)]">{result.message}</p>
                ) : null}
                <Button onClick={submit} className="w-full" disabled={!form.consent || !form.phone.trim() || loading}>
                  {loading ? <Loader2 className="animate-spin" size={17} /> : null}
                  {form.serviceLane === "larger_project" ? "Get project quotes — free" : form.serviceLane === "standard_trade_job" ? "Start my trade request — free" : "Start my emergency request — free"}
                </Button>
                {!form.phone.trim() || !form.consent ? (
                  <p className="text-center text-xs text-[var(--text3)]">Add a phone number and tick consent to submit.</p>
                ) : null}
              </div>
            )}

            {stepError ? (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-[var(--red)]">{stepError}</p>
            ) : null}

            {step < 3 ? (
              <div className="safe-bottom sticky bottom-0 -mx-5 mt-6 flex items-center justify-between gap-3 border-t border-[var(--border)] bg-white px-5 pt-3">
                <Button variant="ghost" onClick={goBack} className={step === 0 ? "invisible" : ""}>
                  <ArrowLeft size={16} />
                  Back
                </Button>
                <span className="hidden text-xs font-bold text-[var(--text3)] sm:block">Free · Takes about a minute</span>
                <Button onClick={goNext}>
                  Continue
                  <ArrowRight size={16} />
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex items-center justify-start">
                <Button variant="ghost" onClick={goBack}>
                  <ArrowLeft size={16} />
                  Back
                </Button>
              </div>
            )}
          </Card>

          <aside className="hidden gap-4 lg:grid">
            <Card variant="emergency">
              <ShieldAlert className="text-[var(--amber2)]" />
              <h2 className="mt-4 font-black">No account needed to start</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Send the request first. After submission, you can create an account to track updates, messages, photos, and your reference number.
              </p>
            </Card>
            <Card>
              <ShieldCheck className="text-[var(--green)]" />
              <h2 className="mt-4 font-black">Verified Fixers</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Requests go to verified Fixers and service providers prepared for urgent work — with the context they need before calling.
              </p>
            </Card>
            <Card>
              <Phone className="text-[var(--green)]" />
              <h2 className="mt-4 font-black">Built for urgent moments</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                We capture the right details up front so the next person helping can understand the situation before calling or accepting the request.
              </p>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  autoComplete
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric" | "email";
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <input
        className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4"
        value={value}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <textarea className="focus-ring min-h-32 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <select className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
