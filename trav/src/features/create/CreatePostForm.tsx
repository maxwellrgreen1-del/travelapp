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
import {
  LinkListInputPlaceholder,
  type CreatorLinkDraft,
  MediaUploadPlaceholder,
  PlacesVisitedInputPlaceholder,
  TagInputPlaceholder,
} from "@/features/create/components";
import { publishTripPost } from "@/features/create/publishTripPost";
import { validateCreatePostCoreFields, type CreatePostCoreErrors } from "@/features/create/validateCreatePostCore";
import { loadOrCreateProfileForUser } from "@/features/profile/loadOrCreateProfile";
import { cx } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type CreatePostFormProps = {
  user: User;
};

function summarizePlaces(rows: string[]) {
  return rows.map((row) => row.trim()).filter(Boolean);
}

/** Authenticated composer — core fields persist to Supabase while media uploads stay mocked locally for now. */
export function CreatePostForm({ user }: CreatePostFormProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [tripTitle, setTripTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [journalBody, setJournalBody] = useState("");
  const [restaurants, setRestaurants] = useState("");
  const [placesVisited, setPlacesVisited] = useState<string[]>([""]);
  const [destinationTags, setDestinationTags] = useState<string[]>([]);
  const [externalLinks, setExternalLinks] = useState<CreatorLinkDraft[]>([]);
  const [stagedMediaLabels, setStagedMediaLabels] = useState<string[]>([]);

  const [errors, setErrors] = useState<CreatePostCoreErrors>({});
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const interactionLocked = publishing;

  useEffect(() => {
    if (!publishError) {
      return;
    }
    const handle = window.setTimeout(() => setPublishError(null), 9000);
    return () => window.clearTimeout(handle);
  }, [publishError]);

  function resetComposer() {
    setTripTitle("");
    setDestination("");
    setShortDescription("");
    setJournalBody("");
    setRestaurants("");
    setPlacesVisited([""]);
    setDestinationTags([]);
    setExternalLinks([]);
    setStagedMediaLabels([]);
    setErrors({});
    setPublishing(false);
    setPublishError(null);
  }

  async function persistTripLog() {
    const validated = validateCreatePostCoreFields(tripTitle, destination, shortDescription);
    setErrors(validated);

    if (Object.keys(validated).length > 0) {
      return;
    }

    setPublishing(true);
    setPublishError(null);

    const bootstrap = await loadOrCreateProfileForUser(supabase, user);
    if (!bootstrap.ok) {
      setPublishing(false);
      setPublishError(bootstrap.error);
      return;
    }

    const placeNames = summarizePlaces(placesVisited);

    const result = await publishTripPost(supabase, {
      authorId: user.id,
      title: tripTitle.trim(),
      locationDisplay: destination.trim(),
      description: shortDescription.trim(),
      journal: journalBody,
      visibility: "public",
      placeNames,
    });

    setPublishing(false);

    if (!result.ok) {
      setPublishError(result.message);
      return;
    }

    router.refresh();
    router.push(`/post/${result.postId}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void persistTripLog();
  }

  return (
    <form className="space-y-6 px-3 pb-10 pt-4 sm:px-4" onSubmit={handleSubmit} noValidate>
      <PageHeader
        title="Compose travel log"
        subtitle="Core recap fields publish to Supabase; restaurants, hashtags, and links stay local. Hero photos: Storage + post_media — see supabase/STORAGE_SETUP.md and attachPrimaryPostImageFromFile after publish."
      />

      {publishError ? (
        <output
          aria-live="assertive"
          role="alert"
          className="block rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-relaxed text-red-900 shadow-sm shadow-red-900/10"
        >
          {publishError}
        </output>
      ) : null}

      <Card padding="lg" tone="muted" className="bg-white shadow-md shadow-neutral-950/15">
        <fieldset disabled={interactionLocked} className="space-y-6">
          <legend className="sr-only">Core trip recap</legend>

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
            hint="Countries, valleys, waterways — specificity helps explorers picture the arc. Saved to `posts.location_display`."
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
            hint="Teaser travellers skim first — synced to Supabase `description`."
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
            hint="Stored in `journal` — long-form riff: smells, playlists, regrets."
            placeholder="Day three — gale switched west, pastries turned gritty with ash..."
            rows={10}
            value={journalBody}
            onChange={(event) => setJournalBody(event.target.value)}
          />
        </fieldset>
      </Card>

      {/*
        Storage pipeline is ready (`attachPrimaryPostImageFromFile` in @/features/media).
        Next step: keep a `File | null` for the hero shot, call the helper after `publishTripPost` resolves, then navigate.
      */}
      <MediaUploadPlaceholder
        disabled={interactionLocked}
        items={stagedMediaLabels}
        onItemsChange={setStagedMediaLabels}
      />

      <Card padding="lg" className="space-y-6 bg-white shadow-md shadow-neutral-950/10">
        <Textarea
          label="Restaurant recommendations"
          hint="Comma-separated gems — mocked locally for now until a dedicated restaurants column arrives."
          placeholder="Chacra breakfast bar · miso latte flight · secret omakase counter downstairs..."
          rows={6}
          value={restaurants}
          disabled={interactionLocked}
          onChange={(event) => setRestaurants(event.target.value)}
        />

        <PlacesVisitedInputPlaceholder
          disabled={interactionLocked}
          places={placesVisited.length ? placesVisited : [""]}
          onPlacesChange={(nextRows) => {
            setPlacesVisited(nextRows.length ? nextRows : [""]);
          }}
        />

        <LinkListInputPlaceholder
          disabled={interactionLocked}
          links={externalLinks}
          onLinksChange={setExternalLinks}
        />

        <TagInputPlaceholder disabled={interactionLocked} tags={destinationTags} onTagsChange={setDestinationTags} />
      </Card>

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+1rem)] rounded-[26px] border border-neutral-200 bg-white/95 p-5 shadow-xl shadow-neutral-950/25 backdrop-blur">
        <div className="space-y-2 text-sm text-neutral-600">
          <p className="font-semibold text-neutral-950">Publishing lands in Postgres.</p>
          <p className="text-pretty">
            Trip title, location line, teaser, journal, and waypoints persist to Supabase. The media strip above is still a local preview — wire
            `attachPrimaryPostImageFromFile` when you hook the real file picker (bucket + policies: `supabase/STORAGE_SETUP.md`).
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="outlinePrimary" type="button" disabled={interactionLocked} onClick={resetComposer}>
            Reset form
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={interactionLocked}
            aria-busy={publishing}
            className={cx(publishing ? "opacity-90" : "")}
          >
            {publishing ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  aria-hidden
                  className={cx(
                    "inline-block size-5 rounded-full border-2 border-white/45 border-t-white",
                    "motion-safe:animate-spin",
                  )}
                />
                Publishing…
              </span>
            ) : (
              "Publish travel log"
            )}
          </Button>
        </div>
      </div>

      <div aria-hidden className="h-4" />
    </form>
  );
}
