"use client";

import { useState } from "react";

type CfProject = { name: string; subdomain: string };

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
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cloudflare/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cfApiToken: "__use_saved__" }),
      });
      // This won't work with saved token, we need a different endpoint
      // Let me use a GET that uses the user's saved token
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    setOpen(true);
    setLoading(true);
    setError("");
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
        body: JSON.stringify({
          siteId,
          cfPagesProject: newName,
          createNew: true,
        }),
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

  if (!cfConnected) {
    return null;
  }

  // Compact display when connected to a project
  if (currentProject && !open) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <svg className="h-3.5 w-3.5 text-[#F6821F]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.51 12.15l-.67-2.3a.45.45 0 00-.44-.33H5.77a.18.18 0 01-.17-.13.18.18 0 01.07-.2l1.02-.7a.91.91 0 00.37-.83 4.68 4.68 0 014.4-4.4 4.72 4.72 0 015.2 3.72.45.45 0 00.35.35 3.12 3.12 0 012.45 2.42.44.44 0 00.43.35h1.36c.1 0 .19.09.17.2a4.69 4.69 0 01-4.36 3.53h-.03a.18.18 0 01-.17-.13l-.28-.96a.18.18 0 01.12-.22 2.8 2.8 0 002-1.68.18.18 0 00-.11-.24.18.18 0 00-.07-.01H16.8a.45.45 0 01-.44-.33l-.67-2.3a.18.18 0 00-.35 0l-.67 2.3a.45.45 0 01-.44.33H5.46a.18.18 0 00-.12.31l2.06 1.42a.91.91 0 00.37.83h9.19a.45.45 0 01.44.33l.28.96a.18.18 0 01-.12.22.18.18 0 01-.05.01z" />
        </svg>
        <span className="text-xs text-muted">{currentProject}</span>
        <button
          onClick={() => loadProjects()}
          className="text-xs text-accent hover:underline"
        >
          Change
        </button>
        <button
          onClick={handleDisconnect}
          className="text-xs text-danger hover:underline"
        >
          ×
        </button>
      </div>
    );
  }

  // Button to open project selector
  if (!open) {
    return (
      <button
        onClick={loadProjects}
        className="mt-1 text-xs text-accent hover:underline flex items-center gap-1"
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" opacity={0.7}>
          <path d="M16.51 12.15l-.67-2.3a.45.45 0 00-.44-.33H5.77a.18.18 0 01-.17-.13.18.18 0 01.07-.2l1.02-.7a.91.91 0 00.37-.83 4.68 4.68 0 014.4-4.4 4.72 4.72 0 015.2 3.72.45.45 0 00.35.35 3.12 3.12 0 012.45 2.42.44.44 0 00.43.35h1.36c.1 0 .19.09.17.2a4.69 4.69 0 01-4.36 3.53h-.03" />
        </svg>
        Connect to Cloudflare Pages
      </button>
    );
  }

  // Project selector panel
  return (
    <div className="mt-2 rounded-lg border border-card-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Cloudflare Pages</span>
        <button onClick={() => setOpen(false)} className="text-xs text-muted hover:text-foreground">
          ×
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-muted">Loading projects...</div>
      ) : (
        <>
          {projects.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="flex-1 rounded-md border border-card-border bg-background px-2 py-1.5 text-xs focus:border-accent focus:outline-none"
              >
                <option value="">Select a project...</option>
                {projects.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.subdomain})
                  </option>
                ))}
              </select>
              <button
                onClick={handleConnect}
                disabled={!selected}
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-dark transition disabled:opacity-50"
              >
                Connect
              </button>
            </div>
          )}

          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="text-xs text-accent hover:underline"
            >
              + Create new project
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="project-name"
                className="flex-1 rounded-md border border-card-border bg-background px-2 py-1.5 text-xs focus:border-accent focus:outline-none"
              />
              <button
                onClick={handleCreate}
                disabled={!newName || creating}
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-dark transition disabled:opacity-50"
              >
                {creating ? "..." : "Create"}
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
