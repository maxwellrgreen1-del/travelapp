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
  LocationDestinationSuggest,
  type CreatorLinkDraft,
  type DestinationCoords,
  PlacesVisitedInputPlaceholder,
  PostGalleryImagePicker,
  TagInputPlaceholder,
} from "@/features/create/components";
import { stashPostMediaUploadWarning } from "@/features/create/postPublishMediaWarningSession";
import { publishTripPost } from "@/features/create/publishTripPost";
import { syncPostMapCoordinates } from "@/features/posts/syncPostMapCoordinates";
import { validateCreatePostCoreFields, type CreatePostCoreErrors } from "@/features/create/validateCreatePostCore";
import { attachPostGalleryImagesFromFiles } from "@/features/media";
import { loadOrCreateProfileForUser } from "@/features/profile/loadOrCreateProfile";
import { validateImageFileAsync } from "@/lib/media/validateImageFile";
import { cx } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type CreatePostFormProps = {
  user: User;
};

function summarizePlaces(rows: string[]) {
  return rows.map((row) => row.trim()).filter(Boolean);
}

/** Authenticated composer — core fields + optional gallery persist to Supabase. */
export function CreatePostForm({ user }: CreatePostFormProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [tripTitle, setTripTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<DestinationCoords | null>(null);
  const [shortDescription, setShortDescription] = useState("");
  const [journalBody, setJournalBody] = useState("");
  const [restaurants, setRestaurants] = useState("");
  const [placesVisited, setPlacesVisited] = useState<string[]>([""]);
  const [destinationTags, setDestinationTags] = useState<string[]>([]);
  const [externalLinks, setExternalLinks] = useState<CreatorLinkDraft[]>([]);

  const [heroFiles, setHeroFiles] = useState<File[]>([]);
  const [heroPickError, setHeroPickError] = useState<string | null>(null);

  const [errors, setErrors] = useState<CreatePostCoreErrors>({});
  const [publishing, setPublishing] = useState(false);
  const [publishBusyLabel, setPublishBusyLabel] = useState<"Saving trip…" | "Uploading photos…">("Saving trip…");
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
    setDestinationCoords(null);
    setShortDescription("");
    setJournalBody("");
    setRestaurants("");
    setPlacesVisited([""]);
    setDestinationTags([]);
    setExternalLinks([]);
    setHeroFiles([]);
    setHeroPickError(null);
    setErrors({});
    setPublishing(false);
    setPublishBusyLabel("Saving trip…");
    setPublishError(null);
  }

  async function persistTripLog() {
    const validated = validateCreatePostCoreFields(tripTitle, destination, shortDescription);
    setErrors(validated);

    if (Object.keys(validated).length > 0) {
      return;
    }

    for (const file of heroFiles) {
      const heroCheck = await validateImageFileAsync(file);
      if (!heroCheck.ok) {
        setHeroPickError(heroCheck.message);
        return;
      }
    }

    setPublishing(true);
    setPublishBusyLabel("Saving trip…");
    setPublishError(null);

    const bootstrap = await loadOrCreateProfileForUser(supabase, user);
    if (!bootstrap.ok) {
      setPublishing(false);
      setPublishError(bootstrap.error);
      return;
    }

    const placeNames = summarizePlaces(placesVisited);

    const publishInput = {
      authorId: user.id,
      title: tripTitle.trim(),
      locationDisplay: destination.trim(),
      description: shortDescription.trim(),
      journal: journalBody,
      visibility: "public" as const,
      placeNames,
      ...(destinationCoords &&
      Number.isFinite(destinationCoords.lat) &&
      Number.isFinite(destinationCoords.lng) &&
      Math.abs(destinationCoords.lat) <= 90 &&
      Math.abs(destinationCoords.lng) <= 180
        ? { mapLatitude: destinationCoords.lat, mapLongitude: destinationCoords.lng }
        : {}),
    };

    const result = await publishTripPost(supabase, publishInput);

    if (!result.ok) {
      setPublishing(false);
      setPublishError(result.message);
      return;
    }

    if (!destinationCoords) {
      try {
        await syncPostMapCoordinates(supabase, {
          postId: result.postId,
          authorId: user.id,
          locationDisplay: destination.trim(),
          placeNames,
        });
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[CreatePostForm] syncPostMapCoordinates threw (unexpected):", error);
        }
      }
    }

    if (heroFiles.length > 0) {
      setPublishBusyLabel("Uploading photos…");
      const galleryResult = await attachPostGalleryImagesFromFiles(supabase, {
        postId: result.postId,
        authorId: user.id,
        files: heroFiles,
        altText: tripTitle.trim(),
      });

      if (galleryResult.failures.length > 0) {
        const detail = galleryResult.failures.map((f) => `Photo ${f.slot}: ${f.message}`).join(" · ");
        const prefix =
          galleryResult.uploadedCount > 0
            ? `Only ${galleryResult.uploadedCount} of ${heroFiles.length} photos could be saved. `
            : "None of your photos could be saved. ";
        stashPostMediaUploadWarning(result.postId, `${prefix}${detail}`);
      }
    }

    setPublishing(false);
    setPublishBusyLabel("Saving trip…");
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
        subtitle="Core recap fields and optional trip photos publish to Supabase — waypoints sync; restaurants, tags, and links stay local for now."
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

          <LocationDestinationSuggest
            required
            label="Destination / location focus"
            placeholder="Southern Patagonian Ice Field, Chile..."
            hint="Countries, valleys, waterways — specificity helps explorers picture the arc. Saved to `posts.location_display`. Pick a suggestion for an exact map pin, or type freely and we geocode after save."
            value={destination}
            onValueChange={(next) => {
              setDestination(next);
              if (errors.destination) {
                setErrors((prev) => ({ ...prev, destination: undefined }));
              }
            }}
            selectedCoords={destinationCoords}
            onSelectedCoordsChange={setDestinationCoords}
            error={errors.destination}
            disabled={interactionLocked}
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

      <PostGalleryImagePicker
        disabled={interactionLocked}
        files={heroFiles}
        onFilesChange={setHeroFiles}
        validationError={heroPickError}
        onValidationError={setHeroPickError}
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
            Trip title, location line, teaser, journal, waypoints, and up to five optional photos sync to Supabase. If some uploads fail after the post
            saves, you will still land on your recap with a heads-up banner.
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
                {publishBusyLabel}
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
