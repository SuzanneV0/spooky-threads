import ProductRow from "@/components/ProductRow";
import { getAllCollections, getProductsForCollectionSlug, type Collection } from "@/lib/queries";

export const metadata = {
  title: "Collections",
  description: "Browse all Spooky Threads collections — Halloween themes, seasonal favorites, and shop by type.",
};

async function CollectionGroup({ title, collections }: { title: string; collections: Collection[] }) {
  const previews = await Promise.all(
    collections.map(async (c) => {
      const { products } = await getProductsForCollectionSlug(c.slug);
      return { collection: c, products: products.slice(0, 3) };
    })
  );

  const nonEmpty = previews.filter((p) => p.products.length > 0);
  if (nonEmpty.length === 0) return null;

  return (
    <>
      <h2 className="container collections-group-heading">{title}</h2>
      {nonEmpty.map(({ collection, products }) => (
        <ProductRow
          key={collection.id}
          title={collection.name}
          href={`/collections/${collection.slug}`}
          products={products}
          cols={3}
        />
      ))}
    </>
  );
}

export default async function CollectionsIndex() {
  const collections = await getAllCollections();
  const themes = collections.filter((c) => c.kind === "theme");
  const categories = collections.filter((c) => c.kind === "category" && !c.parent_id);
  const departments = collections.filter((c) => c.kind === "department");

  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        <h1>Collections</h1>
        <p style={{ color: "var(--color-muted-text)", marginBottom: "2rem" }}>
          Browse by theme, department, or product type.
        </p>
      </div>

      <CollectionGroup title="Themes" collections={themes} />
      <CollectionGroup title="Shop by type" collections={categories} />
      <CollectionGroup title="Departments" collections={departments} />
    </div>
  );
}
