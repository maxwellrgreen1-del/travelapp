import type { ChangeEventHandler, InputHTMLAttributes } from "react";

import { cx } from "@/lib/utils";

type SearchBarProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  value: string;
  onChange: (next: string) => void;
  /** Optional narration under the capsule (screen reader friendly when blank). */
  hint?: string;
  onClear?: () => void;
};

/**
 * Instagram-search inspired capsule with roomy tap targets + focused ring.
 */
export function SearchBar({ value, onChange, hint, placeholder, onClear, className, disabled, id: idProp, ...rest }: SearchBarProps) {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.value);
  };

  const inputId = idProp ?? "tript-explore-search";
  const showClear = Boolean(value) && typeof onClear === "function";

  return (
    <div className={cx("w-full space-y-2", className)}>
      <label className="sr-only" htmlFor={inputId}>
        Explore trippers, itineraries, palettes
      </label>
      <div
        className={cx(
          "relative flex items-center rounded-[22px] border border-neutral-200/90 bg-white/95 shadow-lg shadow-neutral-950/15 outline-none backdrop-blur",
          "ring-primary/35 transition hover:border-primary/65 focus-within:border-primary focus-within:ring-4",
          disabled ? "opacity-60" : "",
        )}
      >
        <MagnifierGlyph className="pointer-events-none ml-5 text-neutral-400" />

        <input
          {...rest}
          id={inputId}
          type="search"
          inputMode="search"
          autoComplete="off"
          autoCapitalize="none"
          aria-describedby={hint ? `${inputId}-hint` : undefined}
          className={cx(
            "w-full border-0 bg-transparent py-[14px] pl-4 pr-10 text-[16px] text-neutral-900 outline-none placeholder:text-neutral-400",
            "caret-primary focus:ring-0",
          )}
          placeholder={placeholder ?? "Dream up a cobalt coast, ramen crawl, crater trek…"}
          value={value}
          disabled={disabled}
          onChange={handleChange}
        />

        {showClear ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            className="absolute right-[15px] top-1/2 size-11 -translate-y-1/2 rounded-xl text-lg text-neutral-500 outline-none ring-primary/45 transition hover:bg-primary/15 hover:text-primary focus-visible:ring-4 disabled:opacity-40"
          >
            ×
          </button>
        ) : null}
      </div>
      {hint ? (
        <p id={`${inputId}-hint`} className="px-1 text-[13px] text-neutral-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function MagnifierGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="m20 20-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
