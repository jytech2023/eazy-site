"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const otherLocale = locale === "en" ? "zh" : "en";
  const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <Link
      href={newPath}
      className="text-sm text-muted hover:text-foreground transition px-2 py-1 rounded border border-card-border hover:border-accent"
    >
      {locale === "en" ? "中文" : "EN"}
    </Link>
  );
}
