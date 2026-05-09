"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEventHandler, FormEventHandler } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  trimmedLength,
  validateDisplayName,
  validateEmailFormat,
  validatePasswordStrength,
  validateTrailUsername,
} from "@/features/auth/authValidation";
import { AuthBrandHeader } from "@/features/auth/components/AuthBrandHeader";
import { AuthOAuthRow } from "@/features/auth/components/AuthOAuthRow";

type FieldErrors = Partial<Record<"name" | "username" | "email" | "password" | "confirmPassword", string>>;

async function pretendSignupDelay(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 520);
  });
}

export function SignupExperience() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  const pruneError = <K extends keyof FieldErrors>(key: K) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const draft = { ...prev };
      delete draft[key];
      return draft;
    });
  };

  const onNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value);
    pruneError("name");
  };

  const onUsernameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setUsername(event.target.value);
    pruneError("username");
  };

  const onEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setEmail(event.target.value);
    pruneError("email");
  };

  const onPasswordChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setPassword(event.target.value);
    pruneError("password");
    pruneError("confirmPassword");
  };

  const onConfirmChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setConfirmPassword(event.target.value);
    pruneError("confirmPassword");
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors: FieldErrors = {};

    if (trimmedLength(name) === 0) {
      nextErrors.name = "Lay down the name you stamp on postcards.";
    }
    const nameCue = validateDisplayName(name);
    if (nameCue && !nextErrors.name) {
      nextErrors.name = nameCue;
    }

    if (trimmedLength(username) === 0) {
      nextErrors.username = "@handle needs lettering before scouts find you.";
    }
    const handleCue = validateTrailUsername(username);
    if (handleCue && !nextErrors.username) {
      nextErrors.username = handleCue;
    }

    if (trimmedLength(email) === 0) {
      nextErrors.email = "Anchors aweigh — Trav needs mail to berth your dossier.";
    }
    const emailCue = validateEmailFormat(email);
    if (emailCue && !nextErrors.email) {
      nextErrors.email = emailCue;
    }

    const passwordCue = validatePasswordStrength(password);
    if (password.length === 0) {
      nextErrors.password = "Spin a passphrase before tossing supplies on deck.";
    } else if (passwordCue && !nextErrors.password) {
      nextErrors.password = passwordCue;
    }

    if (trimmedLength(confirmPassword) === 0) {
      nextErrors.confirmPassword = "Mirror the passphrase — seal the hammock knot.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passes need matching stamps before customs clears them.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    async function finalize() {
      setBusy(true);
      try {
        await pretendSignupDelay();
        router.replace("/");
      } finally {
        setBusy(false);
      }
    }

    void finalize();
  };

  return (
    <div className="flex min-h-[100svh] w-full flex-col bg-gradient-to-b from-[#e6f6ff] via-white to-[#f2fbed] pb-[max(32px,calc(env(safe-area-inset-bottom)+24px))] pt-6">
      <AuthBrandHeader
        eyebrow="Join the scouts"
        title="Raise a Trav flag"
        subtitle="Mock rails only — your itinerary vault materialises once Supabase ferries payloads. Till then rehearsal fields stay gorgeous."
        className="pb-10"
      />

      <Card
        tone="muted"
        padding="lg"
        className="mx-auto w-full max-w-md flex-1 space-y-10 rounded-[32px] border border-white/90 bg-white/97 px-6 pb-12 pt-9 shadow-[0_48px_100px_-55px_rgba(15,71,118,0.35)] backdrop-blur"
      >
        <form noValidate className="space-y-[22px]" onSubmit={onSubmit}>
          <fieldset className="space-y-[17px]" disabled={busy}>
            <legend className="sr-only">Create traveller account</legend>
            <Input
              name="name"
              label="Display name"
              autoComplete="name"
              spellCheck={false}
              placeholder="Maya Reyes"
              value={name}
              onChange={onNameChange}
              hint="Shows on maps, collabs, and sunset shout-outs."
              error={fieldErrors.name ?? undefined}
            />
            <Input
              name="username"
              label="Trail username"
              autoComplete="username"
              spellCheck={false}
              placeholder="trail.wander.coast"
              value={username}
              onChange={onUsernameChange}
              hint="@letters • digits • dots • underscores • 3+ chars"
              error={fieldErrors.username ?? undefined}
            />
            <Input
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              placeholder="scout@trailhead.voyage"
              value={email}
              onChange={onEmailChange}
              error={fieldErrors.email ?? undefined}
            />

            <div className="space-y-[15px]">
              <Input
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={onPasswordChange}
                error={fieldErrors.password ?? undefined}
              />
              <Input
                name="confirmPassword"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Match the line above"
                value={confirmPassword}
                onChange={onConfirmChange}
                error={fieldErrors.confirmPassword ?? undefined}
              />
            </div>
          </fieldset>

          <div className="space-y-[18px] pt-1">
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy}>
              {busy ? "Carving stamps…" : "Create Trav account"}
            </Button>

            <p className="px-px text-[12px] leading-relaxed text-neutral-600">
              By continuing you agree Trav’s etiquette — stay kind to hosts, tides, gate agents, wild critters… even in mock rehearsals.
            </p>
          </div>
        </form>

        <AuthOAuthRow contextLabel="or chart via SSO placeholders" />

        <p className="text-center text-sm text-neutral-600">
          Already packing? Slide back —{" "}
          <Link
            href="/login"
            prefetch={false}
            className="font-semibold text-primary underline-offset-[5px] outline-none hover:underline focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-primary/35"
          >
            Log into Trav
          </Link>
        </p>
      </Card>
    </div>
  );
}
