"use client";

import { type ChangeEvent, useEffect, useState } from "react";

import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BROWSER_FILE_ACCEPT_IMAGES, validateImageFileAsync } from "@/lib/media/validateImageFile";
import { cx } from "@/lib/utils";

type PrimaryHeroImagePickerProps = {
  /** Selected file (at most one) — parent owns state for publish flow. */
  file: File | null;
  onFileChange: (next: File | null) => void;
  /** Shown when the last pick failed validation. */
  validationError: string | null;
  onValidationError: (message: string | null) => void;
  disabled?: boolean;
};

const pickAreaClass = cx(
  "relative flex w-full flex-col items-center gap-4 rounded-[22px] border-2 border-dashed border-neutral-300 bg-neutral-50/85 px-4 py-10 text-center transition outline-none",
  "hover:border-primary/60 hover:bg-primary/5 hover:shadow-inner focus-within:ring-4 focus-within:ring-primary/35",
);

const overlayInputClass =
  "absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed disabled:opacity-0";

/**
 * Single hero image for a trip log — matches Create Post card styling; gallery expansion can reuse patterns later.
 */
export function PrimaryHeroImagePicker({
  file,
  onFileChange,
  validationError,
  onValidationError,
  disabled = false,
}: PrimaryHeroImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const raw = input.files;
    const snapshots = raw && raw.length ? Array.from(raw) : [];
    input.value = "";
    const picked = snapshots[0];
    if (!picked) {
      return;
    }

    try {
      const result = await validateImageFileAsync(picked);
      if (!result.ok) {
        onValidationError(result.message);
        return;
      }
      onValidationError(null);
      onFileChange(picked);
    } catch {
      onValidationError("Something went wrong reading that photo — try again.");
    }
  }

  function handleClear() {
    if (disabled) return;
    onValidationError(null);
    onFileChange(null);
  }

  return (
    <Card padding="lg" tone="muted" className="bg-white/95 shadow-md shadow-neutral-950/12">
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Cover photo</p>
            <p className="text-xs leading-relaxed text-neutral-600">
              Optional · JPG, PNG, or WebP · one image for now — more slots can reuse this pipeline later.
            </p>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {file ? "1 / 1" : "0 / 1"}
          </span>
        </div>

        {validationError ? (
          <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
            {validationError}
          </p>
        ) : null}

        {previewUrl ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[22px] border border-neutral-200 bg-neutral-950/5 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
            <img src={previewUrl} alt="Selected cover preview" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-4 py-4">
              <p className="min-w-0 truncate text-sm font-medium text-white drop-shadow">{file?.name}</p>
              <Button type="button" variant="outlinePrimary" size="sm" disabled={disabled} onClick={handleClear}>
                Remove photo
              </Button>
            </div>
          </div>
        ) : disabled ? (
          <div className={cx(pickAreaClass, "cursor-not-allowed opacity-50")}>
            <div className="pointer-events-none flex flex-col items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-[16px] border border-neutral-100 bg-white text-xl font-semibold text-primary shadow-sm">
                <span aria-hidden>+</span>
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-neutral-900">Add a cover image</p>
                <p className="text-sm leading-relaxed text-neutral-600">Available after publishing finishes.</p>
              </div>
            </div>
          </div>
        ) : (
          <label className={cx(pickAreaClass, "cursor-pointer")}>
            <input
              type="file"
              accept={BROWSER_FILE_ACCEPT_IMAGES}
              disabled={disabled}
              aria-label="Choose cover image"
              className={overlayInputClass}
              onChange={(e) => void handleInputChange(e)}
            />
            <div className="pointer-events-none relative z-10 flex flex-col items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-[16px] border border-neutral-100 bg-white text-xl font-semibold text-primary shadow-sm">
                <span aria-hidden>+</span>
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-neutral-900">Add a cover image</p>
                <p className="text-sm leading-relaxed text-neutral-600">Click this area to open your file picker.</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Choose file</span>
            </div>
          </label>
        )}

        {previewUrl ? (
          disabled ? (
            <Button type="button" variant="outlinePrimary" size="sm" disabled className="w-full sm:w-auto">
              Replace image
            </Button>
          ) : (
            <label
              className={cx(
                buttonClassName({ variant: "outlinePrimary", size: "sm" }),
                "relative inline-flex w-full cursor-pointer items-center justify-center overflow-hidden sm:w-auto",
              )}
            >
              <input
                type="file"
                accept={BROWSER_FILE_ACCEPT_IMAGES}
                disabled={disabled}
                aria-label="Replace cover image"
                className={overlayInputClass}
                onChange={(e) => void handleInputChange(e)}
              />
              <span className="pointer-events-none relative z-10 px-4 py-2">Replace image</span>
            </label>
          )
        ) : null}
      </div>
    </Card>
  );
}
