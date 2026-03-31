"use client";

import { useState, useEffect } from "react";

type Repo = {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  description: string | null;
  defaultBranch: string;
  updatedAt: string;
  url: string;
};

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function GitHubImport({
  locale,
  onImported,
}: {
  locale: string;
  onImported: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/github/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.connected) setConnected(true);
      })
      .catch(() => {});
  }, []);

  const loadRepos = async () => {
    setOpen(true);
    setLoading(true);
    setError("");
    setSuccess("");
    setSearch("");
    try {
      const res = await fetch("/api/github/repos");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load repos");
        return;
      }
      const data = await res.json();
      setRepos(data.repos || []);
    } catch {
      setError("Failed to load repos");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (repo: Repo) => {
    setImporting(repo.fullName);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/import/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: repo.fullName,
          branch: repo.defaultBranch,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
      } else {
        setSuccess(data.title);
        setTimeout(() => {
          window.location.href = `/${locale}/editor/${data.siteId}`;
        }, 1000);
        onImported();
      }
    } catch {
      setError("Import failed");
    } finally {
      setImporting(null);
    }
  };

  // Trigger button
  const triggerButton = (
    <button
      onClick={connected ? loadRepos : undefined}
      className="inline-flex items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:border-accent transition"
    >
      <GitHubIcon className="h-4 w-4" />
      Import from GitHub
    </button>
  );

  if (!connected) {
    return (
      <a
        href="/api/github"
        className="inline-flex items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:border-accent transition"
      >
        <GitHubIcon className="h-4 w-4" />
        Import from GitHub
      </a>
    );
  }

  if (!open) return triggerButton;

  const filtered = search
    ? repos.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.fullName.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase())
      )
    : repos;

  return (
    <>
      {triggerButton}

      {/* Modal overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* Modal */}
        <div className="relative w-full max-w-lg rounded-2xl border border-card-border bg-background shadow-2xl flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
            <div className="flex items-center gap-3">
              <GitHubIcon className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Import from GitHub</h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-muted hover:text-foreground hover:bg-card-bg transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-card-border">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search repositories..."
                autoFocus
                className="w-full rounded-lg border border-card-border bg-card-bg pl-10 pr-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Success banner */}
          {success && (
            <div className="px-6 py-3 bg-success/10 border-b border-success/20 flex items-center gap-2">
              <svg className="h-4 w-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <p className="text-sm text-success">
                Imported &ldquo;{success}&rdquo; — opening editor...
              </p>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="px-6 py-3 bg-danger/10 border-b border-danger/20">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Repo list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted">
                <svg className="h-10 w-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-sm">
                  {search ? "No matching repos found." : "No repositories found."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-card-border">
                {filtered.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-card-bg/50 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:text-accent transition truncate"
                        >
                          {repo.fullName}
                        </a>
                        {repo.isPrivate ? (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border border-card-border text-muted">
                            private
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border border-success/30 text-success">
                            public
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {repo.description && (
                          <p className="text-xs text-muted truncate">
                            {repo.description}
                          </p>
                        )}
                        <span className="shrink-0 text-xs text-muted/60">
                          {timeAgo(repo.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImport(repo)}
                      disabled={importing !== null}
                      className="shrink-0 rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-dark transition disabled:opacity-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      {importing === repo.fullName ? (
                        <span className="flex items-center gap-1.5">
                          <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                          Importing
                        </span>
                      ) : (
                        "Import"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-card-border text-xs text-muted flex items-center justify-between">
            <span>{filtered.length} repo{filtered.length !== 1 ? "s" : ""}</span>
            <span>Imports HTML, CSS, JS files only</span>
          </div>
        </div>
      </div>
    </>
  );
}
