"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Home, Loader2, MapPin, Phone, ShieldAlert, Upload } from "lucide-react";
import { Badge, Button, Card, PublicHeader } from "@/components/ui";
import { homeCategories, roadsideCategories } from "@/lib/data";

type FormState = {
  type: "home" | "road" | "scheduled";
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
  consent: boolean;
};

const initialState: FormState = {
  type: "home",
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
  consent: false
};

export default function PostJobPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [photos, setPhotos] = useState<File[]>([]);
  const [result, setResult] = useState<{ ok: boolean; reference?: string; message: string; dashboardUrl?: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => (form.type === "road" ? roadsideCategories : homeCategories), [form.type]);
  const steps = ["Type", "Category", "Problem", "Location", "Contact", "Review"];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
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
    setResult({
      ok: response.ok,
      reference: data.reference,
      dashboardUrl: data.dashboardUrl,
      message: response.ok
        ? "Your request has been received."
        : data.error ?? "The request could not be saved yet."
    });
    setLoading(false);
  }

  function updatePhotos(files: FileList | null) {
    setPhotos(Array.from(files ?? []).slice(0, 6));
  }

  return (
    <main className="premium-shell min-h-screen pb-10">
      <PublicHeader />
      <section className="container py-8">
        <Badge>Guest-first emergency flow</Badge>
        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">Get help without creating an account first.</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[.72fr_.28fr]">
          <Card>
            <div className="mb-7 grid grid-cols-3 gap-2 md:grid-cols-6">
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
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ["home", "Home emergency", "Leaks, lockouts, urgent repairs", Home],
                  ["road", "Roadside emergency", "Flat tyre, battery, towing", MapPin],
                  ["scheduled", "Normal scheduled job", "Book non-urgent work", CheckCircle2]
                ].map(([value, title, copy, Icon]) => (
                  <button
                    key={String(value)}
                    onClick={() => update("type", value as FormState["type"])}
                    className={`focus-ring rounded-2xl border p-5 text-left shadow-[var(--shadow)] transition ${
                      form.type === value ? "border-amber-300 bg-[var(--amber-light)]" : "border-[var(--border)] bg-white"
                    }`}
                  >
                    <Icon className="text-[var(--amber2)]" />
                    <h2 className="mt-4 font-black">{String(title)}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{String(copy)}</p>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {categories.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => update("category", label)}
                    className={`focus-ring min-h-28 rounded-2xl border p-4 text-left shadow-[var(--shadow)] ${
                      form.category === label ? "border-amber-300 bg-[var(--amber-light)]" : "border-[var(--border)] bg-white"
                    }`}
                  >
                    <Icon size={21} className="text-[var(--amber2)]" />
                    <p className="mt-5 text-sm font-black">{label}</p>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4">
                <Input label="What happened?" value={form.title} onChange={(value) => update("title", value)} placeholder="Burst pipe under kitchen sink" />
                <TextArea label="Describe the problem" value={form.description} onChange={(value) => update("description", value)} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Select label="Is anyone in immediate danger?" value={form.danger} onChange={(value) => update("danger", value)} options={["No immediate danger", "Someone may be at risk", "Emergency services may be needed"]} />
                  <Select label="Water, electricity, or gas involved?" value={form.utilities} onChange={(value) => update("utilities", value)} options={["Not sure", "Water", "Electricity", "Gas", "Multiple"]} />
                </div>
                <div className="rounded-2xl border border-dashed border-[var(--border2)] bg-[var(--bg)] p-5 text-sm text-[var(--text2)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--amber-dim)] text-[var(--amber2)]">
                      <Upload size={18} />
                    </span>
                    <div>
                      <p className="font-bold text-[var(--text)]">Add job photos</p>
                      <p className="mt-1">Upload up to 6 JPG, PNG, or WebP images.</p>
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

            {step === 3 && (
              <div className="grid gap-4">
                {form.type === "road" ? (
                  <>
                    <Input label="Road name" value={form.roadName} onChange={(value) => update("roadName", value)} />
                    <Input label="Nearest suburb" value={form.suburb} onChange={(value) => update("suburb", value)} />
                    <Input label="Direction or side of road" value={form.roadDirection} onChange={(value) => update("roadDirection", value)} />
                    <Input label="Landmark" value={form.landmark} onChange={(value) => update("landmark", value)} />
                  </>
                ) : (
                  <>
                    <Input label="Address" value={form.address} onChange={(value) => update("address", value)} />
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input label="Suburb" value={form.suburb} onChange={(value) => update("suburb", value)} />
                      <Input label="Postcode" value={form.postcode} onChange={(value) => update("postcode", value)} />
                      <Input label="State" value={form.state} onChange={(value) => update("state", value)} />
                    </div>
                  </>
                )}
                <p className="rounded-2xl border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--text2)]">
                  Add the clearest address or road details you can. For roadside jobs, landmarks and direction help tradies
                  find you faster.
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-4">
                <Input label="First name" value={form.firstName} onChange={(value) => update("firstName", value)} />
                <Input label="Phone number required" value={form.phone} onChange={(value) => update("phone", value)} />
                <Input label="Email optional" value={form.email} onChange={(value) => update("email", value)} />
                <Select label="Preferred contact method" value={form.contact} onChange={(value) => update("contact", value as FormState["contact"])} options={["call", "sms", "in_app"]} />
                <label className="flex gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--text2)]">
                  <input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} />
                  I agree Fixit247 can contact me about this request.
                </label>
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-4">
                <Review label="Type" value={form.type} />
                <Review label="Category" value={form.category} />
                <Review label="Problem" value={form.title || "Not provided"} />
                <Review label="Location" value={form.type === "road" ? `${form.roadName || "Road"}, ${form.suburb}` : `${form.address}, ${form.suburb}`} />
                <Review label="Contact" value={`${form.firstName} · ${form.phone}`} />
                <Review label="Photos" value={photos.length ? `${photos.length} attached` : "None attached"} />
                <Button onClick={submit} className="w-full" variant={form.consent && form.phone ? "primary" : "ghost"} disabled={!form.consent || !form.phone || loading}>
                  {loading ? <Loader2 className="animate-spin" size={17} /> : null}
                  Submit request
                </Button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} className={step === 0 ? "invisible" : ""}>
                <ArrowLeft size={16} />
                Back
              </Button>
              {step < 5 ? (
                <Button onClick={() => setStep(Math.min(5, step + 1))}>
                  Continue
                  <ArrowRight size={16} />
                </Button>
              ) : null}
            </div>
          </Card>

          <aside className="grid gap-4">
            <Card variant="emergency">
              <ShieldAlert className="text-[var(--amber2)]" />
              <h2 className="mt-4 font-black">Expected next step</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Your request is received first. Account creation, OTP claim, tracking, and Fixit Plus upsell happen after submission.
              </p>
            </Card>
            <Card>
              <Phone className="text-[var(--green)]" />
              <h2 className="mt-4 font-black">Configured status</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Guest job database saving activates when Supabase server keys are added.
              </p>
            </Card>
            {result ? (
              <Card variant={result.ok ? "membership" : "emergency"}>
                <h2 className="font-black">{result.message}</h2>
                {result.reference ? <p className="mt-2 text-sm text-[var(--text2)]">Reference: {result.reference}</p> : null}
                <div className="mt-4 grid gap-2">
                  {result.dashboardUrl ? (
                    <Button href={result.dashboardUrl} variant="ghost">Track this job</Button>
                  ) : (
                    <Button href="/login" variant="ghost">Create account with OTP</Button>
                  )}
                  <Button href="/fixit-plus" variant="ghost">Join Fixit Plus</Button>
                </div>
              </Card>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <input className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
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

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
