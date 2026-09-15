import Image from "next/image";
import ProductRow from "@/components/ProductRow";
import { getProductsByThemeSlug } from "@/lib/queries";

export default async function Home() {
  const [newArrivals, halloween, fall] = await Promise.all([
    getProductsByThemeSlug("new", 10),
    getProductsByThemeSlug("halloween"),
    getProductsByThemeSlug("fall"),
  ]);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>🎃 Spooky Threads</h1>
          <p>Halloween apparel and home goods, cursed to look this good all season long.</p>
        </div>
      </section>

      <section className="hero-banner">
        <Image
          src="/hero-banner.jpg"
          alt="Two friends in pumpkin-head costumes"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 42%" }}
        />
      </section>

      <ProductRow title="New Arrivals" href="/collections/new" products={newArrivals} />
      <ProductRow title="Halloween Must-Haves" href="/collections/halloween" products={halloween} />
      <ProductRow title="Cozy Fall Favorites" href="/collections/fall" products={fall} />
    </>
  );
}
