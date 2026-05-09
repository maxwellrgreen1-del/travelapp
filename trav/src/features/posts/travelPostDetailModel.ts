import { mockTravelPosts } from "@/features/feed/mockTravelPosts";

import type { TravelFeedPost, TravelPostCommentPreview, TravelPostDetail } from "@/types";

/** Routed IDs that hydrate from an established tript timeline recap instead. */
const POST_DETAIL_ROUTE_ALIASES: Partial<Record<string, string>> = {
  "explorer-post-banff": "post-banff-canoe-m",
  /** Profile grid tiles → canonical feed / explore bodies + layers. */
  "grid-marrakech-riad": "post-marrakech-riad-r",
  "grid-bagan-flight": "post-bagan-balloon-d",
  "grid-svalbard-tones": "explorer-post-svalbard-night",
};

function seededComments(seed: number): TravelPostCommentPreview[] {
  return [
    {
      id: `c_${seed}_1`,
      authorUsername: "liamscapes",
      authorInitials: "LÓ",
      excerpt:
        "The hue palette here is messing with my Icelandic layover scouting — pinning for contrast homework.",
      postedAtISO: "2026-05-09T19:43:21.000Z",
    },
    {
      id: `c_${seed}_2`,
      authorUsername: "nima.shots",
      authorInitials: "NS",
      excerpt: "Curious whether you leaned on graphite tripod poles or trusting burst mode?",
      postedAtISO: "2026-05-09T07:52:43.000Z",
    },
    {
      id: `c_${seed}_3`,
      authorUsername: "fieldnotes_bot",
      authorInitials: "FN",
      excerpt: "Flagging this for wind lesson syllabus next season.",
      postedAtISO: "2026-05-06T06:58:58.000Z",
    },
  ];
}

const DEFAULT_DETAIL_LAYER = {
  journal:
    "tript stubs long-form journeys here until nightly Supabase sync stitches together voice memos, topo PDFs, and ferry scans.",
  placesVisited: ["Transit hub plaza", "Rooftop mirador", "Local market alley"],
  restaurants: ["Bakery with honey butter + loose leaf iced teas", "Communal diner with chalkboard specials nightly"],
  externalLinks: [
    { label: "Wind etiquette primer", url: "https://example.org/wind-etiquette" },
    { label: "Ethical traveller photo deck", url: "https://example.org/photo-etiquette" },
  ],
  commentPreview: seededComments(9090),
} satisfies Omit<TravelPostDetail, keyof TravelFeedPost>;

type DetailLayer = Pick<
  TravelPostDetail,
  "journal" | "placesVisited" | "restaurants" | "externalLinks" | "commentPreview"
>;

const FEED_DETAIL_LAYERS: Record<string, DetailLayer> = {
  "post-banff-canoe-m": {
    journal: `Lake surface held still till 06:41 — birch smoke from the scout cabin braided with condensation droplets drifting off spruce needles. Elk bugled faintly upstream, almost drowned under the thunk of graphite paddles.

We eased past berg-shadow blotches pooling like spilled ink till alpenglow slapped apricot rims on every evergreen. When gusts curled off Victoria Glacier we beached beside a braided creek, peeled soggy spray decks, and sipped cacao thick enough to coat enamel.`,
    placesVisited: [
      "Victoria Glacier crown lookout — Moraine pull-out #2",
      "Consolation Lakes sandbar dry-down",
      "Banff avenue elk choir dusk loop",
    ],
    restaurants: [
      "Bear Street nitro birch syrup latte bar",
      "Mountain merc elk ragù pies baked beside trailhead notices",
      "Tea house ramen flight + crampons-on-loan shack",
    ],
    externalLinks: [
      {
        label: "Parks Canada wind advisories",
        url: "https://www.pc.gc.ca/en/voyage-travel",
      },
      { label: "LNT shoreline camping pact", url: "https://lnt.org/learn/principle-2" },
    ],
    commentPreview: [
      {
        id: "banff-aria",
        authorUsername: "aria.ridgeflight",
        authorInitials: "AR",
        excerpt: "Ran shoreline counter-clockwise yesterday — moose prints exactly where your frame sits.",
        postedAtISO: "2026-05-09T10:51:41.000Z",
      },
      {
        id: "banff-lukas",
        authorUsername: "lukas.thermos",
        authorInitials: "LT",
        excerpt: "How rigid did graphite actually feel versus carbon?",
        postedAtISO: "2026-05-09T06:43:52.000Z",
      },
      {
        id: "banff-kit",
        authorUsername: "_kit_maps",
        authorInitials: "KM",
        excerpt: "Can you DM braided creek waypoint? SUP rehearsal next Fri.",
        postedAtISO: "2026-05-06T06:54:52.000Z",
      },
    ],
  },
  "post-lisbon-tram-l": {
    journal: `Yellow tram hinges scream sweetest after Miradouro blue hour fades into apricot balconies. Custard flake sugar dusted wrists while fado curled through wrought iron.`,
    placesVisited: ["Santa Luzia parapet", "Alfama laundry lane fresco", "LX Factory dusk flea"],
    restaurants: [
      "Vinho verde cave with seaweed-smoked tastings",
      "Brûléed nata lab behind choir school",
      "Bacalhau courtyard bunker with choral spillover",
    ],
    externalLinks: [
      { label: "Carris night grids", url: "https://www.metrolisboa.pt/eng/" },
      { label: "Azulejo field sketch pack", url: "https://example.org/azulejo-sketch" },
    ],
    commentPreview: seededComments(1201),
  },
  "post-kyoto-gate-z": {
    journal: `Torii beams still beaded with yesterday's rain — humidity turned cedar bark copper in slants of dawn. Cicadas drowned the tourists blasting cicada ringtones ironically.`,
    placesVisited: ["Fushimi summit clearing", "Takao bamboo mist detour", "Kamo midnight laundry stones"],
    restaurants: ["Shaved ice + barley milk stall", "Cedar smoked shojin supper", "Conbini melon bread midnight ritual booth"],
    externalLinks: [
      { label: "Shrine microclimate thread", url: "https://example.org/shrine-microclimate" },
      { label: "Hyperdia commuter planner", url: "https://www.hyperdia.com/" },
    ],
    commentPreview: seededComments(1202),
  },
  "post-marrakech-riad-r": {
    journal: `Plaster peeled cinnamon-style while muezzins volleyed calls. Lantern oil braided with jasmine around brass mint tea.`,
    placesVisited: ["Bahia ornate spine alley", "Koutoubia shadow nap yard", "Secret garden palm halo"],
    restaurants: ["Harira cauldron nook", "Msem skillet + honey cart", "Atlas pepper couscous hideout"],
    externalLinks: [
      { label: "Medina night photo ethos", url: "https://example.org/medina-photo" },
      { label: "Spice glossary PDF", url: "https://example.org/spice-glossary" },
    ],
    commentPreview: seededComments(1203),
  },
  "post-patagonia-trek-t": {
    journal: `Gale punched guy lines sideways like a choral director waving wind. Yerba condensation fogged binos before guanacos threaded ridgelines.`,
    placesVisited: ["Laguna Torres crampon shuffle", "Cuernos windbreak notch", "Serón birch sap tap"],
    restaurants: ["Dehydrated gnocchi + calafate drizzle", "Estancia mates + lamb empanadas", "Natales seaweed butter cellar"],
    externalLinks: [
      { label: "CONAF wind bulletin", url: "https://www.conaf.cl" },
      { label: "Pago pacing spreadsheet stub", url: "https://example.org/pago-pacing" },
    ],
    commentPreview: seededComments(1204),
  },
  "post-safari-ngong-n": {
    journal: `Cinnamon-colored dust braided under fuselage hinges. Mara lions napped midfield while zebra fringe shimmer dipped into illusion heat.`,
    placesVisited: ["Russet Mara airstrip hop", "Kopje sundowner prism", "River bend zebra dust bath arc"],
    restaurants: ["Safari baker — baobab jam campfire bread", "Tangawizi juice bunker", "Nairobi cappuccino pre-game bar"],
    externalLinks: [
      { label: "East African bird atlas", url: "https://example.org/east-african-birds" },
      { label: "Ethical jeep pact", url: "https://example.org/safari-ethics" },
    ],
    commentPreview: seededComments(1205),
  },
  "post-meteora-cliff-s": {
    journal: `Cicadas braided with choral vespers until sandstone ridges drank the late photons.`,
    placesVisited: ["Great Meteoron rope climb", "Varlaam incense spine", "Kalambaka mason lane dusk"],
    restaurants: ["Taverna honey vinegar lamb chop", "Nunnery loukoum cart", "Thessaloniki ouzo bunker"],
    externalLinks: [
      { label: "Meteora ethics PDF", url: "https://whc.unesco.org/" },
      { label: "Byzantine drone listening archive", url: "https://example.org/byzantine-drones" },
    ],
    commentPreview: seededComments(1206),
  },
  "post-bagan-balloon-d": {
    journal: `Basket wicker smelled of paraffin dew before burners roared awake. Hundreds of stupas vertebrae surfaced through coriander fog.`,
    placesVisited: ["Taungbi palm juice dawn alley", "Nyaung U balloon staging pad", "Ananda temple cobalt spine"],
    restaurants: ["Mohinga bunker + pickled tea salad", "Shadow puppet tea sala", "Mandalay roasted tea platter"],
    externalLinks: [
      { label: "Balloon wind rose stub", url: "https://example.org/bagan-winds" },
      { label: "Monk-photo respectful pact", url: "https://example.org/respectful-monk-photo" },
    ],
    commentPreview: seededComments(1207),
  },
};

/** Explorer masonry tiles mirrored from `/search` with lightweight bridge bodies until analytics merge. */
const explorerBridgeFeedBodies: TravelFeedPost[] = [
  {
    id: "explorer-post-porto-stairs",
    username: "_nina_nomads",
    userInitials: "NN",
    locationDisplay: "Ribeira · Porto",
    imageUrl:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&w=980&q=80&fit=crop",
    imageAlt: "Blue-tiled Porto stairway hugging riverfront homes overlooking the Douro.",
    title: "Porto cobalt stair chase",
    description: "Tram fumes blending with Douro cobalt glass before caves uncork tastings.",
    likesCount: 1102,
    commentsCount: 41,
    destinationTags: ["Iberian tiles", "River dusk"],
    postedAtISO: "2026-05-08T12:18:52.000Z",
  },
  {
    id: "explorer-post-maldives-swim",
    username: "zara.explores",
    userInitials: "ZM",
    locationDisplay: "North Malé Atoll",
    imageUrl:
      "https://images.unsplash.com/photo-1506929562872-bbb421befebf?auto=format&w=980&q=80&fit=crop",
    imageAlt: "Overwater cottages strung across clear turquoise lagoon reflections.",
    title: "Rope ladders + cobalt tide windows",
    description: "Coral chatter braided with hammock sway before drone halo pullbacks.",
    likesCount: 1988,
    commentsCount: 120,
    destinationTags: ["Atoll cobalt", "Reef crossings"],
    postedAtISO: "2026-05-06T06:54:54.000Z",
  },
  {
    id: "explorer-post-svalbard-night",
    username: "tomas_viaja",
    userInitials: "TV",
    locationDisplay: "Longyearbyen · Svalbard",
    imageUrl:
      "https://images.unsplash.com/photo-1579033461380-adbffd8fdc6f?auto=format&w=980&q=80&fit=crop",
    imageAlt: "Husky sled gliding under swirling auroras across polar plateau.",
    title: "Indigo sled braid",
    description: "Glove tape + husky harmonic hum while aurora arcs stacked like ribbon candy.",
    likesCount: 1404,
    commentsCount: 56,
    destinationTags: ["Polar glass", "Auroral hush"],
    postedAtISO: "2026-05-06T06:04:54.000Z",
  },
  {
    id: "explorer-post-cebu-whale",
    username: "nora.bushplane",
    userInitials: "NB",
    locationDisplay: "Oslob · Cebu",
    imageUrl:
      "https://images.unsplash.com/photo-1570503826628-1b693dbc8c18?auto=format&w=980&q=80&fit=crop",
    imageAlt: "Whale shark passing snorkel swimmers in bright blue shallows.",
    title: "Cebu cobalt shoal braid",
    description: "Freedive buddy taps + dorsal polka dots choreographed mid-morning swirl.",
    likesCount: 1684,
    commentsCount: 87,
    destinationTags: ["Reef cobalt", "Gentle giants"],
    postedAtISO: "2026-05-06T06:44:54.000Z",
  },
  {
    id: "explorer-post-siena-hill",
    username: "sofia.routes",
    userInitials: "SR",
    locationDisplay: "Val d'Orcia · Italy",
    imageUrl:
      "https://images.unsplash.com/photo-1570168007204-dfb528695745?auto=format&w=980&q=80&fit=crop",
    imageAlt: "Sunset terracotta rolling hills stitched with vineyard rows.",
    title: "Hill-town copper braid",
    description: "Cypress shadows + choral bells folding into bicycle spoke rhythm.",
    likesCount: 1230,
    commentsCount: 39,
    destinationTags: ["Tuscan dusk", "Cypress spine"],
    postedAtISO: "2026-05-06T06:24:54.000Z",
  },
  {
    id: "explorer-post-tokyo-crossing",
    username: "_liamfog",
    userInitials: "LF",
    locationDisplay: "Shibuya · Tokyo",
    imageUrl:
      "https://images.unsplash.com/photo-1549692520-acc666adf8fb?auto=format&w=980&q=80&fit=crop",
    imageAlt: "Crowded Shibuya crossing at night illuminated by storefront rain reflections.",
    title: "Prism scramble pulse",
    description: "Metro vapour braid + neon ramen halo between signal cycles.",
    likesCount: 2804,
    commentsCount: 132,
    destinationTags: ["Metro vapor", "Neon ramen"],
    postedAtISO: "2026-05-06T06:14:54.000Z",
  },
  {
    id: "explorer-post-cusco-steps",
    username: "riad_runner",
    userInitials: "RR",
    locationDisplay: "San Blas · Cusco",
    imageUrl:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&w=980&q=80&fit=crop",
    imageAlt: "Cusco stone stairway braided with cobalt sky and alpaca textiles.",
    title: "Cusco cobalt steps braid",
    description: "Weavings dripping indigo dusk + guinea pig smoke braided with corn beer.",
    likesCount: 1510,
    commentsCount: 63,
    destinationTags: ["Andean cobalt", "Weaver lanes"],
    postedAtISO: "2026-05-06T06:34:54.000Z",
  },
];

const EXPLORER_DETAIL_LAYERS: Record<string, DetailLayer> = {
  "explorer-post-porto-stairs": {
    journal:
      "Tile veins caught river spray even blocks uphill from the Douro — every landing smelled like brittle custard + wet stone.",
    placesVisited: ["Luis bridge anchor cables", "Caves across river with tawny tastings", "Clerigos spiral dusk spin"],
    restaurants: ["Francesinha bunker with chili honey", "Rooftop sardines with storm-cloud wine", "Douro snack flight mooring deck"],
    externalLinks: [
      { label: "Porto dusk photo permit PDF", url: "https://example.org/porto-photo" },
      { label: "Azulejo repair collective", url: "https://example.org/azulejo-fix" },
    ],
    commentPreview: seededComments(2101),
  },
  "explorer-post-maldives-swim": {
    journal:
      "Paraffin-soft air clung before ocean thermals lifted stilt bungalow shadows sideways — hammock slack braided with tidal math.",
    placesVisited: ["House reef mooring buoy", "Biolum plankton skim night hop", "Seaplane tie-down hammock catnap"],
    restaurants: ["Tiffin reef curry flight", "Coconut charcoal grill deck", "Coral tonic mocktail bunker"],
    externalLinks: [
      { label: "Reef-safe sunscreen lookup", url: "https://example.org/reef-safe-sunscreen" },
      { label: "Atoll etiquette compact", url: "https://example.org/atoll-respect" },
    ],
    commentPreview: seededComments(2102),
  },
  "explorer-post-svalbard-night": {
    journal:
      "Huskies leaned into gale like metronomes — sled runners sparking frost while aurora arcs stacked ribbon candy sideways.",
    placesVisited: ["Longyear glacier mouth camp", "Adventalen snow bridge", "Blues husky choral hall"],
    restaurants: ["Reindeer stew thermos bunker", "Polar bread oven bunker", "Arctic chia pudding lab"],
    externalLinks: [
      { label: "Svalbard risk primer", url: "https://sysselmesteren.no" },
      { label: "Aurora etiquette doc", url: "https://example.org/aurora-etiquette" },
    ],
    commentPreview: seededComments(2103),
  },
  "explorer-post-cebu-whale": {
    journal:
      "Salt mist braided with polka-dot whale backs — fins cut slow parabolas beneath snorkeler toes.",
    placesVisited: ["Oslob glide lane #3", "Tumalog falls rinse station", "Cebu pier night lanterns"],
    restaurants: ["Fish tin foil lunch boats", "Mango chili hut", "Salted cacao smoothie barrack"],
    externalLinks: [
      { label: "Ethical whale swim checklist", url: "https://example.org/whale-ethics" },
      { label: "Cebu buoy map", url: "https://example.org/cebu-buoys" },
    ],
    commentPreview: seededComments(2104),
  },
  "explorer-post-siena-hill": {
    journal:
      "Clay hill towns exhaled balsamic steam while cypress spines waved like choir directors.",
    placesVisited: ["Val d'Orcia cypress pull-off", "Siena campo shell climb", "Pienza pecorino overlook"],
    restaurants: ["Ribollita bunker with crackling hearth", "Pecorino flight cave", "Sangiovese prism flight"],
    externalLinks: [
      { label: "Tuscany slow drive atlas", url: "https://example.org/tuscany-slow-drive" },
      { label: "UNESCO hillside ethics", url: "https://whc.unesco.org/" },
    ],
    commentPreview: seededComments(2105),
  },
  "explorer-post-tokyo-crossing": {
    journal:
      "Neon braid refracted umbrellas while metro vapour hissed upward through grate symphonies.",
    placesVisited: ["Scramble axis epicenter", "Miyashita rooftop belt", "Golden Gai vapour slit"],
    restaurants: ["Ichiran solo booth ramen", "Conbini onigiri lab", "Yakitori bunker with melon cream soda"],
    externalLinks: [
      { label: "Tokyo manners microsite", url: "https://example.org/tokyo-manners" },
      { label: "Metro audio map", url: "https://example.org/tokyo-metro-audio" },
    ],
    commentPreview: seededComments(2106),
  },
  "explorer-post-cusco-steps": {
    journal:
      "Stone teeth bit into thin air — every landing sold woven straps soaked in cobalt dusk.",
    placesVisited: ["San Blas view spine", "Sacsay terrace dusk hop", "Qorikancha braid lane"],
    restaurants: ["Cuy smoke tent", "Purple corn custard cellar", "Chicha fermentation lab"],
    externalLinks: [
      { label: "Altitude etiquette doc", url: "https://example.org/cusco-altitude" },
      { label: "Quechua phrase mini deck", url: "https://example.org/quechua-micro" },
    ],
    commentPreview: seededComments(2107),
  },
};

/**
 * Profile-only grid IDs from `mockProfileTrailPosts` that do not duplicate a feed/masonry row verbatim.
 */
const profileGridBridgeBodies: TravelFeedPost[] = [
  {
    id: "grid-lagos-sunrise",
    username: "maya.outbound",
    userInitials: "MO",
    avatarUrl:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&w=560&q=80&fit=crop",
    locationDisplay: "Lekki · Lagos",
    imageUrl:
      "https://images.unsplash.com/photo-1613395877344-bc4cbf7e6f73?auto=format&w=920&q=80&fit=crop",
    imageAlt:
      "Sunrise glow on Atlantic swell at Lagos shoreline, warm light on surf and silhouetted palms.",
    title: "Lagos tide shift",
    description:
      "Harmattan-soft light braided smoke from coal grills into cobalt surf—we stayed till the muezzins thinned.",
    likesCount: 892,
    commentsCount: 34,
    destinationTags: ["Atlantic fringe", "Lagos cobalt", "Smoke + surf"],
    postedAtISO: "2026-05-07T08:22:11.000Z",
  },
  {
    id: "grid-lima-ceviche",
    username: "maya.outbound",
    userInitials: "MO",
    avatarUrl:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&w=560&q=80&fit=crop",
    locationDisplay: "Barranco · Lima",
    imageUrl:
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&w=920&q=80&fit=crop",
    imageAlt:
      "Ceviche dish with rocoto garnish, citrus, and translucent fish on a ceramic plate at a Lima counter.",
    title: "Lima ceviche halo",
    description:
      "Ocean mist beaded the glass-front counter while lime steam lifted off leche de tigre and rocoto confetti.",
    likesCount: 1104,
    commentsCount: 47,
    destinationTags: ["Pacific mist", "Cevichería halo", "Rocoto braid"],
    postedAtISO: "2026-05-06T05:41:02.000Z",
  },
];

const PROFILE_GRID_DETAIL_LAYERS: Record<string, DetailLayer> = {
  "grid-lagos-sunrise": {
    journal: `Dawn smelled like ozone and spiced oil before the hawkers unfolded plastic stools. Waves threw graphite ribbons against timber breakwaters while surfers counted sets in pidgin shorthand.

We followed a coal-roast smoke plume inland, traded naira coins for brittle baguette halves, then doubled back barefoot where Atlantic cobalt glassed mirror-still beside wading fishermen.`,
    placesVisited: [
      "Lekki breakwater sunrise pull — cobalt glass hour",
      "Freedom Park dusk brass braid + Afrobeat fringe",
      "Nike Arts Gallery courtyard ironwork braid",
      "Eko Atlantic sandbar braid before ferry horn",
    ],
    restaurants: [
      "Ikoyi suya bunker with Scotch bonnet honey glaze",
      "Yaba jollof basmati bunker + plantain crumble",
      "Victoria Island fish pepper soup bunker with ginger foam",
      "Champagne brunch deck with moi-moi custard flight",
    ],
    externalLinks: [
      { label: "Safe Lagos lagoon swim brief", url: "https://example.org/lagos-swim-etiquette" },
      { label: "Harmattan commuter wind rose", url: "https://example.org/harmattan-wind-map" },
    ],
    commentPreview: seededComments(5101),
  },
  "grid-lima-ceviche": {
    journal: `Counter tiles still held yesterday's seawater halo when the cook shaved rocoto curls like ribbon candy. Citrus steam fogged bifocals; every clam shell clacked applause.

We chased pisco-less micro flights through Barranco murals, slipped into Surquillo for lúcuma custard, then returned for a second tiradito while dusk turned the Pacific pewter.`,
    placesVisited: [
      "Barranco murals spine before Puente de los Suspiros dusk",
      "Surquillo market lúcuma + chirimoya bunker",
      "Miraflores malecón paraglider braid",
      "Huaca Pucllana clay spine night tour",
    ],
    restaurants: [
      "Barranco cebaría with leche de tigre syllabus flight",
      "Chorrillos anticucho bunker with rocoto mascara",
      "Chifa hallway with Chaufa prism + Inca Kola bunker",
      "Pisco-less tasting deck with causa potato prism",
    ],
    externalLinks: [
      { label: "Responsible anchovy season calendar", url: "https://example.org/peru-anchovy-season" },
      { label: "Lima BRT + coastal walkway map stub", url: "https://example.org/lima-metropolitano" },
    ],
    commentPreview: seededComments(5102),
  },
};

/**
 * Hydrate a richly mocked travel detail card by merging feed explorers + masonry tiles + profile grid tiles.
 */
export function resolveTravelPostDetail(requestedId: string): TravelPostDetail | null {
  const routedId = POST_DETAIL_ROUTE_ALIASES[requestedId] ?? requestedId;

  const feedCore = mockTravelPosts.find((post) => post.id === routedId);
  const explorerBridgeCore = explorerBridgeFeedBodies.find(
    (post) => post.id === requestedId || post.id === routedId,
  );
  const profileGridCore = profileGridBridgeBodies.find(
    (post) => post.id === requestedId || post.id === routedId,
  );
  const core = feedCore ?? explorerBridgeCore ?? profileGridCore ?? null;

  if (!core) {
    return null;
  }

  const layer =
    FEED_DETAIL_LAYERS[routedId] ??
    FEED_DETAIL_LAYERS[core.id] ??
    EXPLORER_DETAIL_LAYERS[core.id] ??
    PROFILE_GRID_DETAIL_LAYERS[core.id] ??
    DEFAULT_DETAIL_LAYER;

  return {
    ...core,
    ...layer,
  };
}
