"use client";

import { useState } from "react";

type CfProject = { name: string; subdomain: string };

const CfIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.51 12.15l-.67-2.3a.45.45 0 00-.44-.33H5.77a.18.18 0 01-.17-.13.18.18 0 01.07-.2l1.02-.7a.91.91 0 00.37-.83 4.68 4.68 0 014.4-4.4 4.72 4.72 0 015.2 3.72.45.45 0 00.35.35 3.12 3.12 0 012.45 2.42.44.44 0 00.43.35h1.36c.1 0 .19.09.17.2a4.69 4.69 0 01-4.36 3.53h-.03a.18.18 0 01-.17-.13l-.28-.96a.18.18 0 01.12-.22 2.8 2.8 0 002-1.68.18.18 0 00-.11-.24.18.18 0 00-.07-.01H16.8a.45.45 0 01-.44-.33l-.67-2.3a.18.18 0 00-.35 0l-.67 2.3a.45.45 0 01-.44.33H5.46a.18.18 0 00-.12.31l2.06 1.42a.91.91 0 00.37.83h9.19a.45.45 0 01.44.33l.28.96a.18.18 0 01-.12.22.18.18 0 01-.05.01z" />
  </svg>
);

export default function SiteCfProject({
  siteId,
  currentProject,
  cfConnected,
  onUpdate,
}: {
  siteId: string;
  currentProject: string | null;
  cfConnected: boolean;
  onUpdate: (project: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<CfProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(currentProject || "");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    setOpen(true);
    setLoading(true);
    setError("");
    setShowCreate(false);
    setNewName("");
    try {
      const res = await fetch("/api/cloudflare/projects");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load projects");
        return;
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selected) return;
    setConnecting(true);
    setError("");
    try {
      const res = await fetch("/api/sites/cloudflare", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, cfPagesProject: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to connect");
      } else {
        onUpdate(selected);
        setOpen(false);
      }
    } catch {
      setError("Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  const handleCreate = async () => {
    if (!newName) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/sites/cloudflare", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, cfPagesProject: newName, createNew: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create");
      } else {
        onUpdate(newName);
        setOpen(false);
      }
    } catch {
      setError("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/sites/cloudflare", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      onUpdate(null);
    } catch {}
  };

  if (!cfConnected) return null;

  // Compact display when connected
  if (currentProject && !open) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <CfIcon className="h-3.5 w-3.5 text-[#F6821F]" />
        <span className="text-xs text-muted">{currentProject}</span>
        <button onClick={loadProjects} className="text-xs text-accent hover:underline">
          Change
        </button>
        <button onClick={handleDisconnect} className="text-xs text-danger hover:underline">
          ×
        </button>
      </div>
    );
  }

  // Trigger link
  if (!open) {
    return (
      <button
        onClick={loadProjects}
        className="mt-1 text-xs text-[#F6821F] hover:underline flex items-center gap-1"
      >
        <CfIcon className="h-3 w-3" />
        Connect to Cloudflare Pages
      </button>
    );
  }

  // Modal
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md rounded-2xl border border-card-border bg-background shadow-2xl flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
            <div className="flex items-center gap-3">
              <CfIcon className="h-5 w-5 text-[#F6821F]" />
              <h2 className="text-lg font-semibold">Cloudflare Pages</h2>
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

          {/* Error */}
          {error && (
            <div className="px-6 py-3 bg-danger/10 border-b border-danger/20">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Existing projects */}
                {projects.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select existing project
                    </label>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {projects.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => setSelected(p.name)}
                          className={`w-full flex items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                            selected === p.name
                              ? "border-accent bg-accent/5"
                              : "border-card-border hover:border-accent/30"
                          }`}
                        >
                          <div>
                            <span className="font-medium">{p.name}</span>
                            <span className="text-xs text-muted ml-2">{p.subdomain}</span>
                          </div>
                          {selected === p.name && (
                            <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {projects.length === 0 && !showCreate && (
                  <div className="text-center py-6">
                    <CfIcon className="h-10 w-10 text-[#F6821F]/30 mx-auto mb-3" />
                    <p className="text-sm text-muted mb-4">No Pages projects found.</p>
                  </div>
                )}

                {/* Divider */}
                {projects.length > 0 && !showCreate && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-card-border" />
                    <span className="text-xs text-muted">or</span>
                    <div className="flex-1 border-t border-card-border" />
                  </div>
                )}

                {/* Create new */}
                {!showCreate ? (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="w-full rounded-lg border border-dashed border-card-border px-4 py-3 text-sm text-muted hover:text-foreground hover:border-accent transition flex items-center justify-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create new project
                  </button>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      New project name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) =>
                          setNewName(
                            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                          )
                        }
                        placeholder="my-website"
                        autoFocus
                        className="flex-1 rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
                      />
                      <button
                        onClick={handleCreate}
                        disabled={!newName || creating}
                        className="rounded-lg bg-[#F6821F] px-4 py-2 text-sm font-medium text-white hover:bg-[#e0741a] transition disabled:opacity-50"
                      >
                        {creating ? (
                          <span className="flex items-center gap-1.5">
                            <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                            Creating
                          </span>
                        ) : (
                          "Create"
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted mt-1.5">
                      Lowercase letters, numbers, and hyphens only.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer actions */}
          {!loading && projects.length > 0 && selected && !showCreate && (
            <div className="px-6 py-4 border-t border-card-border">
              <button
                onClick={handleConnect}
                disabled={!selected || connecting}
                className="w-full rounded-lg bg-[#F6821F] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e0741a] transition disabled:opacity-50"
              >
                {connecting ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    Connecting
                  </span>
                ) : (
                  `Connect to ${selected}`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
