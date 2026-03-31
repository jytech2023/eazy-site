import type { Locale } from "./i18n";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  zh: () => import("./dictionaries/zh.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
