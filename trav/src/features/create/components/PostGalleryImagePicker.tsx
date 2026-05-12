"use client";

import { type ChangeEvent, useEffect, useState } from "react";

import { Button, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BROWSER_FILE_ACCEPT_IMAGES, validateImageFileAsync } from "@/lib/media/validateImageFile";
import { cx } from "@/lib/utils";

const MAX_IMAGES = 5;

type PostGalleryImagePickerProps = {
  files: File[];
  onFilesChange: (next: File[]) => void;
  validationError: string | null;
  onValidationError: (message: string | null) => void;
  disabled?: boolean;
};

const pickAreaClass = cx(
  "relative flex w-full flex-col items-center gap-4 rounded-[22px] border-2 border-dashed border-neutral-300 bg-neutral-50/85 px-4 py-10 text-center transition outline-none",
  "hover:border-primary/60 hover:bg-primary/5 hover:shadow-inner focus-within:ring-4 focus-within:ring-primary/35",
);

/** Full-area invisible file input on top of the label — Windows often ignores `label[for]` → `sr-only` controls. */
const overlayInputClass =
  "absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed disabled:opacity-0";

/**
 * Up to five ordered trip photos — previews stay in pick order until publish.
 * File inputs sit on top of the dashed card (opacity 0) so the OS dialog opens on Windows/Edge.
 */
export function PostGalleryImagePicker({
  files,
  onFilesChange,
  validationError,
  onValidationError,
  disabled = false,
}: PostGalleryImagePickerProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [files]);

  async function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const raw = input.files;
    const snapshots = raw && raw.length ? Array.from(raw) : [];
    input.value = "";
    if (!snapshots.length) {
      return;
    }

    const next: File[] = [...files];
    let firstError: string | null = null;

    try {
      for (const picked of snapshots) {
        if (next.length >= MAX_IMAGES) {
          if (!firstError) {
            firstError = `You can attach up to ${MAX_IMAGES} photos on this MVP build — extra files were skipped.`;
          }
          break;
        }
        const result = await validateImageFileAsync(picked);
        if (!result.ok) {
          if (!firstError) {
            firstError = result.message;
          }
          continue;
        }
        next.push(picked);
      }
    } catch {
      firstError = firstError ?? "Something went wrong reading that photo — try again.";
    }

    onValidationError(firstError);
    onFilesChange(next);
  }

  function handleRemoveAt(removeIndex: number) {
    if (disabled) return;
    onValidationError(null);
    onFilesChange(files.filter((_, i) => i !== removeIndex));
  }

  function handleClearAll() {
    if (disabled) return;
    onValidationError(null);
    onFilesChange([]);
  }

  return (
    <Card padding="lg" tone="muted" className="bg-white/95 shadow-md shadow-neutral-950/12">
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Trip photos</p>
            <p className="text-xs leading-relaxed text-neutral-600">
              Optional · JPG, PNG, or WebP · up to {MAX_IMAGES} images · order matches your picker selection.
            </p>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {files.length} / {MAX_IMAGES}
          </span>
        </div>

        {validationError ? (
          <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
            {validationError}
          </p>
        ) : null}

        {files.length === 0 ? (
          disabled ? (
            <div className={cx(pickAreaClass, "cursor-not-allowed opacity-50")}>
              <div className="pointer-events-none flex flex-col items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-[16px] border border-neutral-100 bg-white text-xl font-semibold text-primary shadow-sm">
                  <span aria-hidden>+</span>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-neutral-900">Add trip photos</p>
                  <p className="text-sm leading-relaxed text-neutral-600">Available after publishing finishes.</p>
                </div>
              </div>
            </div>
          ) : (
            <label className={cx(pickAreaClass, "cursor-pointer")}>
              <input
                type="file"
                accept={BROWSER_FILE_ACCEPT_IMAGES}
                multiple
                disabled={disabled}
                aria-label="Choose trip photos"
                className={overlayInputClass}
                onChange={(e) => void handleInputChange(e)}
              />
              <div className="pointer-events-none relative z-10 flex flex-col items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-[16px] border border-neutral-100 bg-white text-xl font-semibold text-primary shadow-sm">
                  <span aria-hidden>+</span>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-neutral-900">Add trip photos</p>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    Click this area to open your file picker — previews appear below in the same order before you publish.
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Choose files</span>
              </div>
            </label>
          )
        ) : (
          <ul className="grid list-none grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Selected trip photo previews">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${index}`} className="relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950/5 shadow-inner">
                  {previewUrls[index] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local `blob:` previews
                    <img
                      src={previewUrls[index]!}
                      alt={`Selected trip photo ${index + 1} preview`}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
                    <p className="truncate text-[11px] font-medium text-white drop-shadow">{file.name}</p>
                  </div>
                  <div className="pointer-events-none absolute right-2 top-2 flex gap-1">
                    <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">{index + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outlinePrimary"
                    size="sm"
                    disabled={disabled}
                    className="absolute bottom-2 right-2 z-30 border-white/80 bg-neutral-950/70 text-[11px] text-white hover:bg-white hover:text-neutral-950"
                    onClick={() => handleRemoveAt(index)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {files.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {disabled || files.length >= MAX_IMAGES ? (
              <Button type="button" variant="outlinePrimary" size="sm" disabled>
                Add more photos
              </Button>
            ) : (
              <label
                className={cx(
                  buttonClassName({ variant: "outlinePrimary", size: "sm" }),
                  "relative inline-flex min-h-9 cursor-pointer items-center justify-center overflow-hidden px-3 text-sm",
                )}
              >
                <input
                  type="file"
                  accept={BROWSER_FILE_ACCEPT_IMAGES}
                  multiple
                  disabled={disabled}
                  aria-label="Add more trip photos"
                  className={overlayInputClass}
                  onChange={(e) => void handleInputChange(e)}
                />
                <span className="pointer-events-none relative z-10">Add more photos</span>
              </label>
            )}
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={handleClearAll}>
              Clear all
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
