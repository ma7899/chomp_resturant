import type { MetadataRoute } from "next";
import { SEED_SANDWICHES as SANDWICHES } from "@/lib/seed";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://chomp-sandwich.example";
  const routes = ["", "/menu", "/build", "/about", "/contact", "/checkout"];
  const staticPages = routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
  }));
  const builds = SANDWICHES.map((s) => ({
    url: `${base}/build?sandwich=${s.slug}`,
    lastModified: new Date(),
  }));
  return [...staticPages, ...builds];
}
