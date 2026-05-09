/** Filter chips for Saved Destinations — each pin maps to exactly one bucket. */
export type SavedDestinationCategoryId =
  | "coastal-quiet"
  | "alpine-wire"
  | "urban-taste"
  | "spirit-trail"
  | "rail-sway";

export type SavedDestinationPin = {
  id: string;
  name: string;
  /** e.g. "Portugal · Algarve" */
  countryRegion: string;
  imageUrl: string;
  imageAlt: string;
  whySaved: string;
  savedAtISO: string;
  tags: string[];
  categoryId: SavedDestinationCategoryId;
  /** Deep link to an existing recap when we have one; explore-only pins use null */
  relatedPostId: string | null;
};

export const savedDestinationCategoryOptions: ReadonlyArray<{
  id: SavedDestinationCategoryId;
  label: string;
}> = [
  { id: "coastal-quiet", label: "Quiet coasts" },
  { id: "alpine-wire", label: "Peaks & wind" },
  { id: "urban-taste", label: "Night cities & bites" },
  { id: "spirit-trail", label: "Temples & culture" },
  { id: "rail-sway", label: "Trains & map lines" },
];

/**
 * Maya’s wish compass — seeded list (8+) until Supabase sync ships.
 */
export const mockSavedDestinationPins: SavedDestinationPin[] = [
  {
    id: "pin-faro-cliffs",
    name: "Faro cliffs",
    countryRegion: "Portugal · Algarve",
    imageUrl:
      "https://images.unsplash.com/photo-1505761671935-60b3a742247d?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Sunlit limestone cliffs plunging toward turquoise Mediterranean water.",
    whySaved:
      "Bookmarked after a sailor said the salt lamps at dusk rival Santorini without the swarm — custard tarts for ferry fuel.",
    savedAtISO: "2026-05-09T07:42:11.000Z",
    tags: ["sea glass", "salt mist", "tile roofs"],
    categoryId: "coastal-quiet",
    relatedPostId: null,
  },
  {
    id: "pin-niseko-ridge",
    name: "Niseko cedar ridge",
    countryRegion: "Japan · Hokkaido",
    imageUrl:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Snow-laden birch forest edging a ski ridge under pale winter sky.",
    whySaved:
      "Powder etiquette thread + onsen rotations — promised myself a telemarked sunset before the birch buds break.",
    savedAtISO: "2026-05-08T19:06:54.000Z",
    tags: ["powder braid", "cedar steam", "dawn ropes"],
    categoryId: "alpine-wire",
    relatedPostId: "explorer-post-banff",
  },
  {
    id: "pin-noto-baroque",
    name: "Noto Baroque blush",
    countryRegion: "Italy · Sicily",
    imageUrl:
      "https://images.unsplash.com/photo-1527838832700-b582ebb65d82?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Golden limestone church facade glowing in Sicilian dusk light.",
    whySaved:
      "Needed a stone symphony after Lisbon tiles — apricot dusk + almond granita pacing with brass choirs downtown.",
    savedAtISO: "2026-05-08T12:51:03.000Z",
    tags: ["baroque hush", "stone syrup", "orchard wind"],
    categoryId: "spirit-trail",
    relatedPostId: "explorer-post-siena-hill",
  },
  {
    id: "pin-kotor-adriatic",
    name: "Kotor limestone fjord",
    countryRegion: "Montenegro · Bay of Kotor",
    imageUrl:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Sailboats drifting in calm water between steep coastal mountains.",
    whySaved:
      "Harbor bells braid with choral practice — earmarked for a slow ferry week with graphite sketchpads only.",
    savedAtISO: "2026-05-07T21:03:41.000Z",
    tags: ["Adriatic hush", "limestone choir", "sail slack"],
    categoryId: "coastal-quiet",
    relatedPostId: "explorer-post-porto-stairs",
  },
  {
    id: "pin-lofoten-docks",
    name: "Lofoten fishing docks",
    countryRegion: "Norway · Nordland",
    imageUrl:
      "https://images.unsplash.com/photo-1579033461380-adbffd8fdc6f?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Red wooden fisherman cabins lining a snowy fjord shore beneath auroral sky.",
    whySaved:
      "Stockfish smoke + cobalt hour — layering this after Svalbard huskies to compare polar glass side by side.",
    savedAtISO: "2026-05-06T09:58:02.000Z",
    tags: ["Arctic cobalt", "stockfish braid", "rye bread steam"],
    categoryId: "alpine-wire",
    relatedPostId: "explorer-post-svalbard-night",
  },
  {
    id: "pin-luang-water",
    name: "Luang Prabang river bend",
    countryRegion: "Laos · Mekong",
    imageUrl:
      "https://images.unsplash.com/photo-1559629799-839cacd6dcda?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Mekong river at golden hour with forested hills and sampan silhouette.",
    whySaved:
      "Monk-photo ethics doc flagged this sunrise alms choreography — vowed to haul only silent shutters.",
    savedAtISO: "2026-05-05T16:41:52.000Z",
    tags: ["monk braid", "mango mist", "saffron arcs"],
    categoryId: "spirit-trail",
    relatedPostId: "explorer-post-maldives-swim",
  },
  {
    id: "pin-mendoza-vines",
    name: "Mendoza foothill vines",
    countryRegion: "Argentina · Mendoza",
    imageUrl:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Andean vineyard rows with snow-capped peaks in the distance.",
    whySaved:
      "Malbec flight plus paraglider wind rose — tucking beside Patagonia trek notes until Andean ridge season aligns.",
    savedAtISO: "2026-05-05T08:07:09.000Z",
    tags: ["Malbec braid", "condor arcs", "adobe dusk"],
    categoryId: "alpine-wire",
    relatedPostId: "post-patagonia-trek-t",
  },
  {
    id: "pin-madeira-ledges",
    name: "Madeira irrigation ledges",
    countryRegion: "Portugal · Madeira",
    imageUrl:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5817?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Steep emerald terraces watered by levada channels carved into volcanic slopes.",
    whySaved:
      "Levada whistles + custard tart pit stops — quieter Atlantic foil to Azores gale chasing.",
    savedAtISO: "2026-05-03T04:52:41.000Z",
    tags: ["levada hush", "banana mist", "cliff ribbons"],
    categoryId: "coastal-quiet",
    relatedPostId: null,
  },
  {
    id: "pin-chefchaouen-maze",
    name: "Chefchaouen cobalt maze",
    countryRegion: "Morocco · Rif Mountains",
    imageUrl:
      "https://images.unsplash.com/photo-1574950642193-956a5d6d5d76?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Narrow alley of blue-washed Moroccan buildings with potted plants on steps.",
    whySaved:
      "After Marrakech brass glare I needed rinsed blues — earmarked sunrise before spice trucks wake the medina.",
    savedAtISO: "2026-05-02T18:09:51.000Z",
    tags: ["indigo hush", "mint tea braid", "Rif vapour"],
    categoryId: "urban-taste",
    relatedPostId: "grid-marrakech-riad",
  },
  {
    id: "pin-galapagos-tide",
    name: "Galápagos tide pools",
    countryRegion: "Ecuador · Galápagos",
    imageUrl:
      "https://images.unsplash.com/photo-1583212292454-1fe62296026b?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Marine iguana on volcanic rock beside turquoise tidal shallows.",
    whySaved:
      "Ethics checklist flagged responsible skiff spacing — pinning before any marine iguana timelapse ideas ship.",
    savedAtISO: "2026-04-30T12:07:43.000Z",
    tags: ["iguana braid", "lava cobalt", "tide prism"],
    categoryId: "coastal-quiet",
    relatedPostId: "explorer-post-cebu-whale",
  },
  {
    id: "pin-transylvania-train",
    name: "Sighișoara clock tower",
    countryRegion: "Romania · Transylvania",
    imageUrl:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&w=960&q=80&fit=crop",
    imageAlt: "Medieval citadel towers and pastel facades atop a wooded hillcrest.",
    whySaved:
      "Night trains from Budapest plus fortified church acoustics — earmarked as the hinge leg on a Bram Stoker-era slow rail map.",
    savedAtISO: "2026-04-28T14:53:57.000Z",
    tags: ["clock braid", "saxophone dusk", "plum distill"],
    categoryId: "rail-sway",
    relatedPostId: "post-lisbon-tram-l",
  },
];
