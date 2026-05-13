import { NextResponse } from "next/server";

import type { LocationSuggestion } from "@/lib/geo/locationSuggestion";
import { nominatimSearchSuggestions } from "@/lib/geo/nominatimSearchSuggestions";

/**
 * Autocomplete proxy — browser calls this route only; Nominatim is never contacted from the client.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 3) {
    return NextResponse.json({ suggestions: [] as LocationSuggestion[] });
  }

  if (q.length > 200) {
    return NextResponse.json({ suggestions: [] as LocationSuggestion[] });
  }

  const suggestions = await nominatimSearchSuggestions(q);
  return NextResponse.json({ suggestions });
}
