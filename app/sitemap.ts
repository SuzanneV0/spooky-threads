import type { MetadataRoute } from "next";
import { all } from "@/lib/db/client";
import { SITE_URL } from "@/lib/site";

const staticRoutes = [
  "",
  "/collections",
  "/about",
  "/contact",
  "/subscriptions",
  "/quiz",
  "/terms-of-service",
  "/privacy-policy",
  "/cookies",
  "/shipping-information",
  "/order-information",
  "/return-policy",
];

const whimsicalGothRoutes = [
  "/whimsical-goth",
  "/whimsical-goth/spring",
  "/whimsical-goth/summer",
  "/whimsical-goth/fall",
  "/whimsical-goth/winter",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, products] = await Promise.all([
    all<{ slug: string }>("SELECT slug FROM collections"),
    all<{ slug: string; created_at: string }>("SELECT slug, created_at FROM products"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));

  const whimsicalGothEntries: MetadataRoute.Sitemap = whimsicalGothRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const collectionEntries: MetadataRoute.Sitemap = (collections ?? []).map((c) => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...whimsicalGothEntries, ...collectionEntries, ...productEntries];
}
