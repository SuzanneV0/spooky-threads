export type Tier = {
  slug: string;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  featured?: boolean;
};

export const subscriptionTiers: Tier[] = [
  {
    slug: "little-ghoul",
    name: "Little Ghoul",
    price: 20,
    tagline: "A fresh tee, every month.",
    features: ["1 new T-shirt each month", "Free shipping", "Cancel anytime"],
  },
  {
    slug: "wicked-witch",
    name: "Wicked Witch",
    price: 60,
    tagline: "Double the cozy, double the spooky.",
    features: [
      "1 new T-shirt each month",
      "1 new sweater each month",
      "Free shipping",
      "Cancel anytime",
    ],
    featured: true,
  },
  {
    slug: "grand-reaper",
    name: "Grand Reaper",
    price: 75,
    tagline: "The full haunted haul, your way.",
    features: [
      "1 new T-shirt each month",
      "1 new sweater each month",
      "Your choice of mug, tumbler, hat, or beanie",
      "Free shipping",
      "Cancel anytime",
    ],
  },
];

export function getTierBySlug(slug: string | null | undefined) {
  return subscriptionTiers.find((t) => t.slug === slug) ?? null;
}
