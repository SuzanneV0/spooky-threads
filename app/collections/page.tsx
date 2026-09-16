import Link from "next/link";
import { getAllCollections } from "@/lib/queries";

export const metadata = {
  title: "Collections",
  description: "Browse all Spooky Threads collections — Halloween themes, seasonal favorites, and shop by type.",
};

export default async function CollectionsIndex() {
  const collections = await getAllCollections();
  const themes = collections.filter((c) => c.kind === "theme");
  const categories = collections.filter((c) => c.kind === "category" && !c.parent_id);
  const departments = collections.filter((c) => c.kind === "department");

  return (
    <div className="container" style={{ padding: "3rem 1.25rem" }}>
      <h1>Collections</h1>
      <p style={{ color: "var(--color-muted-text)", marginBottom: "2rem" }}>
        Browse by theme, department, or product type.
      </p>

      <h2>Themes</h2>
      <ul className="collection-list">
        {themes.map((c) => (
          <li key={c.id}>
            <Link href={`/collections/${c.slug}`}>{c.name}</Link>
          </li>
        ))}
      </ul>

      <h2>Shop by type</h2>
      <ul className="collection-list">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/collections/${c.slug}`}>{c.name}</Link>
          </li>
        ))}
      </ul>

      <h2>Departments</h2>
      <ul className="collection-list">
        {departments.map((c) => (
          <li key={c.id}>
            <Link href={`/collections/${c.slug}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
