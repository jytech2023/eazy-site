import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { auth0 } from "@/lib/auth0";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      languages: {
        en: "/en",
        zh: "/zh",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const session = await auth0.getSession();
  const user = session?.user
    ? { name: session.user.name, picture: session.user.picture, email: session.user.email }
    : null;

  return (
    <>
      <Navbar locale={locale} dict={dict} user={user} />
      <main className="flex-1">{children}</main>
      <Footer dict={dict} />
    </>
  );
}
