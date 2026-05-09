export type TravelerAtlasPin = {
  id: string;
  label: string;
  caption: string;
  /** Placement inside TravelMapPreview (percent of preview box). */
  topPct: number;
  leftPct: number;
};

export type TravelerProfileGridPost = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  accent: string;
};

export type TravelerSavedSpot = {
  id: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  mood: string;
};

export type MockTravelerSocialProfile = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  avatarAlt: string;
  initialsFallback: string;
  followersCount: number;
  followingCount: number;
  postsPublished: number;
  memberSinceCopy: string;
};

export const mockTravelerSocial: MockTravelerSocialProfile = {
  displayName: "Maya Reyes",
  username: "maya.outbound",
  bio: "Chasing cobalt lakes, choral vespers at cliff-monasteries, and whatever locals pour into ceramic cups. Glacier guide by winter · slow travel editor by GSM.",
  avatarUrl:
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&w=560&q=80&fit=crop",
  avatarAlt: "Portrait of Maya Reyes with salt-wind braid and alpaca shawl fringe.",
  initialsFallback: "MR",
  followersCount: 12450,
  followingCount: 318,
  postsPublished: 54,
  memberSinceCopy: "Wayfinder since 2021",
};

export const mockAtlasPins: TravelerAtlasPin[] = [
  {
    id: "pin-brisbane",
    label: "Brisbane",
    caption: "River markets + violet jacarandas",
    topPct: 78,
    leftPct: 86,
  },
  {
    id: "pin-kyoto",
    label: "Kyoto",
    caption: "Dawn incense under cedar",
    topPct: 52,
    leftPct: 88,
  },
  {
    id: "pin-reykjavik",
    label: "Reykjavik",
    caption: "Basalt baths + choral wind",
    topPct: 32,
    leftPct: 44,
  },
  {
    id: "pin-cusco",
    label: "Cusco",
    caption: "Quechua weavings + cobalt sky",
    topPct: 70,
    leftPct: 28,
  },
  {
    id: "pin-lagos",
    label: "Lagos",
    caption: "Lagoon cobalt + pepper soup",
    topPct: 58,
    leftPct: 48,
  },
];

export const mockProfileTrailPosts: TravelerProfileGridPost[] = [
  {
    id: "post-banff-canoe-m",
    title: "Moraine cobalt",
    subtitle: "Alberta glacier wind",
    imageUrl:
      "https://images.unsplash.com/photo-1549880338-65ddcdfdcab6?auto=format&w=920&q=80&fit=crop",
    accent: "#2d6dff",
  },
  {
    id: "grid-lagos-sunrise",
    title: "Lagos tide shift",
    subtitle: "Smoke + cobalt surf",
    imageUrl:
      "https://images.unsplash.com/photo-1613395877344-bc4cbf7e6f73?auto=format&w=920&q=80&fit=crop",
    accent: "#2f6bff",
  },
  {
    id: "grid-marrakech-riad",
    title: "Riad brass glow",
    subtitle: "Marrakech medina",
    imageUrl:
      "https://images.unsplash.com/photo-1547036967-23d11aaca7fb?auto=format&w=920&q=80&fit=crop",
    accent: "#c46b2f",
  },
  {
    id: "grid-bagan-flight",
    title: "Bagan wicker cold",
    subtitle: "Mosaic dawn swarm",
    imageUrl:
      "https://images.unsplash.com/photo-1553603227-2358aeeb821e?auto=format&w=920&q=80&fit=crop",
    accent: "#d07b3c",
  },
  {
    id: "grid-svalbard-tones",
    title: "Polar blue hour",
    subtitle: "Svalbard husky glide",
    imageUrl:
      "https://images.unsplash.com/photo-1579033461380-adbffd8fdc6f?auto=format&w=920&q=80&fit=crop",
    accent: "#3f7dcf",
  },
  {
    id: "grid-lima-ceviche",
    title: "Lima ceviche halo",
    subtitle: "Ocean mist + rocoto",
    imageUrl:
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&w=920&q=80&fit=crop",
    accent: "#d06b4b",
  },
];

export const mockSavedDestinationBoard: TravelerSavedSpot[] = [
  {
    id: "save-faro",
    name: "Faro cliffs · Algarve",
    subtitle: "Salt mist + custard tarts",
    imageUrl:
      "https://images.unsplash.com/photo-1505761671935-60b3a742247d?auto=format&w=720&q=80&fit=crop",
    mood: "Cliff-lit",
  },
  {
    id: "save-hokkaido",
    name: "Niseko ridge line",
    subtitle: "Powder telegraph poles",
    imageUrl:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&w=720&q=80&fit=crop",
    mood: "Subzero blush",
  },
  {
    id: "save-sicily",
    name: "Noto Baroque blush",
    subtitle: "Sicilian stone + dusk",
    imageUrl:
      "https://images.unsplash.com/photo-1527838832700-b582ebb65d82?auto=format&w=720&q=80&fit=crop",
    mood: "Baroque dusk",
  },
  {
    id: "save-montenegro",
    name: "Kotor limestone fjord",
    subtitle: "Sailboats + choral bells",
    imageUrl:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&w=720&q=80&fit=crop",
    mood: "Adriatic hush",
  },
];
