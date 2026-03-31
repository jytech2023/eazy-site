import { hasLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, getArticleBySlug } from "@/content/blog";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const article of articles) {
    for (const locale of ["en", "zh"]) {
      params.push({ locale, slug: article.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) return {};
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const loc = locale as Locale;
  const localized = article[loc];
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return {
    title: `${localized.title} - EasySite`,
    description: localized.description,
    keywords: localized.keywords,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog/${slug}`,
      languages: {
        en: `${baseUrl}/en/blog/${slug}`,
        zh: `${baseUrl}/zh/blog/${slug}`,
      },
    },
    openGraph: {
      title: localized.title,
      description: localized.description,
      url: `${baseUrl}/${locale}/blog/${slug}`,
      type: "article",
      publishedTime: article.date,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();

  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const loc = locale as Locale;
  const localized = article[loc];
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: localized.title,
    description: localized.description,
    datePublished: article.date,
    url: `${baseUrl}/${locale}/blog/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "EasySite",
      url: baseUrl,
    },
    inLanguage: locale === "zh" ? "zh-CN" : "en-US",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8">
        <Link
          href={`/${locale}/blog`}
          className="text-sm text-muted hover:text-accent transition"
        >
          ← {{ en: "Back to Blog", zh: "返回博客", es: "Volver al Blog", ko: "블로그로 돌아가기" }[loc]}
        </Link>
      </nav>

      <header className="mb-10">
        <time className="text-sm text-muted">{article.date}</time>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight">
          {localized.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{localized.description}</p>
      </header>

      <article className="prose prose-invert max-w-none prose-headings:font-semibold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-li:text-muted prose-blockquote:border-accent/50 prose-blockquote:text-muted prose-table:text-sm prose-th:text-foreground prose-td:text-muted prose-code:text-accent prose-code:bg-card-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-hr:border-card-border">
        <ArticleContent content={localized.content} />
      </article>
    </div>
  );
}

async function ArticleContent({ content }: { content: string }) {
  const { unified } = await import("unified");
  const { default: remarkParse } = await import("remark-parse");
  const { default: remarkGfm } = await import("remark-gfm");
  const { default: remarkRehype } = await import("remark-rehype");
  const { default: rehypeStringify } = await import("rehype-stringify");

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content);

  return (
    <div dangerouslySetInnerHTML={{ __html: String(result) }} />
  );
}
