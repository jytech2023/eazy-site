import { hasLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import StatsClient from "@/components/StatsClient";
import type { Metadata } from "next";

const titles = {
  en: "Platform Stats",
  zh: "平台统计",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  return { title: titles[locale as Locale] };
}

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  return <StatsClient locale={locale as Locale} />;
}
