"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/utils";

type MediaUploadPlaceholderProps = {
  /** Mock filenames or labels shown as “picked” clips until real uploads arrive. */
  items: string[];
  onItemsChange: (next: string[]) => void;
  maxItems?: number;
  disabled?: boolean;
};

/**
 * Tap-to-append placeholder rows — no binaries leave the browser yet.
 */
export function MediaUploadPlaceholder({
  items,
  onItemsChange,
  maxItems = 6,
  disabled = false,
}: MediaUploadPlaceholderProps) {
  function addMockClip() {
    if (disabled || items.length >= maxItems) return;
    const index = items.length + 1;
    const label = Math.random() > 0.4 ? `clip_${index}.MOV` : `photo_${index}.jpg`;
    onItemsChange([...items, label]);
  }

  function removeClip(label: string) {
    if (disabled) return;
    onItemsChange(items.filter((item) => item !== label));
  }

  function onKeyActivate(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      addMockClip();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Photos & reels</p>
          <p className="text-xs leading-relaxed text-neutral-600">
            Staging area only — uploads wire into Supabase storage later.
          </p>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          {items.length}/{maxItems}
        </span>
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : addMockClip}
        onKeyDown={disabled ? undefined : onKeyActivate}
        className={cx(
          "group relative flex cursor-pointer flex-col items-center gap-4 rounded-[22px] border-2 border-dashed border-neutral-300 bg-neutral-50/85 px-4 py-12 text-center transition",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:border-primary/60 hover:bg-primary/5 hover:shadow-inner focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35",
        )}
        aria-disabled={disabled}
      >
        <div className="flex size-16 items-center justify-center rounded-[18px] border border-neutral-100 bg-white text-2xl font-semibold text-primary shadow-sm transition group-hover:shadow-md">
          <span aria-hidden>+</span>
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-neutral-900">Tap to queue a pretend clip</p>
          <p className="text-sm leading-relaxed text-neutral-600">
            We will swap this block for native pickers plus drag-and-drop.
          </p>
        </div>
        <Button
          type="button"
          variant="outlinePrimary"
          size="sm"
          disabled={disabled || items.length >= maxItems}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            addMockClip();
          }}
        >
          Add mock file
        </Button>
      </div>

      {items.length ? (
        <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white px-4 py-1 text-sm text-neutral-800 shadow-sm">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-3 py-3">
              <PaperclipIcon aria-hidden className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate font-medium">{item}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeClip(item)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-700 outline-none ring-red-400/40 transition hover:bg-red-50 focus-visible:ring-4 disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-neutral-100/75 px-3 py-2 text-xs text-neutral-600">Nothing staged yet.</p>
      )}
    </div>
  );
}

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M19.438 13.917 10.834 21.521a6 6 0 1 1-8.491-8.491l11.607-11.607a4 4 0 1 1 5.658 5.658L9 19.086a2 2 0 1 1-2.828-2.828l8.19-8.189"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
