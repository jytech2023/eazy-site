import type { BlogArticle } from "./types";
import cloudflarePages from "./cloudflare-pages-integration";
import customDomainCloudflare from "./custom-domain-cloudflare";

export type { BlogArticle, BlogArticleLocale } from "./types";

export const articles: BlogArticle[] = [cloudflarePages, customDomainCloudflare];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return articles.find((a) => a.slug === slug);
}
