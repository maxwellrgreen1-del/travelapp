"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { consumePostMediaUploadWarning } from "@/features/create/postPublishMediaWarningSession";
import { cx } from "@/lib/utils";

type PostPublishMediaWarningBannerProps = {
  postId: string;
};

/**
 * One-shot banner when the traveller’s post saved but the hero image upload failed (see Create Post flow).
 */
export function PostPublishMediaWarningBanner({ postId }: PostPublishMediaWarningBannerProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const warn = consumePostMediaUploadWarning(postId);
    if (warn) {
      setMessage(warn);
    }
  }, [postId]);

  if (!message || dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      className={cx(
        "mx-auto max-w-3xl space-y-3 px-4 py-3 text-sm leading-relaxed text-amber-950",
        "rounded-2xl border border-amber-300/90 bg-amber-50/95 shadow-sm",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="font-semibold">Cover photo did not upload</p>
        <Button type="button" variant="ghost" size="sm" className="shrink-0 text-amber-950" onClick={() => setDismissed(true)}>
          Dismiss
        </Button>
      </div>
      <p>{message}</p>
      <p className="text-xs text-amber-900/90">
        Your trip log is saved — you can try adding a photo again from a future edit flow, or re-compose from Create with the same text.
      </p>
    </div>
  );
}
