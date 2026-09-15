import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/queries";

export default function ProductRow({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="home-row container">
      <div className="home-row-heading">
        <h2>{title}</h2>
        <Link href={href}>Shop all →</Link>
      </div>
      <div className="grid cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
