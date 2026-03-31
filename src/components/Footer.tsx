import Link from "next/link";
import { articles } from "@/content/blog";

type Dict = {
  footer: { copyright: string; tagline: string; terms: string; privacy: string };
  nav: { home: string; editor: string; pricing: string; blog: string; gallery: string; models: string };
};

// Pick a random article that changes daily (deterministic for SSR consistency)
function getDailyArticle() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return articles[day % articles.length];
}

export default function Footer({ dict, locale }: { dict: Dict; locale: string }) {
  const article = getDailyArticle();
  const localeKey = locale as "en" | "zh" | "es" | "ko";
  const articleData = article[localeKey] || article.en;

  return (
    <footer className="mt-auto border-t border-card-border">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href={`/${locale}`} className="text-lg font-bold gradient-text">
              EasySite
            </Link>
            <p className="mt-2 text-sm text-muted">{dict.footer.tagline}</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href={`/${locale}/editor`} className="hover:text-foreground transition">
                  {dict.nav.editor}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/pricing`} className="hover:text-foreground transition">
                  {dict.nav.pricing}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/models`} className="hover:text-foreground transition">
                  {dict.nav.models}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/stats`} className="hover:text-foreground transition">
                  Stats
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href={`/${locale}/gallery`} className="hover:text-foreground transition">
                  {dict.nav.gallery}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="hover:text-foreground transition">
                  {dict.nav.blog}
                </Link>
              </li>
              <li>
                <a
                  href="https://cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition"
                >
                  Cloudflare
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-foreground transition">
                  {dict.footer.terms}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-foreground transition">
                  {dict.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Featured article */}
        <div className="mt-10 pt-6 border-t border-card-border">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{dict.nav.blog}</p>
              <Link
                href={`/${locale}/blog/${article.slug}`}
                className="text-sm font-medium text-foreground hover:text-accent transition line-clamp-1"
              >
                {articleData.title}
              </Link>
              <p className="text-xs text-muted mt-1 line-clamp-2">{articleData.description}</p>
            </div>
            <Link
              href={`/${locale}/blog`}
              className="shrink-0 text-xs text-accent hover:underline whitespace-nowrap"
            >
              more...
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-card-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} {dict.footer.copyright}. All rights reserved.</p>
          <p>
            A{" "}
            <a
              href="https://jytech.us"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              JY Tech
            </a>
            {" "}product
          </p>
        </div>
      </div>
    </footer>
  );
}
