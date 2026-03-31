"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Site = {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  username?: string;
};

type Dict = {
  dashboard: {
    title: string;
    empty: string;
    createFirst: string;
    published: string;
    draft: string;
    edit: string;
    delete: string;
    view: string;
    unpublish: string;
    confirmDelete: string;
    plan: string;
    sitesUsed: string;
  };
  nav: { login: string };
};

export default function DashboardClient({
  locale,
  dict,
}: {
  locale: string;
  dict: Dict;
}) {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [userPlan, setUserPlan] = useState("free");

  useEffect(() => {
    fetch("/auth/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setUser(data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoadingSites(true);
    fetch("/api/sites")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        setSites(data.sites || []);
        setUserPlan(data.plan || "free");
      })
      .catch(() => {})
      .finally(() => setLoadingSites(false));
  }, [user]);

  const handleDelete = async (siteId: number) => {
    if (!confirm(dict.dashboard.confirmDelete)) return;
    await fetch(`/api/sites?id=${siteId}`, { method: "DELETE" });
    setSites((prev) => prev.filter((s) => s.id !== siteId));
  };

  const handleUnpublish = async (siteId: number) => {
    await fetch(`/api/sites`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: siteId, published: false }),
    });
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, published: false } : s))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted text-lg">Please log in to manage your sites.</p>
        <a
          href="/auth/login"
          className="rounded-lg bg-accent px-6 py-3 text-white font-medium hover:bg-accent-dark transition"
        >
          {dict.nav.login}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.title}</h1>
          <p className="text-muted mt-1">
            {dict.dashboard.plan}: <span className="capitalize font-medium text-foreground">{userPlan}</span>
            {" · "}
            {sites.length} {dict.dashboard.sitesUsed}
          </p>
        </div>
        <Link
          href={`/${locale}/editor`}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition"
        >
          + {dict.dashboard.createFirst.split(" ").slice(0, 2).join(" ")}
        </Link>
      </div>

      {loadingSites ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-card-bg"
            />
          ))}
        </div>
      ) : sites.length === 0 ? (
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
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
            />
          </svg>
          <p className="text-muted text-lg">{dict.dashboard.empty}</p>
          <Link
            href={`/${locale}/editor`}
            className="mt-4 inline-block rounded-lg bg-accent px-6 py-3 text-white font-medium hover:bg-accent-dark transition"
          >
            {dict.dashboard.createFirst}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) => (
            <div
              key={site.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-card-border p-4 hover:border-accent/30 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{site.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      site.published
                        ? "bg-success/10 text-success"
                        : "bg-card-bg text-muted"
                    }`}
                  >
                    {site.published
                      ? dict.dashboard.published
                      : dict.dashboard.draft}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  {new Date(site.updatedAt).toLocaleDateString()}
                  {site.published && site.username && (
                    <>
                      {" · "}
                      <span className="text-accent">/sites/{site.username}/{site.slug}.html</span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {site.published && (
                  <>
                    <a
                      href={`/sites/${site.username || "anonymous"}/${site.slug}.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-1.5 rounded-md border border-card-border text-muted hover:text-foreground hover:border-accent transition"
                    >
                      {dict.dashboard.view}
                    </a>
                    <button
                      onClick={() => handleUnpublish(site.id)}
                      className="text-sm px-3 py-1.5 rounded-md border border-card-border text-muted hover:text-foreground hover:border-accent transition"
                    >
                      {dict.dashboard.unpublish}
                    </button>
                  </>
                )}
                <Link
                  href={`/${locale}/editor/${site.id}`}
                  className="text-sm px-3 py-1.5 rounded-md border border-card-border text-muted hover:text-foreground hover:border-accent transition"
                >
                  {dict.dashboard.edit}
                </Link>
                <button
                  onClick={() => handleDelete(site.id)}
                  className="text-sm px-3 py-1.5 rounded-md border border-danger/30 text-danger hover:bg-danger/10 transition"
                >
                  {dict.dashboard.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
