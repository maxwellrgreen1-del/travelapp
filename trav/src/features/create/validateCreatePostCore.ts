/** Field errors for the traveller log composer — reused by blur-on-change clearing in the UI. */

export type CreatePostCoreErrors = Partial<Record<"tripTitle" | "destination" | "shortDescription", string>>;

export function validateCreatePostCoreFields(
  tripTitle: string,
  destination: string,
  shortDescription: string,
): CreatePostCoreErrors {
  const next: CreatePostCoreErrors = {};

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
