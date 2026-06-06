import { PublicHeader } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <article className="container max-w-3xl py-14">
        <h1 className="text-4xl font-black tracking-tight">Privacy</h1>
        <div className="mt-6 grid gap-6 leading-8 text-[var(--text2)]">
          <section>
            <h2 className="text-xl font-black text-[var(--text)]">Information we collect</h2>
            <p className="mt-2">
              Fixit247 collects the details needed to run urgent and scheduled service workflows. This can include names,
              phone numbers, email addresses, request descriptions, location notes, photos, saved properties, saved vehicles,
              support messages, membership records, Fixer business profiles, and verification documents.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[var(--text)]">How it is used</h2>
            <p className="mt-2">
              We use this information to create requests, match or assign Fixers, support request communication, review lead
              quality, process credits, manage disputes, improve safety, and maintain customer and Fixer accounts.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[var(--text)]">Sharing</h2>
            <p className="mt-2">
              Relevant request and contact details may be shared with Fixers, support staff, payment providers, infrastructure
              providers, and verification partners where needed to operate the service. Private request photos and verification
              files are stored in restricted storage.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[var(--text)]">Control and support</h2>
            <p className="mt-2">
              Customers and Fixers can request help with account information, request history, support records, and verification
              material through Fixit247 support.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
