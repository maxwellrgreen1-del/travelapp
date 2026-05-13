"use client";

import type { FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Textarea";
import { PlacesVisitedInputPlaceholder } from "@/features/create/components";
import { validateCreatePostCoreFields, type CreatePostCoreErrors } from "@/features/create/validateCreatePostCore";
import type { PostForEditPayload } from "@/features/posts/loadPostForEditPayload";
import { syncPostMapCoordinates } from "@/features/posts/syncPostMapCoordinates";
import { updateTripPost } from "@/features/posts/updateTripPost";
import { cx } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type EditPostFormProps = {
  user: User;
  postId: string;
  initialData: PostForEditPayload;
};

function summarizePlaces(rows: string[]) {
  return rows.map((row) => row.trim()).filter(Boolean);
}

/** Owner-only editor — mirrors the create composer for shared fields; gallery stays read-only in Supabase for now. */
export function EditPostForm({ user, postId, initialData }: EditPostFormProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [tripTitle, setTripTitle] = useState(initialData.title);
  const [destination, setDestination] = useState(initialData.locationDisplay);
  const [shortDescription, setShortDescription] = useState(initialData.description);
  const [journalBody, setJournalBody] = useState(initialData.journal);
  const [placesVisited, setPlacesVisited] = useState<string[]>(
    initialData.placeNames.length ? initialData.placeNames : [""],
  );

  const [errors, setErrors] = useState<CreatePostCoreErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const interactionLocked = saving;

  useEffect(() => {
    if (!saveError) {
      return;
    }
    const handle = window.setTimeout(() => setSaveError(null), 9000);
    return () => window.clearTimeout(handle);
  }, [saveError]);

  async function persistEdits() {
    const validated = validateCreatePostCoreFields(tripTitle, destination, shortDescription);
    setErrors(validated);

    if (Object.keys(validated).length > 0) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    const placeNames = summarizePlaces(placesVisited);

    const result = await updateTripPost(supabase, {
      postId,
      authorId: user.id,
      title: tripTitle.trim(),
      locationDisplay: destination.trim(),
      description: shortDescription.trim(),
      journal: journalBody,
      placeNames,
    });

    if (!result.ok) {
      setSaving(false);
      setSaveError(result.message);
      return;
    }

    try {
      await syncPostMapCoordinates(supabase, {
        postId,
        authorId: user.id,
        locationDisplay: destination.trim(),
        placeNames,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[EditPostForm] syncPostMapCoordinates threw (unexpected):", error);
      }
    }

    setSaving(false);
    router.refresh();
    router.push(`/post/${postId}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void persistEdits();
  }

  return (
    <form className="space-y-6 px-3 pb-10 pt-4 sm:px-4" onSubmit={handleSubmit} noValidate>
      <PageHeader
        title="Edit travel log"
        subtitle="Title, location line, teaser, journal, and waypoints sync to Supabase — existing photos stay as they are for now."
      />

      {saveError ? (
        <output
          aria-live="assertive"
          role="alert"
          className="block rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-relaxed text-red-900 shadow-sm shadow-red-900/10"
        >
          {saveError}
        </output>
      ) : null}

      <Card padding="lg" tone="muted" className="bg-white shadow-md shadow-neutral-950/15">
        <fieldset disabled={interactionLocked} className="space-y-6">
          <legend className="sr-only">Trip recap fields</legend>

          <Input
            required
            autoComplete="off"
            label="Trip title"
            placeholder="Fjord crossings + ramen pop-ups · May sprint"
            value={tripTitle}
            error={errors.tripTitle}
            onChange={(event) => {
              setTripTitle(event.target.value);
              if (errors.tripTitle) {
                setErrors((prev) => ({ ...prev, tripTitle: undefined }));
              }
            }}
          />

          <Input
            required
            autoComplete="off"
            label="Destination / location focus"
            placeholder="Southern Patagonian Ice Field, Chile..."
            hint="Saved to `posts.location_display`."
            value={destination}
            error={errors.destination}
            onChange={(event) => {
              setDestination(event.target.value);
              if (errors.destination) setErrors((prev) => ({ ...prev, destination: undefined }));
            }}
          />

          <Textarea
            required
            label="Short description"
            hint="Teaser synced to Supabase `description`."
            placeholder="Northern lights chased by geothermal bread bakes..."
            rows={5}
            value={shortDescription}
            error={errors.shortDescription}
            onChange={(event) => {
              setShortDescription(event.target.value);
              if (errors.shortDescription) {
                setErrors((prev) => ({ ...prev, shortDescription: undefined }));
              }
            }}
          />

          <Textarea
            label="Blog-style journal entry"
            hint="Stored in `journal` — leave blank to clear the long-form block."
            placeholder="Day three — gale switched west, pastries turned gritty with ash..."
            rows={10}
            value={journalBody}
            onChange={(event) => setJournalBody(event.target.value)}
          />
        </fieldset>
      </Card>

      <Card padding="lg" className="space-y-6 bg-white shadow-md shadow-neutral-950/10">
        <PlacesVisitedInputPlaceholder
          disabled={interactionLocked}
          places={placesVisited.length ? placesVisited : [""]}
          onPlacesChange={(nextRows) => {
            setPlacesVisited(nextRows.length ? nextRows : [""]);
          }}
        />
      </Card>

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+1rem)] rounded-[26px] border border-neutral-200 bg-white/95 p-5 shadow-xl shadow-neutral-950/25 backdrop-blur">
        <div className="space-y-2 text-sm text-neutral-600">
          <p className="font-semibold text-neutral-950">Saving updates Postgres.</p>
          <p className="text-pretty">Waypoints replace the previous ordered list. Photo gallery is unchanged on this pass.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="outlinePrimary" type="button" disabled={interactionLocked} onClick={() => router.push(`/post/${postId}`)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={interactionLocked}
            aria-busy={saving}
            className={cx(saving ? "opacity-90" : "")}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  aria-hidden
                  className={cx(
                    "inline-block size-5 rounded-full border-2 border-white/45 border-t-white",
                    "motion-safe:animate-spin",
                  )}
                />
                Saving changes…
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>

      <div aria-hidden className="h-4" />
    </form>
  );
}
