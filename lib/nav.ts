export type NavItem = { label: string; href: string };
export type NavSection = { label: string; href: string; items: NavItem[] };

export const mainNav: NavSection[] = [
  {
    label: "Collections",
    href: "/collections",
    items: [
      { label: "Halloween", href: "/collections/halloween" },
      { label: "Fall", href: "/collections/fall" },
      { label: "Bats and Cats", href: "/collections/bats-and-cats" },
      { label: "Cute Pumpkins", href: "/collections/cute-pumpkins" },
      { label: "Magical Witches", href: "/collections/magical-witches" },
      { label: "Monsters Galore", href: "/collections/monsters-galore" },
      { label: "Spooky Ghosts", href: "/collections/spooky-ghosts" },
      { label: "New", href: "/collections/new" },
      { label: "Sweaters", href: "/collections/sweaters" },
      { label: "Shirts", href: "/collections/shirts" },
      { label: "Hats", href: "/collections/hats" },
    ],
  },
  {
    label: "Women",
    href: "/collections/women",
    items: [
      { label: "Sweaters", href: "/collections/women-sweaters" },
      { label: "Shirts", href: "/collections/women-shirts" },
    ],
  },
  {
    label: "Men",
    href: "/collections/men",
    items: [
      { label: "Sweaters", href: "/collections/men-sweaters" },
      { label: "Shirts", href: "/collections/men-shirts" },
    ],
  },
  {
    label: "Accessories",
    href: "/collections/accessories",
    items: [
      { label: "Mugs", href: "/collections/mugs" },
      { label: "Tumblers", href: "/collections/tumblers" },
    ],
  },
  {
    label: "Home Decor",
    href: "/collections/home-decor",
    items: [{ label: "Blankets", href: "/collections/blankets" }],
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    items: [],
  },
  {
    label: "Quiz",
    href: "/quiz",
    items: [],
  },
];

export const footerLinks: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Whimsical Goth, Year-Round", href: "/whimsical-goth" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Shipping Information", href: "/shipping-information" },
  { label: "Order Information", href: "/order-information" },
  { label: "Return Policy", href: "/return-policy" },
];
