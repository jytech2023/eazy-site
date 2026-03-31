import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "EasySite",
    url: `${baseUrl}/${locale}`,
    description: dict.meta.description,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier available",
    },
    inLanguage: locale === "zh" ? "zh-CN" : "en-US",
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Announcement banner */}
      <Link
        href={`/${locale}/blog/cloudflare-pages-integration`}
        className="block bg-gradient-to-r from-[#f38020] via-[#f9a825] to-[#f38020] text-white hover:opacity-90 transition"
      >
        <div className="mx-auto max-w-7xl px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          {dict.home.announcement}
          <span className="ml-1">→</span>
        </div>
      </Link>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-light/5" />
        </div>
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            <span className="gradient-text">{dict.home.heroTitle}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted">
            {dict.home.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/editor`}
              className="w-full sm:w-auto rounded-xl bg-accent px-8 py-3 text-lg font-semibold text-white hover:bg-accent-dark transition shadow-lg shadow-accent/25"
            >
              {dict.home.ctaStart}
            </Link>
            <a
              href="/auth/login"
              className="w-full sm:w-auto rounded-xl border border-card-border px-8 py-3 text-lg font-semibold text-foreground hover:bg-card-bg transition"
            >
              {dict.home.ctaLogin}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z",
                title: dict.home.featureAI,
                desc: dict.home.featureAIDesc,
              },
              {
                icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
                title: dict.home.featureInstant,
                desc: dict.home.featureInstantDesc,
              },
              {
                icon: "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
                title: dict.home.featureFree,
                desc: dict.home.featureFreeDesc,
              },
              {
                icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
                title: dict.home.featureManage,
                desc: dict.home.featureManageDesc,
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-card-border bg-card-bg p-6 hover:border-accent/50 transition"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <svg
                    className="h-6 w-6 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={f.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-card-bg/50">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            {dict.home.howTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "1", title: dict.home.step1, desc: dict.home.step1Desc },
              { num: "2", title: dict.home.step2, desc: dict.home.step2Desc },
              { num: "3", title: dict.home.step3, desc: dict.home.step3Desc },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white text-xl font-bold">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cloudflare integration */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-card-border bg-gradient-to-br from-[#f38020]/5 via-transparent to-[#faad3f]/5 p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Cloudflare logo */}
              <div className="shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f38020]/10">
                  <svg className="h-12 w-12 text-[#f38020]" viewBox="0 0 64 64" fill="currentColor">
                    <path d="M45.2 39.3c.3-1 .2-1.9-.3-2.6-.5-.6-1.2-1-2-1l-22.3-.3c-.2 0-.3-.1-.4-.2-.1-.1-.1-.3 0-.4.1-.3.3-.4.6-.5l22.5-.3c2.7-.1 5.6-2.3 6.6-4.9l1.3-3.4c.1-.2.1-.4 0-.6C49 17.6 41.7 12 33.2 12 25.4 12 18.7 16.7 16.1 23.3c-1.6-1.2-3.6-1.8-5.8-1.6-3.8.4-6.8 3.5-7.2 7.3-.1.9 0 1.8.2 2.7C1.4 32 0 33.6 0 35.6 0 37.7 1.5 39.4 3.5 39.6h41c.3 0 .5-.1.7-.3z"/>
                    <path d="M50.5 26.1c-.4 0-.8 0-1.2.1l-.4 1.4c-.3 1-.2 1.9.3 2.6.5.6 1.2 1 2 1l3.5.3c.2 0 .3.1.4.2.1.1.1.3 0 .4-.1.3-.3.4-.6.5l-3.7.3c-2.7.1-5.6 2.3-6.6 4.9l-.4 1c-.1.2 0 .4.3.4H60c2.2 0 4-1.8 4-4 0-4.3-3.5-7.8-7.8-7.8h-5.7z" opacity=".7"/>
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {dict.home.cfTitle}
                </h2>
                <p className="mt-3 text-muted max-w-2xl">
                  {dict.home.cfDesc}
                </p>
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    dict.home.cfFeature1,
                    dict.home.cfFeature2,
                    dict.home.cfFeature3,
                    dict.home.cfFeature4,
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <svg
                        className="h-4 w-4 text-[#f38020] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link
                    href={`/${locale}/profile`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f38020] px-6 py-3 text-sm font-semibold text-white hover:bg-[#e0721c] transition shadow-lg shadow-[#f38020]/25"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.81" />
                    </svg>
                    {dict.home.cfCta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
