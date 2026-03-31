import type { BlogArticle } from "./types";
import customDomainCloudflare from "./custom-domain-cloudflare";

export type { BlogArticle, BlogArticleLocale } from "./types";

export const articles: BlogArticle[] = [customDomainCloudflare];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return articles.find((a) => a.slug === slug);
}
