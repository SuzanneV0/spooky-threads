export type Motif = "bat" | "pumpkin" | "ghost" | "cat" | "witch" | "monster" | "leaf" | "moon" | null;

export const productMotifs: Record<string, Motif> = {
  "haunted-manor-sweater": "ghost",
  "trick-or-tee": "pumpkin",
  "candy-corn-beanie": "pumpkin",
  "harvest-cable-knit": "leaf",
  "autumn-leaves-tee": "leaf",
  "cinnamon-spice-cap": "leaf",
  "midnight-bat-sweater": "bat",
  "black-cat-crossing-tee": "cat",
  "bat-silhouette-beanie": "bat",
  "pumpkin-patch-pullover": "pumpkin",
  "lil-pumpkin-tee": "pumpkin",
  "pumpkin-stem-cap": "pumpkin",
  "enchanted-broomstick-sweater": "witch",
  "spellbound-tee": "witch",
  "witchs-hat-beanie": "witch",
  "googly-eyes-monster-sweater": "monster",
  "monster-mash-tee": "monster",
  "fuzzy-fangs-cap": "monster",
  "boo-crew-sweater": "ghost",
  "friendly-ghost-tee": "ghost",
  "ghostly-glow-beanie": "ghost",
  "cauldron-bubble-cardigan": "witch",
  "fresh-frights-tee": "moon",
  "newmoon-beanie": "moon",
  "boo-tiful-morning-mug": "ghost",
  "pumpkin-spice-mug": "pumpkin",
  "witch-please-mug": "witch",
  "ghosted-travel-tumbler": "ghost",
  "black-cat-cold-cup": "cat",
  "monster-munch-tumbler": "monster",
  "cozy-cobweb-throw": "bat",
  "autumn-harvest-throw": "leaf",
  "pumpkin-patch-throw": "pumpkin",
};

export const colorways: Array<{ bg: string; fg: string; accent: string }> = [
  { bg: "#a88bc1", fg: "#19171c", accent: "#f4d48d" },
  { bg: "#c49aa5", fg: "#19171c", accent: "#e6ddce" },
  { bg: "#91b7c5", fg: "#19171c", accent: "#fdb17a" },
  { bg: "#fdb17a", fg: "#19171c", accent: "#a88bc1" },
  { bg: "#f4d48d", fg: "#19171c", accent: "#19171c" },
  { bg: "#b6b0b7", fg: "#19171c", accent: "#c49aa5" },
];

export function colorwayFor(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return colorways[hash % colorways.length];
}
