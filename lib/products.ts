export type Product = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  image: string;
};

export const products: Product[] = [
  {
    id: "reaper-hoodie",
    name: "Reaper Hoodie",
    description: "Oversized black hoodie with embroidered scythe.",
    priceInCents: 5500,
    image: "/products/reaper-hoodie.png",
  },
  {
    id: "witching-hour-tee",
    name: "Witching Hour Tee",
    description: "Soft cotton tee, glow-in-the-dark print.",
    priceInCents: 2800,
    image: "/products/witching-hour-tee.png",
  },
  {
    id: "jack-o-socks",
    name: "Jack-O'-Lantern Socks",
    description: "Crew socks with a pumpkin grin.",
    priceInCents: 1200,
    image: "/products/jack-o-socks.png",
  },
];
