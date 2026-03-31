export const locales = ["en", "zh", "es", "ko"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function hasLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}

export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}
