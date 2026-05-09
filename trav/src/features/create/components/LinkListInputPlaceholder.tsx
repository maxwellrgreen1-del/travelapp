"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cx } from "@/lib/utils";

export type CreatorLinkDraft = {
  id: string;
  label: string;
  url: string;
};

type LinkListInputPlaceholderProps = {
  links: CreatorLinkDraft[];
  onLinksChange: (next: CreatorLinkDraft[]) => void;
  disabled?: boolean;
};

function uuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `link_${Math.random().toString(16).slice(2)}`;
}

export function LinkListInputPlaceholder({
  links,
  onLinksChange,
  disabled = false,
}: LinkListInputPlaceholderProps) {
  function addBlankRow() {
    if (disabled) return;
    onLinksChange([...links, { id: uuid(), label: "", url: "" }]);
  }

  function updateRow(rowId: string, patch: Partial<Omit<CreatorLinkDraft, "id">>) {
    if (disabled) return;
    onLinksChange(
      links.map((row) => {
        if (row.id !== rowId) return row;
        return { ...row, ...patch };
      }),
    );
  }

  function removeRow(rowId: string) {
    if (disabled) return;
    onLinksChange(links.filter((link) => link.id !== rowId));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900">External links</p>
          <p className="text-xs leading-relaxed text-neutral-600">
            Trail blogs, ticketing pages, playlists — anything collaborators should poke.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={addBlankRow}>
          Add link
        </Button>
      </div>

      {links.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-3 py-3 text-xs text-neutral-600">
          No outbound links pinned yet — tap{" "}
          <span className="font-semibold text-neutral-900">Add link</span> to sketch your stack.
        </p>
      ) : (
        <ul className="space-y-3">
          {links.map((row, index) => (
            <li
              key={row.id}
              className={cx(
                "space-y-2 rounded-[20px] border border-neutral-200 bg-white px-4 py-3 shadow-[0_10px_30px_-25px_rgba(15,23,42,0.45)]",
                disabled ? "opacity-65" : "",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">#{index + 1}</span>
                <span className="flex-1" />
                {!disabled ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600 outline-none ring-red-300/35 transition hover:underline focus-visible:ring-4"
                    onClick={() => removeRow(row.id)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <Input
                label="Label"
                placeholder="Guidebook excerpt"
                value={row.label}
                disabled={disabled}
                onChange={(event) => updateRow(row.id, { label: event.target.value })}
              />
              <Input
                label="URL"
                type="url"
                inputMode="url"
                placeholder="https://trailmaps.example.org/gpx"
                value={row.url}
                disabled={disabled}
                onChange={(event) => updateRow(row.id, { url: event.target.value })}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
