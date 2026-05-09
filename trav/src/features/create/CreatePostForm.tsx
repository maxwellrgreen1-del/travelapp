"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

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
import { cx } from "@/lib/utils";

const PUBLISH_MS = 1200;

type FormErrors = Partial<Record<"tripTitle" | "destination" | "shortDescription", string>>;

function validateFields(tripTitle: string, destination: string, shortDescription: string): FormErrors {
  const next: FormErrors = {};

  if (!tripTitle.trim()) {
    next.tripTitle = "Give this trip log a catchy title explorers can skim.";
  }

  if (!destination.trim()) {
    next.destination = "Add where you wandered — regions, landmarks, whichever feels right.";
  }

  if (!shortDescription.trim()) {
    next.shortDescription = "A short teaser hooks friends before they scroll your journal.";
  } else if (shortDescription.trim().length < 20) {
    next.shortDescription = "Stretch your teaser — at least twenty characters paints a sharper hook.";
  }

  return next;
}

function summarizePlaces(rows: string[]) {
  return rows.map((row) => row.trim()).filter(Boolean);
}

/** Client-only drafts until uploads + persistence ship. */
export function CreatePostForm() {
  const successRef = useRef<HTMLDivElement>(null);

  const [tripTitle, setTripTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [journalBody, setJournalBody] = useState("");
  const [restaurants, setRestaurants] = useState("");
  const [placesVisited, setPlacesVisited] = useState<string[]>([""]);
  const [destinationTags, setDestinationTags] = useState<string[]>([]);
  const [externalLinks, setExternalLinks] = useState<CreatorLinkDraft[]>([]);
  const [stagedMediaLabels, setStagedMediaLabels] = useState<string[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const interactionLocked = publishing || published;

  useEffect(() => {
    if (published && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [published]);

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
    setPublished(false);
  }

  async function fakePublishTripLog() {
    const validated = validateFields(tripTitle, destination, shortDescription);
    setErrors(validated);

    if (Object.keys(validated).length > 0) {
      setPublished(false);
      return;
    }

    setPublishing(true);
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, PUBLISH_MS);
    });
    setPublishing(false);
    setPublished(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void fakePublishTripLog();
  }

  if (published) {
    const placeSummary = summarizePlaces(placesVisited);

    return (
      <section className="space-y-5 px-3 pb-10 pt-6 sm:px-4">
        <PageHeader title="Dreamy — your log is mocked in" subtitle="Everything stayed on-device — Supabase uploads come next sprint." />

        <div ref={successRef} role="status" aria-live="polite" tabIndex={-1}>
          <Card tone="muted" padding="lg" className="border-emerald-200/80 shadow-lg shadow-emerald-900/5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-[18px] bg-primary shadow-md shadow-primary/40">
                <CheckBadgeIcon aria-hidden className="text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/85">Practice publish</p>
                <p className="text-3xl font-semibold tracking-tight text-neutral-900">{tripTitle.trim()}</p>
                <p className="text-sm text-neutral-600">
                  Tagged{" "}
                  <span className="font-semibold text-neutral-900">{destination.trim()}</span>
                  {' — '}kept locally for QA only.
                </p>
              </div>
            </div>

            <dl className="mt-6 divide-y divide-emerald-100 text-sm leading-relaxed text-neutral-700">
              <DetailRow term="Elevator pitch" definition={shortDescription.trim()} />
              <DetailRow term="Journal vibes" definition={journalBody.trim() ? journalBody.trim() : "No long-form entry drafted yet."} />
              <DetailRow
                term="Restaurants shouted out"
                definition={restaurants.trim() ? restaurants.trim() : "No tasting notes scribbled yet."}
              />
              <DetailRow
                term="Waypoints staged"
                definition={placeSummary.length ? placeSummary.join(" → ") : "No extra stops enumerated."}
              />
              <DetailRow
                term="Media bench"
                definition={
                  stagedMediaLabels.length
                    ? stagedMediaLabels.join(", ")
                    : "No reels or telephoto frames queued locally."
                }
              />
              <DetailRow term="Outbound links" definition={summarizeLinks(externalLinks)} />
              <DetailRow term="Hashtags" definition={destinationTags.length ? destinationTags.join(" ") : "No tags yet."} />
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" fullWidth size="lg" type="button" onClick={resetComposer}>
                Draft another trip
              </Button>
              <Button variant="outlinePrimary" fullWidth size="lg" type="button" disabled>
                Go live (wired later)
              </Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <form className="space-y-6 px-3 pb-10 pt-4 sm:px-4" onSubmit={handleSubmit} noValidate>
      <PageHeader title="Compose travel log" subtitle="Dream up your recap — validations run locally until Supabase syncs drafts." />

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
            hint="Countries, valleys, waterways — specificity helps explorers picture the arc."
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
            hint="Teaser travellers see atop the recap — keep it evocative but quick to read."
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
            hint="Long-form riff: smells, pacing, playlists, regrets — everything future readers skim."
            placeholder="Day three — gale switched west, pastries turned gritty with ash..."
            rows={10}
            value={journalBody}
            onChange={(event) => setJournalBody(event.target.value)}
          />
        </fieldset>
      </Card>

      <MediaUploadPlaceholder
        disabled={interactionLocked}
        items={stagedMediaLabels}
        onItemsChange={setStagedMediaLabels}
      />

      <Card padding="lg" className="space-y-6 bg-white shadow-md shadow-neutral-950/10">
        <Textarea
          label="Restaurant recommendations"
          hint="List haunts comma-separated or write mini blurbs."
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
          <p className="font-semibold text-neutral-950">Publishing is mock-only.</p>
          <p className="text-pretty">
            Tap <span className="font-semibold text-primary">Publish travel log</span> for the tactile flow — nothing uploads yet.
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

function CheckBadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="m7 13 4 4 10-11" stroke="currentColor" strokeWidth="2.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DetailRow({ term, definition }: { term: string; definition: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-10">
      <dt className="basis-40 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">{term}</dt>
      <dd className="flex-1 text-base text-neutral-800">{definition}</dd>
    </div>
  );
}

function summarizeLinks(rows: CreatorLinkDraft[]) {
  if (!rows.length) {
    return "No outbound hops yet.";
  }

  const parts = rows
    .filter((link) => link.url.trim() || link.label.trim())
    .map((link) => {
      const label = link.label.trim() || link.url.trim() || "Untitled";
      const href = link.url.trim();
      if (!href) {
        return label;
      }
      return `${label} → ${href}`;
    });

  return parts.length ? parts.join(" · ") : "Link rows drafted but URLs still empty.";
}
