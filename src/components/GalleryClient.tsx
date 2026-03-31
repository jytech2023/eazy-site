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
    viewSite: "View",
    viewCode: "Code",
    fork: "Fork",
    forking: "Forking...",
    forked: "Forked! Opening editor...",
    loadMore: "Load More",
    empty: "No sites yet. Be the first to create one!",
    createCta: "Create Your Site",
    close: "Close",
  },
  zh: {
    title: "作品展示",
    subtitle: "社区使用 AI 创建的网站",
    by: "作者",
    anonymous: "匿名用户",
    viewSite: "查看",
    viewCode: "代码",
    fork: "复刻",
    forking: "复刻中...",
    forked: "已复刻！正在打开编辑器...",
    loadMore: "加载更多",
    empty: "还没有网站。成为第一个创建的人！",
    createCta: "创建你的网站",
    close: "关闭",
  },
  es: {
    title: "Galería",
    subtitle: "Sitios web creados por la comunidad con IA",
    by: "por",
    anonymous: "Anónimo",
    viewSite: "Ver",
    viewCode: "Código",
    fork: "Bifurcar",
    forking: "Bifurcando...",
    forked: "¡Bifurcado! Abriendo editor...",
    loadMore: "Cargar Más",
    empty: "Aún no hay sitios. ¡Sé el primero en crear uno!",
    createCta: "Crea Tu Sitio",
    close: "Cerrar",
  },
  ko: {
    title: "갤러리",
    subtitle: "커뮤니티가 AI로 만든 웹사이트",
    by: "작성자",
    anonymous: "익명",
    viewSite: "보기",
    viewCode: "코드",
    fork: "포크",
    forking: "포크 중...",
    forked: "포크 완료! 에디터 열기...",
    loadMore: "더 보기",
    empty: "아직 사이트가 없습니다. 첫 번째로 만들어 보세요!",
    createCta: "사이트 만들기",
    close: "닫기",
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
  const [codeModal, setCodeModal] = useState<{ title: string; files: Record<string, string>; siteId: number } | null>(null);
  const [codeTab, setCodeTab] = useState("index.html");
  const [forking, setForking] = useState<number | null>(null);
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

  const handleViewCode = async (siteId: number) => {
    const res = await fetch(`/api/gallery/site?id=${siteId}`);
    if (!res.ok) return;
    const data = await res.json();
    setCodeTab(Object.keys(data.files)[0] || "index.html");
    setCodeModal({ title: data.title, files: data.files, siteId: data.id });
  };

  const handleFork = async (siteId: number) => {
    setForking(siteId);
    try {
      const res = await fetch("/api/fork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      // Store forked files in sessionStorage so editor can load them directly
      if (data.files) {
        sessionStorage.setItem(`fork-${data.siteId}`, JSON.stringify(data.files));
      }
      window.location.href = `/${locale}/editor/${data.siteId}`;
    } finally {
      setForking(null);
    }
  };

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
        <Link
          href={`/${locale}/editor`}
          className="inline-flex items-center gap-2 mt-6 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition shadow-lg shadow-accent/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {d.createCta}
        </Link>
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
                {/* Preview iframe — scales 1440px viewport to fit card width */}
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative w-full overflow-hidden bg-white" style={{ paddingBottom: "62.5%" }}>
                    <div className="absolute inset-0" style={{ containerType: "inline-size" }}>
                      <iframe
                        src={site.url}
                        className="absolute top-0 left-0 pointer-events-none border-0"
                        style={{ width: "1440px", height: "900px", transform: "scale(var(--preview-scale))", transformOrigin: "top left" }}
                        ref={(el) => {
                          if (el) {
                            const observer = new ResizeObserver((entries) => {
                              for (const entry of entries) {
                                const scale = entry.contentRect.width / 1440;
                                el.style.setProperty("--preview-scale", String(scale));
                              }
                            });
                            observer.observe(el.parentElement!);
                          }
                        }}
                        sandbox="allow-scripts"
                        title={site.title}
                        loading="lazy"
                      />
                    </div>
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
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-card-border px-2 py-1 text-xs text-muted hover:text-foreground hover:border-accent transition"
                        title={d.viewSite}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                      <button
                        onClick={(e) => { e.preventDefault(); handleViewCode(site.id); }}
                        className="rounded-md border border-card-border px-2 py-1 text-xs text-muted hover:text-foreground hover:border-accent transition"
                        title={d.viewCode}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); handleFork(site.id); }}
                        disabled={forking !== null}
                        className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white hover:bg-accent-dark transition disabled:opacity-50"
                        title={d.fork}
                      >
                        {forking === site.id ? "..." : d.fork}
                      </button>
                    </div>
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
      {/* Floating "Create Site" button */}
      {sites.length > 0 && (
        <Link
          href={`/${locale}/editor`}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white shadow-xl shadow-accent/25 hover:bg-accent-dark transition hover:scale-105"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">{d.createCta}</span>
        </Link>
      )}

      {/* Code Viewer Modal */}
      {codeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setCodeModal(null)}
          />
          <div className="relative w-full max-w-3xl rounded-2xl border border-card-border bg-background shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
              <div className="flex items-center gap-3 min-w-0">
                <svg className="h-5 w-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                <h2 className="text-lg font-semibold truncate">{codeModal.title}</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleFork(codeModal.siteId)}
                  disabled={forking !== null}
                  className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-dark transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  {forking === codeModal.siteId ? d.forking : d.fork}
                </button>
                <button
                  onClick={() => setCodeModal(null)}
                  className="rounded-lg p-1.5 text-muted hover:text-foreground hover:bg-card-bg transition"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* File tabs */}
            <div className="flex items-center gap-0.5 px-4 py-2 border-b border-card-border overflow-x-auto">
              {Object.keys(codeModal.files).map((name) => (
                <button
                  key={name}
                  onClick={() => setCodeTab(name)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    codeTab === name
                      ? "bg-card-bg text-foreground border border-card-border shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Code content */}
            <div className="flex-1 overflow-auto">
              <pre className="p-4 text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap break-words">
                <code>{codeModal.files[codeTab] || ""}</code>
              </pre>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
              <span>{Object.keys(codeModal.files).length} file{Object.keys(codeModal.files).length !== 1 ? "s" : ""}</span>
              <span>{(codeModal.files[codeTab]?.length || 0).toLocaleString()} chars</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
