import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/queries";

export default function ProductRow({
  title,
  href,
  products,
  cols = 4,
}: {
  title: string;
  href: string;
  products: Product[];
  cols?: 3 | 4;
}) {
  if (products.length === 0) return null;

  return (
    <section className="home-row container">
      <div className="home-row-heading">
        <h2>{title}</h2>
        <Link href={href}>Shop all →</Link>
      </div>
      <div className={`grid cols-${cols}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
