import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import { MODELS } from "@/lib/models";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.models.title,
    description: dict.models.subtitle,
  };
}

const TIER_COLORS = {
  free: "border-green-500/30 bg-green-500/5",
  pro: "border-accent/30 bg-accent/5",
  unlimited: "border-purple-500/30 bg-purple-500/5",
} as const;

const TIER_BADGES = {
  free: "bg-green-500/10 text-green-400 border-green-500/20",
  pro: "bg-accent/10 text-accent border-accent/20",
  unlimited: "bg-purple-500/10 text-purple-400 border-purple-500/20",
} as const;

export default async function ModelsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const tiers = [
    { key: "free" as const, title: dict.models.tierFreeTitle, desc: dict.models.tierFreeDesc },
    { key: "pro" as const, title: dict.models.tierProTitle, desc: dict.models.tierProDesc },
    { key: "unlimited" as const, title: dict.models.tierUnlimitedTitle, desc: dict.models.tierUnlimitedDesc },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">{dict.models.title}</h1>
        <p className="text-muted max-w-2xl mx-auto">{dict.models.subtitle}</p>
      </div>

      {/* Model tiers */}
      <div className="space-y-10">
        {tiers.map((tier) => {
          const tierModels = MODELS.filter((m) => m.tier === tier.key);
          return (
            <section key={tier.key}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${TIER_BADGES[tier.key]}`}>
                    {dict.models[tier.key]}
                  </span>
                  {tier.title}
                </h2>
                <p className="text-sm text-muted mt-1">{tier.desc}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {tierModels.map((model) => (
                  <div
                    key={model.id}
                    className={`rounded-xl border p-5 transition hover:shadow-md ${TIER_COLORS[tier.key]}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{model.name}</h3>
                      <span className="text-xs text-muted bg-background/50 px-2 py-0.5 rounded-full">
                        {dict.models.context}: {model.context}
                      </span>
                    </div>
                    <p className="text-sm text-muted mb-3">{model.description}</p>
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{dict.models.bestFor}:</span>{" "}
                      <span className="text-muted">{model.strength}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* How it works */}
      <section className="mt-16 rounded-xl border border-card-border bg-card-bg p-8">
        <h2 className="text-xl font-semibold mb-3">{dict.models.howItWorks}</h2>
        <p className="text-muted">{dict.models.howItWorksDesc}</p>
      </section>

      {/* Tips */}
      <section className="mt-8 rounded-xl border border-card-border bg-card-bg p-8">
        <h2 className="text-xl font-semibold mb-4">{dict.models.tipsTitle}</h2>
        <ul className="space-y-3">
          {[dict.models.tip1, dict.models.tip2, dict.models.tip3, dict.models.tip4].map(
            (tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted">
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                {tip}
              </li>
            )
          )}
        </ul>
      </section>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link
          href={`/${locale}/editor`}
          className="inline-block rounded-lg bg-accent px-8 py-3 text-sm font-medium text-white hover:bg-accent-dark transition"
        >
          {dict.models.startBuilding}
        </Link>
      </div>
    </div>
  );
}
