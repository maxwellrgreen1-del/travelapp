"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Textarea";
import { isUsernameTakenByOtherUser } from "@/features/profile/checkUsernameAvailable";
import { loadOrCreateProfileForUser } from "@/features/profile/loadOrCreateProfile";
import type { ProfileEditFieldErrors } from "@/features/profile/validateProfileEditForm";
import { validateProfileEditForm } from "@/features/profile/validateProfileEditForm";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { createClient } from "@/lib/supabase/client";

type PageLoadState = "loading" | "ready" | "error";
type SaveState = "idle" | "saving" | "success" | "error";

export function ProfileEditScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();

  const [supabase] = useState(() => createClient());
  const [pageLoad, setPageLoad] = useState<PageLoadState>("loading");
  const [pageError, setPageError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  /** Snapshot from Supabase so we only call the uniqueness query when the handle actually changes. */
  const [baselineUsername, setBaselineUsername] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<ProfileEditFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const loadProfile = useCallback(async () => {
    if (authLoading || !user) {
      return;
    }

    setPageLoad("loading");
    setPageError(null);

    const result = await loadOrCreateProfileForUser(supabase, user);

    if (!result.ok) {
      setPageLoad("error");
      setPageError(result.error);
      return;
    }

    const row = result.row;
    setDisplayName(row.display_name?.trim() ?? "");
    setUsername(row.username);
    setBio(row.bio?.trim() ?? "");
    setAvatarUrl(row.avatar_url?.trim() ?? "");
    setBaselineUsername(row.username);
    setFieldErrors({});
    setFormError(null);
    setSaveState("idle");
    setPageLoad("ready");
  }, [authLoading, user, supabase]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile, retryTick]);

  async function handleSave() {
    if (!user || baselineUsername === null) {
      return;
    }

    setFormError(null);
    setSaveState("idle");

    const validated = validateProfileEditForm({
      displayName,
      username,
      bio,
      avatarUrl,
    });

    const nextErrors = validated.fieldErrors;
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (validated.normalizedUsername !== baselineUsername) {
      const { taken, queryError } = await isUsernameTakenByOtherUser(
        supabase,
        validated.normalizedUsername,
        user.id,
      );

      if (queryError) {
        setFormError(queryError);
        return;
      }

      if (taken) {
        setFieldErrors({ username: "That trail handle already belongs to another traveller." });
        return;
      }
    }

    setSaveState("saving");

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: validated.displayName,
        username: validated.normalizedUsername,
        bio: validated.bio,
        avatar_url: validated.avatarUrl,
      })
      .eq("id", user.id);

    if (error) {
      const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

      if (code === "23505") {
        setFieldErrors({ username: "That trail handle collided with another profile — pick a different one." });
      } else {
        const message =
          typeof error === "object" && error !== null && "message" in error ? String(error.message) : "Update failed.";
        setFormError(message);
      }

      setSaveState("error");
      return;
    }

    setSaveState("success");
    router.refresh();

    window.setTimeout(() => {
      router.replace("/profile");
    }, 900);
  }

  const isBusy = authLoading || pageLoad === "loading";

  if (isBusy) {
    return (
      <div className="min-h-[100vh] bg-gradient-to-b from-[#fcfbf9] via-white to-neutral-50 text-neutral-900">
        <div className="px-4 pb-28 pt-4 sm:px-5">
          <PageHeader title="Edit profile" subtitle="Name, traveller tagline, and portrait link." showBackNavigation={false} />
          <LoadingState message="Syncing profile from Supabase…" className="py-24" />
        </div>
      </div>
    );
  }

  if (pageLoad === "error") {
    return (
      <div className="min-h-[100vh] bg-gradient-to-b from-[#fcfbf9] via-white to-neutral-50 text-neutral-900">
        <div className="px-4 pb-28 pt-4 sm:px-5">
          <PageHeader
            title="Edit profile"
            subtitle="Name, traveller tagline, and portrait link."
            trailing={
              <Link
                href="/profile"
                className="rounded-xl px-2 py-1 text-sm font-semibold text-primary underline-offset-4 outline-none ring-primary/30 hover:underline focus-visible:ring-4"
              >
                Done
              </Link>
            }
            showBackNavigation={false}
          />
          <EmptyState
            title="Profile did not load"
            description={pageError ?? "Please retry — we need your row from `public.profiles` before editing."}
            action={
              <Button type="button" variant="outlinePrimary" onClick={() => setRetryTick((n) => n + 1)}>
                Retry
              </Button>
            }
            className="mt-8"
          />
        </div>
      </div>
    );
  }

  const saveDisabled = saveState === "saving" || saveState === "success";

  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-[#fcfbf9] via-white to-neutral-50 text-neutral-900">
      <div className="space-y-6 px-4 pb-28 pt-4 sm:px-5">
      <PageHeader
        title="Edit profile"
        subtitle="Updates write straight to Supabase (`public.profiles`). Trail stats and posts remain mocked on your profile tab."
        trailing={
          <Link
            href="/profile"
            className="rounded-xl px-2 py-1 text-sm font-semibold text-primary underline-offset-4 outline-none ring-primary/30 hover:underline focus-visible:ring-4"
          >
            Done
          </Link>
        }
        showBackNavigation={false}
      />

      {saveState === "success" ? (
        <output
          aria-live="polite"
          className="block rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
        >
          Profile saved — snapping you back to your trailhead…
        </output>
      ) : null}

      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
        >
          {formError}
        </div>
      ) : null}

      <Card className="space-y-5" padding="lg">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Visibility</p>
          <p className="text-sm text-neutral-600">
            Avatar URL expects a plain image link (HTTPS works best). Usernames stay lowercase inside tript — we match uniqueness before saving.
          </p>
        </div>

        <Input
          label="Display name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          error={fieldErrors.displayName}
          hint="Shows on your trail card and mocked stats rail."
          autoComplete="nickname"
          disabled={saveDisabled}
        />

        <Input
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={fieldErrors.username}
          hint="Stored lowercase — letters, digits, dots, underscores (3+ characters)."
          autoComplete="username"
          disabled={saveDisabled}
        />

        <Textarea
          label="Bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          error={fieldErrors.bio}
          hint="Tell future trip mates why your compass spins the way it does."
          disabled={saveDisabled}
        />

        <Input
          label="Avatar URL"
          inputMode="url"
          placeholder="https://…"
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
          error={fieldErrors.avatarUrl}
          hint="Paste a hosted portrait — leave blank for the initials badge."
          disabled={saveDisabled}
        />

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button type="button" variant="primary" fullWidth size="lg" onClick={() => void handleSave()} disabled={saveDisabled}>
            {saveState === "saving" ? "Saving to Supabase…" : saveState === "success" ? "Saved" : "Save changes"}
          </Button>
          <Link
            href="/profile"
            className={buttonClassName({ variant: "secondary", size: "lg", fullWidth: true })}
          >
            Cancel
          </Link>
        </div>
      </Card>
      </div>
    </div>
  );
}
