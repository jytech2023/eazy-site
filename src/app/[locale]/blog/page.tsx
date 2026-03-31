import { hasLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles } from "@/content/blog";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const title =
    locale === "zh" ? "博客 - EasySite AI 建站" : "Blog - EasySite AI Website Builder";
  const description =
    locale === "zh"
      ? "EasySite 博客：域名设置、网站优化、AI 建站技巧等实用教程。"
      : "EasySite Blog: Tutorials on custom domains, website optimization, AI website building tips, and more.";
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
      languages: { en: `${baseUrl}/en/blog`, zh: `${baseUrl}/zh/blog` },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/blog`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const loc = locale as Locale;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">
        {locale === "zh" ? "博客" : "Blog"}
      </h1>
      <p className="text-lg text-muted mb-12">
        {locale === "zh"
          ? "教程、技巧和实用指南，帮助你更好地使用 EasySite 建站。"
          : "Tutorials, tips, and practical guides to help you get the most out of EasySite."}
      </p>

      <div className="space-y-8">
        {articles.map((article) => {
          const localized = article[loc];
          return (
            <article
              key={article.slug}
              className="rounded-xl border border-card-border bg-card-bg p-6 hover:border-accent/50 transition"
            >
              <Link href={`/${locale}/blog/${article.slug}`}>
                <time className="text-sm text-muted">{article.date}</time>
                <h2 className="mt-2 text-xl font-semibold hover:text-accent transition">
                  {localized.title}
                </h2>
                <p className="mt-2 text-muted">{localized.description}</p>
                <span className="mt-4 inline-block text-sm text-accent font-medium">
                  {locale === "zh" ? "阅读全文 →" : "Read more →"}
                </span>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
