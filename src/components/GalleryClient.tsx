"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

type GallerySite = {
  id: number;
  title: string;
  slug: string;
  isAnonymous: boolean;
  username: string;
  userAvatar: string | null;
  createdAt: string;
  url: string;
};

const t = {
  en: {
    title: "Gallery",
    subtitle: "Websites built by the community with AI",
    by: "by",
    anonymous: "Anonymous",
    viewSite: "View Site",
    loadMore: "Load More",
    empty: "No sites yet. Be the first to create one!",
    createCta: "Create Your Site",
  },
  zh: {
    title: "作品展示",
    subtitle: "社区使用 AI 创建的网站",
    by: "作者",
    anonymous: "匿名用户",
    viewSite: "查看网站",
    loadMore: "加载更多",
    empty: "还没有网站。成为第一个创建的人！",
    createCta: "创建你的网站",
  },
  es: {
    title: "Galería",
    subtitle: "Sitios web creados por la comunidad con IA",
    by: "por",
    anonymous: "Anónimo",
    viewSite: "Ver Sitio",
    loadMore: "Cargar Más",
    empty: "Aún no hay sitios. ¡Sé el primero en crear uno!",
    createCta: "Crea Tu Sitio",
  },
  ko: {
    title: "갤러리",
    subtitle: "커뮤니티가 AI로 만든 웹사이트",
    by: "작성자",
    anonymous: "익명",
    viewSite: "사이트 보기",
    loadMore: "더 보기",
    empty: "아직 사이트가 없습니다. 첫 번째로 만들어 보세요!",
    createCta: "사이트 만들기",
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function GalleryClient({ locale }: { locale: Locale }) {
  const [sites, setSites] = useState<GallerySite[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const d = t[locale];

  const fetchSites = async (p: number) => {
    const res = await fetch(`/api/gallery?page=${p}`);
    if (!res.ok) return;
    const data = await res.json();
    return data;
  };

  useEffect(() => {
    setLoading(true);
    fetchSites(1)
      .then((data) => {
        if (data) {
          setSites(data.sites);
          setHasMore(data.hasMore);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await fetchSites(nextPage);
    if (data) {
      setSites((prev) => [...prev, ...data.sites]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold">{d.title}</h1>
        <p className="mt-3 text-lg text-muted">{d.subtitle}</p>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="mx-auto h-16 w-16 text-muted/30 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
          <p className="text-muted text-lg mb-4">{d.empty}</p>
          <Link
            href={`/${locale}/editor`}
            className="inline-block rounded-lg bg-accent px-6 py-3 text-white font-medium hover:bg-accent-dark transition"
          >
            {d.createCta}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <div
                key={site.id}
                className="group rounded-xl border border-card-border overflow-hidden hover:border-accent/50 transition"
              >
                {/* Preview iframe */}
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative w-full h-48 bg-white overflow-hidden">
                    <iframe
                      src={site.url}
                      className="w-[1280px] h-[800px] origin-top-left pointer-events-none"
                      style={{ transform: "scale(0.25)", transformOrigin: "top left" }}
                      sandbox="allow-scripts"
                      title={site.title}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-transparent group-hover:bg-accent/5 transition" />
                  </div>
                </a>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm truncate">{site.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        {site.userAvatar && !site.isAnonymous ? (
                          <img
                            src={site.userAvatar}
                            alt=""
                            referrerPolicy={"no-referrer"}
                            className="h-4 w-4 rounded-full"
                          />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-muted/20 flex items-center justify-center text-[8px] text-muted">
                            ?
                          </div>
                        )}
                        <span className="text-xs text-muted">
                          {site.isAnonymous ? d.anonymous : site.username}
                        </span>
                        <span className="text-xs text-muted/50">·</span>
                        <span className="text-xs text-muted/50">{timeAgo(site.createdAt)}</span>
                      </div>
                    </div>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-md border border-card-border px-2.5 py-1 text-xs text-muted hover:text-foreground hover:border-accent transition opacity-0 group-hover:opacity-100"
                    >
                      {d.viewSite}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-lg border border-card-border px-6 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:border-accent transition disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-accent border-t-transparent rounded-full" />
                    {d.loadMore}
                  </span>
                ) : (
                  d.loadMore
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
