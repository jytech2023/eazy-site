import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import SiteEditor from "@/components/SiteEditor";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ locale: string; siteId: string }>;
}) {
  const { locale, siteId } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return <SiteEditor locale={locale} dict={dict} siteId={siteId} />;
}
