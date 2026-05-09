"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useState } from "react";

import { Input } from "@/components/ui/Input";
import { cx } from "@/lib/utils";

type TagInputPlaceholderProps = {
  tags: string[];
  onTagsChange: (next: string[]) => void;
  label?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
};

function normalizeSeed(raw: string) {
  return raw.trim().replace(/^#+/u, "").replace(/\s+/gu, "").toLowerCase();
}

/** Instagram-style hashtags without persisting anywhere yet. */
export function TagInputPlaceholder({
  tags,
  onTagsChange,
  label = "Destination tags",
  hint = 'Tap Enter after each hashtag. Leading # is optional — Trav adds them for you.',
  placeholder = "Add hashtag…",
  disabled = false,
}: TagInputPlaceholderProps) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const token = normalizeSeed(draft);
    if (!token) return;
    if (tags.some((existing) => normalizeSeed(existing) === token)) {
      setDraft("");
      return;
    }
    onTagsChange([...tags, `#${token}`]);
    setDraft("");
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    }
  }

  function remove(tag: string) {
    if (disabled) return;
    onTagsChange(tags.filter((item) => item !== tag));
  }

  return (
    <div className="space-y-3">
      <Input
        label={label}
        hint={hint}
        placeholder={placeholder}
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
      />

      {tags.length ? (
        <ul className="flex flex-wrap gap-2 text-sm" aria-label="Selected hashtags">
          {tags.map((tag) => (
            <li key={tag}>
              <span
                className={cx(
                  "inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold text-emerald-900",
                  disabled ? "opacity-60" : "",
                )}
              >
                #{normalizeSeed(tag)}
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => remove(tag)}
                    className="-mr-1 inline-flex size-7 items-center justify-center rounded-full text-base leading-none outline-none ring-primary/30 transition hover:bg-primary/20 focus-visible:ring-4"
                    aria-label={`Remove hashtag ${normalizeSeed(tag)}`}
                  >
                    ×
                  </button>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-neutral-500">No tags pinned yet.</p>
      )}
    </div>
  );
}
