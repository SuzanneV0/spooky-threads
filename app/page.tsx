import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function Home() {
  return (
    <main className="container">
      <h1>🎃 Spooky Threads</h1>
      <p>Halloween apparel, cursed to look this good.</p>
      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
