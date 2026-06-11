"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="premium-shell flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-[var(--shadow-lg)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--amber-dim)] text-[var(--amber2)]">
          <AlertTriangle size={22} />
        </span>
        <h1 className="mt-4 text-2xl font-black tracking-tight">Something went wrong.</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
          That page hit a problem. Your data is safe — try again, or head back to the homepage.
        </p>
        <div className="mt-5 grid gap-2">
          <button
            onClick={reset}
            className="app-button app-button-primary focus-ring inline-flex min-h-11 items-center justify-center rounded-[10px] px-5 text-sm font-black"
          >
            Try again
          </button>
          <Link
            href="/"
            className="app-button app-button-ghost focus-ring inline-flex min-h-11 items-center justify-center rounded-[10px] px-5 text-sm font-black"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
