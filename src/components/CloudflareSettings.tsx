"use client";

import { useEffect, useState } from "react";

type Dict = {
  cloudflare: {
    title: string;
    description: string;
    apiToken: string;
    apiTokenHint: string;
    save: string;
    saving: string;
    disconnect: string;
    connected: string;
    notConnected: string;
    testSuccess: string;
    guide: string;
    step1: string;
    step2: string;
  };
};

export default function CloudflareSettings({ dict }: { dict: Dict }) {
  const [cfApiToken, setCfApiToken] = useState("");
  const [accountName, setAccountName] = useState("");
  const [configured, setConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/cloudflare")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setCfApiToken(data.cfApiToken);
          setConfigured(data.configured);
          setAccountName(data.accountName || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/cloudflare", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cfApiToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setConfigured(true);
        setAccountName(data.accountName || "");
        setSuccess(dict.cloudflare.testSuccess);
        setCfApiToken("••••••••");
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    const res = await fetch("/api/cloudflare", { method: "DELETE" });
    if (res.ok) {
      setConfigured(false);
      setCfApiToken("");
      setAccountName("");
      setSuccess("");
    }
  };

  return (
    <div className="rounded-xl border border-card-border p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6 text-[#F6821F]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.51 12.15l-.67-2.3a.45.45 0 00-.44-.33H5.77a.18.18 0 01-.17-.13.18.18 0 01.07-.2l1.02-.7a.91.91 0 00.37-.83 4.68 4.68 0 014.4-4.4 4.72 4.72 0 015.2 3.72.45.45 0 00.35.35 3.12 3.12 0 012.45 2.42.44.44 0 00.43.35h1.36c.1 0 .19.09.17.2a4.69 4.69 0 01-4.36 3.53h-.03a.18.18 0 01-.17-.13l-.28-.96a.18.18 0 01.12-.22 2.8 2.8 0 002-1.68.18.18 0 00-.11-.24.18.18 0 00-.07-.01H16.8a.45.45 0 01-.44-.33l-.67-2.3a.18.18 0 00-.35 0l-.67 2.3a.45.45 0 01-.44.33H5.46a.18.18 0 00-.12.31l2.06 1.42a.91.91 0 00.37.83h9.19a.45.45 0 01.44.33l.28.96a.18.18 0 01-.12.22.18.18 0 01-.05.01z" />
          </svg>
          <h3 className="text-lg font-semibold">{dict.cloudflare.title}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              configured ? "bg-success/10 text-success" : "bg-card-bg text-muted"
            }`}
          >
            {configured ? dict.cloudflare.connected : dict.cloudflare.notConnected}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-muted hover:text-foreground transition"
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>
      <p className="text-sm text-muted mb-4">{dict.cloudflare.description}</p>

      {expanded && (
        <>
          <div className="mb-6 rounded-lg bg-card-bg/50 border border-card-border p-4">
            <p className="text-sm font-medium mb-2">{dict.cloudflare.guide}</p>
            <ol className="text-sm text-muted space-y-1.5 list-decimal list-inside">
              <li>{dict.cloudflare.step1}</li>
              <li>{dict.cloudflare.step2}</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {dict.cloudflare.apiToken}
              </label>
              <input
                type="password"
                value={cfApiToken}
                onChange={(e) => setCfApiToken(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
              <p className="text-xs text-muted mt-1">
                {dict.cloudflare.apiTokenHint}
              </p>
            </div>

            {accountName && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success">&#10003;</span>
                <span className="text-muted">Account:</span>
                <span className="font-medium">{accountName}</span>
              </div>
            )}

            {error && <p className="text-sm text-danger">{error}</p>}
            {success && <p className="text-sm text-success">{success}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !cfApiToken || cfApiToken === "••••••••"}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? dict.cloudflare.saving : dict.cloudflare.save}
              </button>
              {configured && (
                <button
                  onClick={handleDisconnect}
                  className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 transition"
                >
                  {dict.cloudflare.disconnect}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
