"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { LocationSuggestion } from "@/lib/geo/locationSuggestion";
import { cx } from "@/lib/utils";

const DEBOUNCE_MS = 320;

const fieldBaseClasses =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:pointer-events-none disabled:bg-neutral-100";

export type DestinationCoords = { lat: number; lng: number };

type LocationDestinationSuggestProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value: string;
  onValueChange: (next: string) => void;
  /** When the traveller picks a suggestion, coords match `label`; cleared when they type freely. */
  selectedCoords: DestinationCoords | null;
  onSelectedCoordsChange: (next: DestinationCoords | null) => void;
};

/**
 * Destination line with debounced Nominatim-backed suggestions (via `/api/location-suggest`).
 */
export function LocationDestinationSuggest({
  label,
  hint,
  error,
  placeholder,
  required,
  disabled,
  value,
  onValueChange,
  selectedCoords,
  onSelectedCoordsChange,
}: LocationDestinationSuggestProps) {
  const uid = useId();
  const listId = `${uid}-suggestions`;

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [softError, setSoftError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** Browser `setTimeout` id — use `number` so TS matches `window.setTimeout` in the DOM lib. */
  const blurCloseRef = useRef<number | null>(null);

  useEffect(() => {
    if (disabled) {
      return;
    }

    abortRef.current?.abort();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setLoading(false);
      setSoftError(null);
      return;
    }

    setLoading(true);
    setSoftError(null);

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      void (async () => {
        try {
          const res = await fetch(`/api/location-suggest?q=${encodeURIComponent(q)}`, {
            signal: controller.signal,
            cache: "no-store",
          });
          if (!res.ok) {
            setSuggestions([]);
            setSoftError("Suggestions unavailable — try again.");
            return;
          }
          const data: unknown = await res.json();
          const raw = data && typeof data === "object" && "suggestions" in data ? (data as { suggestions: unknown }).suggestions : [];
          const list = Array.isArray(raw) ? (raw as LocationSuggestion[]) : [];
          setSuggestions(list.filter((s) => s && typeof s.label === "string" && Number.isFinite(s.lat) && Number.isFinite(s.lng)));
        } catch (e) {
          if ((e as Error).name === "AbortError") {
            return;
          }
          setSuggestions([]);
          setSoftError("Suggestions unavailable — try again.");
        } finally {
          setLoading(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      abortRef.current?.abort();
    };
  }, [value, disabled]);

  function handlePick(s: LocationSuggestion) {
    onValueChange(s.label);
    onSelectedCoordsChange({ lat: s.lat, lng: s.lng });
    setOpen(false);
    setSuggestions([]);
  }

  function handleInputChange(next: string) {
    onValueChange(next);
    onSelectedCoordsChange(null);
    setOpen(true);
  }

  function handleBlur() {
    blurCloseRef.current = window.setTimeout(() => {
      setOpen(false);
      blurCloseRef.current = null;
    }, 180);
  }

  function handleFocus() {
    if (blurCloseRef.current != null) {
      window.clearTimeout(blurCloseRef.current);
      blurCloseRef.current = null;
    }
    if (value.trim().length >= 3 && (suggestions.length > 0 || loading)) {
      setOpen(true);
    }
  }

  const showPanel = open && value.trim().length >= 3 && !disabled && (loading || suggestions.length > 0 || Boolean(softError));

  const describedBy = cx(hint ? `${uid}-hint` : false, error ? `${uid}-error` : false);

  return (
    <div className="relative flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={uid} className="text-sm font-semibold text-neutral-800">
          {label}
        </label>
      ) : null}

      <input
        id={uid}
        type="text"
        autoComplete="off"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={error ? true : undefined}
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listId : undefined}
        aria-describedby={describedBy || undefined}
        className={cx(fieldBaseClasses, error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "")}
      />

      {selectedCoords ? (
        <p className="text-xs font-medium text-primary/90" aria-live="polite">
          Map pin matches this suggestion&apos;s coordinates — edit the text to search again.
        </p>
      ) : null}

      {hint && !error ? (
        <p id={`${uid}-hint`} className="text-xs text-neutral-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${uid}-error`} className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {showPanel ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg shadow-neutral-950/15"
          onMouseDown={(e) => e.preventDefault()}
        >
          {loading ? (
            <li className="px-3 py-2.5 text-sm text-neutral-500" aria-live="polite">
              Searching places…
            </li>
          ) : null}
          {softError && !loading ? (
            <li className="px-3 py-2.5 text-sm text-amber-800" role="status">
              {softError}
            </li>
          ) : null}
          {!loading &&
            suggestions.map((s) => (
              <li key={s.id} role="option">
                <button
                  type="button"
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm text-neutral-900 hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none"
                  onClick={() => handlePick(s)}
                >
                  <span className="font-medium leading-snug">{s.label}</span>
                  {s.placeType ? (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{s.placeType}</span>
                  ) : null}
                  <span className="sr-only">
                    latitude {s.lat}, longitude {s.lng}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
