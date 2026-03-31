import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { articles } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  const staticPages = ["", "/editor", "/pricing", "/blog"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}${page}`])
          ),
        },
      });
    }

    for (const article of articles) {
      entries.push({
        url: `${baseUrl}/${locale}/blog/${article.slug}`,
        lastModified: new Date(article.date),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/blog/${article.slug}`])
          ),
        },
      });
    }
  }

  return entries;
}
