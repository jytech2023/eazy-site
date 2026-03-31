import { hasLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import GalleryClient from "@/components/GalleryClient";
import type { Metadata } from "next";

const meta: Record<string, { title: string; description: string }> = {
  en: {
    title: "Gallery - Sites Built with EasySite",
    description: "Browse websites created by the EasySite community using AI. Get inspired and start building your own.",
  },
  zh: {
    title: "作品展示 - EasySite 社区作品",
    description: "浏览 EasySite 社区使用 AI 创建的网站。获取灵感，开始创建你自己的。",
  },
  es: {
    title: "Galería - Sitios Creados con EasySite",
    description: "Explora sitios web creados por la comunidad de EasySite con IA. Inspírate y empieza a crear el tuyo.",
  },
  ko: {
    title: "갤러리 - EasySite로 만든 사이트",
    description: "EasySite 커뮤니티가 AI로 만든 웹사이트를 둘러보세요. 영감을 얻고 직접 만들어 보세요.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const m = meta[locale] || meta.en;
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: `${baseUrl}/${locale}/gallery`,
      languages: { en: `${baseUrl}/en/gallery`, zh: `${baseUrl}/zh/gallery`, es: `${baseUrl}/es/gallery`, ko: `${baseUrl}/ko/gallery` },
    },
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  return <GalleryClient locale={locale as Locale} />;
}
