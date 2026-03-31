export type BlogArticleLocale = {
  title: string;
  description: string;
  keywords: string[];
  content: string;
};

export type BlogArticle = {
  slug: string;
  date: string;
  en: BlogArticleLocale;
  zh: BlogArticleLocale;
};
