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
  const titles: Record<string, string> = {
    en: "Blog - EasySite AI Website Builder",
    zh: "博客 - EasySite AI 建站",
    es: "Blog - EasySite Constructor Web con IA",
    ko: "블로그 - EasySite AI 웹사이트 빌더",
  };
  const descriptions: Record<string, string> = {
    en: "EasySite Blog: Tutorials on custom domains, website optimization, AI website building tips, and more.",
    zh: "EasySite 博客：域名设置、网站优化、AI 建站技巧等实用教程。",
    es: "Blog de EasySite: Tutoriales sobre dominios personalizados, optimización web, consejos de creación con IA y más.",
    ko: "EasySite 블로그: 커스텀 도메인, 웹사이트 최적화, AI 웹사이트 제작 팁 등 실용적인 튜토리얼.",
  };
  const title = titles[locale] || titles.en;
  const description = descriptions[locale] || descriptions.en;
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
      languages: { en: `${baseUrl}/en/blog`, zh: `${baseUrl}/zh/blog`, es: `${baseUrl}/es/blog`, ko: `${baseUrl}/ko/blog` },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/blog`,
      locale: { en: "en_US", zh: "zh_CN", es: "es_ES", ko: "ko_KR" }[locale] || "en_US",
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
        {{ en: "Blog", zh: "博客", es: "Blog", ko: "블로그" }[loc]}
      </h1>
      <p className="text-lg text-muted mb-12">
        {{ en: "Tutorials, tips, and practical guides to help you get the most out of EasySite.",
           zh: "教程、技巧和实用指南，帮助你更好地使用 EasySite 建站。",
           es: "Tutoriales, consejos y guías prácticas para aprovechar al máximo EasySite.",
           ko: "EasySite를 최대한 활용하기 위한 튜토리얼, 팁, 실용 가이드." }[loc]}
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
                  {{ en: "Read more →", zh: "阅读全文 →", es: "Leer más →", ko: "더 읽기 →" }[loc]}
                </span>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
