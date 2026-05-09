"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEventHandler, FormEventHandler } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { trimmedLength, validateEmailFormat } from "@/features/auth/authValidation";
import { AuthBrandHeader } from "@/features/auth/components/AuthBrandHeader";
import { AuthOAuthRow } from "@/features/auth/components/AuthOAuthRow";

type FieldErrors = Partial<Record<"email" | "password", string>>;

async function pretendAuthDelay(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 520);
  });
}

export function LoginExperience() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [forgotCue, setForgotCue] = useState<string | null>(null);

  const clearEmailError = () => {
    setFieldErrors((prev) => {
      if (!prev.email) return prev;
      const rest = { ...prev };
      delete rest.email;
      return rest;
    });
    setForgotCue(null);
  };

  const clearPasswordError = () => {
    setFieldErrors((prev) => {
      if (!prev.password) return prev;
      const rest = { ...prev };
      delete rest.password;
      return rest;
    });
  };

  const onEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setEmail(event.target.value);
    clearEmailError();
  };

  const onPasswordChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setPassword(event.target.value);
    clearPasswordError();
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors: FieldErrors = {};

    if (trimmedLength(email) === 0) {
      nextErrors.email = "Trail mail can’t wander without an address.";
    }
    const emailTone = validateEmailFormat(email);
    if (emailTone && !nextErrors.email) {
      nextErrors.email = emailTone;
    }

    if (password.length === 0) {
      nextErrors.password = "Password field is barefoot — tuck something in.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    async function finalize() {
      setBusy(true);
      try {
        await pretendAuthDelay();
        router.replace("/");
      } finally {
        setBusy(false);
      }
    }

    void finalize();
  };

  return (
    <div className="flex min-h-[100svh] w-full flex-col bg-gradient-to-b from-[#e8f4e8] via-white to-[#f4fcf1] pb-[max(32px,calc(env(safe-area-inset-bottom)+24px))] pt-6">
      <AuthBrandHeader
        eyebrow="Trav access"
        title="Welcome back, wanderer"
        subtitle="Passport desk is mocking travel lanes for now — no Supabase voyages fired, just polished rails to rehearse rituals."
        className="pb-10"
      />

      <Card
        tone="muted"
        padding="lg"
        className="mx-auto w-full max-w-md flex-1 space-y-10 rounded-[32px] border border-white/90 bg-white/96 px-6 pb-10 pt-9 shadow-[0_40px_90px_-50px_rgba(18,62,41,0.55)] backdrop-blur"
      >
        <form noValidate className="space-y-7" onSubmit={onSubmit}>
          <fieldset className="space-y-[18px]" disabled={busy}>
            <legend className="sr-only">Log in using email password</legend>
            <Input
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              placeholder="trailhead@ocean.run"
              value={email}
              onChange={onEmailChange}
              error={fieldErrors.email ?? undefined}
            />
            <div className="space-y-[10px]">
              <Input
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="············"
                value={password}
                onChange={onPasswordChange}
                error={fieldErrors.password ?? undefined}
              />

              <div className="flex justify-end px-px">
                <button
                  type="button"
                  className="text-[13px] font-semibold text-primary underline-offset-4 outline-none ring-primary/30 hover:underline focus-visible:rounded-md focus-visible:ring-4"
                  onClick={() =>
                    setForgotCue(
                      "Password sails home once Trav spins secure mail rails — tuck this wishlist cue for launch week.",
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>
              {forgotCue ? (
                <p role="status" className="text-[13px] leading-relaxed text-neutral-600">
                  {forgotCue}
                </p>
              ) : null}
            </div>
          </fieldset>

          <div className="space-y-[18px]">
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy}>
              {busy ? "Plotting your coordinates…" : "Log into Trav"}
            </Button>
          </div>
        </form>

        <AuthOAuthRow contextLabel="or slip in with SSO" />

        <p className="text-center text-sm text-neutral-600">
          New here? Join the scouting party —{" "}
          <Link
            href="/signup"
            prefetch={false}
            className="font-semibold text-primary underline-offset-[5px] outline-none hover:underline focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-primary/35"
          >
            Sign up free
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
