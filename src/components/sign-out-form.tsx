"use client";

import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";

export function SignOutForm() {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="mt-2 rounded-xl border border-[var(--red)]/20 bg-[var(--red-light)] p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 text-[var(--red)]" size={16} />
          <div>
            <p className="text-sm font-black text-[var(--red)]">Sign out of this account?</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[var(--text2)]">
              Your dashboard session will close and private pages will need sign in again.
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-black text-[var(--text)] hover:bg-white/80"
          >
            Stay signed in
          </button>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--red)] px-3 py-2 text-xs font-black text-white"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[var(--red)] hover:bg-[var(--red-light)]"
    >
      <LogOut size={16} />
      Sign out
    </button>
  );
}
