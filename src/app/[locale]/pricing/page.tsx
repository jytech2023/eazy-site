import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import { PLANS } from "@/lib/stripe";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const plans = [
    {
      key: "free" as const,
      name: dict.pricing.free,
      price: PLANS.free.price,
      features: [
        `3 ${dict.pricing.features.sites}`,
        `5 ${dict.pricing.features.pages}`,
        dict.pricing.features.freeModel,
      ],
    },
    {
      key: "pro" as const,
      name: dict.pricing.pro,
      price: PLANS.pro.price,
      popular: true,
      features: [
        `20 ${dict.pricing.features.sites}`,
        `50 ${dict.pricing.features.pages}`,
        dict.pricing.features.proModel,
        dict.pricing.features.customDomain,
      ],
    },
    {
      key: "unlimited" as const,
      name: dict.pricing.unlimited,
      price: PLANS.unlimited.price,
      features: [
        dict.pricing.features.unlimitedSites,
        dict.pricing.features.unlimitedPages,
        dict.pricing.features.unlimitedModel,
        dict.pricing.features.customDomain,
        dict.pricing.features.priority,
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold">{dict.pricing.title}</h1>
        <p className="mt-4 text-lg text-muted">{dict.pricing.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`rounded-xl border p-6 flex flex-col ${
              plan.popular
                ? "border-accent shadow-lg shadow-accent/10 relative"
                : "border-card-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full font-medium">
                Popular
              </div>
            )}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold">
                ${plan.price}
              </span>
              {plan.price > 0 && (
                <span className="text-muted ml-1">{dict.pricing.month}</span>
              )}
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <svg
                    className="h-4 w-4 text-success flex-shrink-0"
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
                  {f}
                </li>
              ))}
            </ul>
            {plan.key === "free" ? (
              <div className="mt-6 text-center text-sm text-muted py-2.5">
                {dict.pricing.current}
              </div>
            ) : (
              <form action="/api/stripe/checkout" method="POST" className="mt-6">
                <input type="hidden" name="plan" value={plan.key} />
                <button
                  type="submit"
                  className={`w-full rounded-lg py-2.5 text-sm font-medium transition ${
                    plan.popular
                      ? "bg-accent text-white hover:bg-accent-dark"
                      : "border border-card-border hover:border-accent text-foreground"
                  }`}
                >
                  {dict.pricing.upgrade}
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
