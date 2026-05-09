/** Category identifiers line up with `DestinationChip` selections. */

export type ExploreCategoryId =
  | "mountains"
  | "coast"
  | "city"
  | "culture"
  | "wildlife"
  | "trail";

export type ExploreCategoryChip = {
  id: ExploreCategoryId;
  label: string;
  subtitle: string;
};

export type TrendingExploreDestination = {
  id: string;
  title: string;
  country: string;
  subtitle: string;
  imageUrl: string;
  heatScore: number;
  categories: ExploreCategoryId[];
};

export type SuggestedExplorer = {
  id: string;
  displayName: string;
  username: string;
  initials: string;
  avatarUrl?: string;
  tagline: string;
  followersLabel: string;
  signatureTags: ExploreCategoryId[];
};

export type PopularExploreTrip = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  categories: ExploreCategoryId[];
};

export const exploreCategoryCatalog: ExploreCategoryChip[] = [
  { id: "mountains", label: "Peaks & passes", subtitle: "Glacier ridges" },
  { id: "coast", label: "Ocean spray", subtitle: "Blue-hour docks" },
  { id: "city", label: "City pulse", subtitle: "Metro nights" },
  { id: "culture", label: "Culture digs", subtitle: "Markets / mosques" },
  { id: "wildlife", label: "Wildlife gaze", subtitle: "Safaris + fjords" },
  { id: "trail", label: "Thru-hikes", subtitle: "Pinned trailheads" },
];

export const trendingExplorePlaces: TrendingExploreDestination[] = [
  {
    id: "trend-lhofoten",
    title: "Lofoten ridges",
    country: "Norway",
    subtitle: "Cabin smoke + cobalt fjords",
    imageUrl:
      "https://images.unsplash.com/photo-1508873699372-7aeaeb60bd13?auto=format&w=720&q=80&fit=crop",
    heatScore: 981,
    categories: ["coast", "mountains"],
  },
  {
    id: "trend-kyoto-tea",
    title: "Kyoto moss gardens",
    country: "Japan",
    subtitle: "Tea lanterns + barefoot tatami hops",
    imageUrl:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&w=720&q=80&fit=crop",
    heatScore: 902,
    categories: ["culture", "trail"],
  },
  {
    id: "trend-lima-fog",
    title: "Lima pastel cliffs",
    country: "Peru",
    subtitle: "Paragliders skim meringue pastel blocks",
    imageUrl:
      "https://images.unsplash.com/photo-1531968455333-efc78d2cfe2f?auto=format&w=720&q=80&fit=crop",
    heatScore: 844,
    categories: ["coast", "city"],
  },
  {
    id: "trend-marrakech",
    title: "Marrakech riad glow",
    country: "Morocco",
    subtitle: "Copper spoons + choral muezzins",
    imageUrl:
      "https://images.unsplash.com/photo-1547036967-23d11aaca7fb?auto=format&w=720&q=80&fit=crop",
    heatScore: 812,
    categories: ["culture", "city"],
  },
  {
    id: "trend-banff-canoe",
    title: "Moraine canoe glow",
    country: "Canada",
    subtitle: "Pre-wind teal glass + moose prints",
    imageUrl:
      "https://images.unsplash.com/photo-1549880338-65ddcdfdcab6?auto=format&w=720&q=80&fit=crop",
    heatScore: 1055,
    categories: ["mountains", "trail"],
  },
  {
    id: "trend-masaimara",
    title: "Maasai Mara gold",
    country: "Kenya",
    subtitle: "Dust halo + zebra shimmer",
    imageUrl:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01fca?auto=format&w=720&q=80&fit=crop",
    heatScore: 922,
    categories: ["wildlife", "trail"],
  },
];

export const suggestedTravelExplorers: SuggestedExplorer[] = [
  {
    id: "exp-maya-outbound",
    displayName: "Maya Reyes",
    username: "maya.outbound",
    initials: "MR",
    avatarUrl:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&w=240&q=80&fit=crop",
    tagline: "Glacier crossings + ramen pop-ups nightly debrief.",
    followersLabel: "12.4k dreamers",
    signatureTags: ["mountains", "coast"],
  },
  {
    id: "exp-nomad-nina",
    displayName: "Nina Kovacs",
    username: "_nina_nomads",
    initials: "NK",
    avatarUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&w=240&q=80&fit=crop",
    tagline: "Film stocks + Iberian tile hunts · slow ferries forever.",
    followersLabel: "8.9k scouts",
    signatureTags: ["city", "culture"],
  },
  {
    id: "exp-liamscapes",
    displayName: "Liam Ó Murchú",
    username: "liamscapes",
    initials: "LÓ",
    tagline: "Drone logs + peat smoke · Irish seaboard obsessive.",
    followersLabel: "6.7k sails",
    signatureTags: ["coast", "wildlife"],
  },
  {
    id: "exp-zara-explores",
    displayName: "Zara Malik",
    username: "zara.explores",
    initials: "ZM",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&w=240&q=80&fit=crop",
    tagline: "Train bunk beds + Himalayan tea stops documented weekly.",
    followersLabel: "15.8k conductors",
    signatureTags: ["trail", "mountains"],
  },
  {
    id: "exp-tomas-arco",
    displayName: "Tomás Arévalo",
    username: "tomas.arco",
    initials: "TA",
    tagline: "Patagonian wind grammar + campfire physics.",
    followersLabel: "5.6k crampon crew",
    signatureTags: ["trail", "mountains"],
  },
];

export const popularExplorePosts: PopularExploreTrip[] = [
  {
    id: "explorer-post-banff",
    title: "Gale teal glass",
    subtitle: "Alberta glacier hour",
    imageUrl:
      "https://images.unsplash.com/photo-1549880338-65ddcdfdcab6?auto=format&w=900&q=80&fit=crop",
    categories: ["mountains", "trail"],
  },
  {
    id: "explorer-post-porto-stairs",
    title: "Porto cobalt stairs",
    subtitle: "Tile river nights",
    imageUrl:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&w=880&q=80&fit=crop",
    categories: ["city", "culture"],
  },
  {
    id: "explorer-post-maldives-swim",
    title: "Overwater cobalt",
    subtitle: "Sunrise hammock haul",
    imageUrl:
      "https://images.unsplash.com/photo-1506929562872-bbb421befebf?auto=format&w=880&q=80&fit=crop",
    categories: ["coast", "wildlife"],
  },
  {
    id: "explorer-post-svalbard-night",
    title: "Svalbard indigo sled",
    subtitle: "Auroral dog teams",
    imageUrl:
      "https://images.unsplash.com/photo-1579033461380-adbffd8fdc6f?auto=format&w=880&q=80&fit=crop",
    categories: ["wildlife", "mountains"],
  },
  {
    id: "explorer-post-cebu-whale",
    title: "Cebu cobalt shoal",
    subtitle: "Whale shark swirl",
    imageUrl:
      "https://images.unsplash.com/photo-1570503826628-1b693dbc8c18?auto=format&w=880&q=80&fit=crop",
    categories: ["coast", "wildlife"],
  },
  {
    id: "explorer-post-siena-hill",
    title: "Siena hill copper",
    subtitle: "Rooftops + choral bells",
    imageUrl:
      "https://images.unsplash.com/photo-1570168007204-dfb528695745?auto=format&w=880&q=80&fit=crop",
    categories: ["culture", "trail"],
  },
  {
    id: "explorer-post-tokyo-crossing",
    title: "Shibuya crosswalk prism",
    subtitle: "Metro vapor + ramen steam",
    imageUrl:
      "https://images.unsplash.com/photo-1549692520-acc666adf8fb?auto=format&w=880&q=80&fit=crop",
    categories: ["city", "trail"],
  },
  {
    id: "explorer-post-cusco-steps",
    title: "Cusco cobalt steps",
    subtitle: "Weavings + cobalt sky bruise",
    imageUrl:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&w=880&q=80&fit=crop",
    categories: ["culture", "trail"],
  },
];
