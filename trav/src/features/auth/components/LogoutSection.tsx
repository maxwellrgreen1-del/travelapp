"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { useAuthSession } from "@/features/auth/AuthSessionProvider";
import { cx } from "@/lib/utils";

type LogoutSectionProps = {
  /** Show full-width primary button vs muted inline link styling. */
  variant?: "settings" | "profile";
  className?: string;
};

export function LogoutSection({ variant = "settings", className }: LogoutSectionProps) {
  const { signOut, user } = useAuthSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!user) {
    return null;
  }

  async function onLogout() {
    setBusy(true);
    try {
      await signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (variant === "profile") {
    return (
      <div className={cx("px-1 pb-6 pt-2", className)}>
        <button
          type="button"
          onClick={() => void onLogout()}
          disabled={busy}
          className="text-sm font-semibold text-neutral-500 underline-offset-4 outline-none hover:text-red-600 hover:underline focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-primary/35 disabled:opacity-50"
        >
          {busy ? "Signing out…" : "Log out"}
        </button>
      </div>
    );
  }

  return (
    <div className={cx("space-y-2", className)}>
      <Button type="button" variant="outlinePrimary" fullWidth disabled={busy} onClick={() => void onLogout()}>
        {busy ? "Signing out…" : "Log out"}
      </Button>
      <p className="text-center text-xs text-neutral-500">Ends this device session — come back anytime.</p>
    </div>
  );
}
