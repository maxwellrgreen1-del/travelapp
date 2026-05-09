"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type PlacesVisitedInputPlaceholderProps = {
  places: string[];
  onPlacesChange: (next: string[]) => void;
  disabled?: boolean;
};

/**
 * One input per waypoint until the traveler stops adding hops.
 * Keep at least one row so the composer never collapses abruptly.
 */
export function PlacesVisitedInputPlaceholder({
  places,
  onPlacesChange,
  disabled = false,
}: PlacesVisitedInputPlaceholderProps) {
  const rows = places.length > 0 ? places : [""];

  function updateRow(index: number, value: string) {
    const next = [...rows];
    next[index] = value;
    onPlacesChange(next);
  }

  function addRow() {
    onPlacesChange([...rows, ""]);
  }

  function removeRow(index: number) {
    if (rows.length === 1) {
      updateRow(0, "");
      return;
    }
    onPlacesChange(rows.filter((_, cursor) => cursor !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900">Places visited</p>
          <p className="text-xs leading-relaxed text-neutral-600">
            One row per waypoint. Map pins attach once Supabase geodata ships.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={addRow}>
          Another stop
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((value, index) => (
          <div key={`place_${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                label={`Waypoint ${index + 1}`}
                placeholder="Glacier viewpoint · Patagonia"
                value={value}
                disabled={disabled}
                onChange={(event) => updateRow(index, event.target.value)}
              />
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeRow(index)}
              className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-red-700 outline-none ring-red-300/35 transition hover:bg-red-50 focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
