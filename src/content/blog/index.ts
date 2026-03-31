import type { BlogArticle } from "./types";
import march2026Update from "./march-2026-update";
import cloudflarePages from "./cloudflare-pages-integration";
import customDomainCloudflare from "./custom-domain-cloudflare";
import partnershipCloudflare from "./partnership-with-cloudflare";

export type { BlogArticle, BlogArticleLocale } from "./types";

export const articles: BlogArticle[] = [march2026Update, partnershipCloudflare, cloudflarePages, customDomainCloudflare];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return articles.find((a) => a.slug === slug);
}
