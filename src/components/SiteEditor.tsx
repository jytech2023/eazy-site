"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Dict = {
  editor: {
    title: string;
    placeholder: string;
    send: string;
    regenerate: string;
    publish: string;
    publishing: string;
    published: string;
    preview: string;
    code: string;
    newSite: string;
    loginToManage: string;
    saveDraft: string;
  };
};

type Files = Record<string, string>;

// Parse AI response into files: { "index.html": "...", "style.css": "..." }
function parseFiles(response: string): Files {
  const files: Files = {};
  // Match ```lang filename=xxx\n...\n```
  const regex = /```(\w+)\s+filename=([^\n]+)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(response)) !== null) {
    const filename = match[2].trim();
    files[filename] = match[3].trimEnd();
  }

  // Fallback: if no filename= blocks found, try old single-HTML format
  if (Object.keys(files).length === 0) {
    const htmlMatch = response.match(/```html\n([\s\S]*?)```/);
    if (htmlMatch) {
      files["index.html"] = htmlMatch[1].trimEnd();
    } else if (response.trim().startsWith("<!DOCTYPE")) {
      files["index.html"] = response.trim();
    }
  }

  return files;
}

// Build a preview HTML that inlines CSS and JS for the iframe
function buildPreviewHtml(files: Files): string {
  let html = files["index.html"] || "";
  if (!html) return "";

  const css = files["style.css"] || "";
  const js = files["script.js"] || "";

  // Inject CSS inline (replace the link tag or append to head)
  if (css) {
    if (html.includes('href="style.css"')) {
      html = html.replace(
        /<link[^>]*href="style\.css"[^>]*\/?>/i,
        `<style>\n${css}\n</style>`
      );
    } else if (html.includes("</head>")) {
      html = html.replace("</head>", `<style>\n${css}\n</style>\n</head>`);
    }
  }

  // Inject JS inline (replace the script tag or append to body)
  if (js) {
    if (html.includes('src="script.js"')) {
      html = html.replace(
        /<script[^>]*src="script\.js"[^>]*><\/script>/i,
        `<script>\n${js}\n</script>`
      );
    } else if (html.includes("</body>")) {
      html = html.replace("</body>", `<script>\n${js}\n</script>\n</body>`);
    }
  }

  // Also inline any other CSS/JS files
  for (const [name, content] of Object.entries(files)) {
    if (name === "index.html" || name === "style.css" || name === "script.js") continue;
    if (name.endsWith(".css")) {
      html = html.replace(
        new RegExp(`<link[^>]*href="${name.replace(".", "\\.")}"[^>]*/?>`, "i"),
        `<style>\n${content}\n</style>`
      );
    } else if (name.endsWith(".js")) {
      html = html.replace(
        new RegExp(`<script[^>]*src="${name.replace(".", "\\.")}"[^>]*></script>`, "i"),
        `<script>\n${content}\n</script>`
      );
    }
  }

  return html;
}

function getFileIcon(filename: string): string {
  if (filename.endsWith(".html")) return "H";
  if (filename.endsWith(".css")) return "C";
  if (filename.endsWith(".js")) return "J";
  return "F";
}

function getFileColor(filename: string): string {
  if (filename.endsWith(".html")) return "text-orange-400";
  if (filename.endsWith(".css")) return "text-blue-400";
  if (filename.endsWith(".js")) return "text-yellow-400";
  return "text-muted";
}

export default function SiteEditor({
  locale,
  dict,
  siteId,
}: {
  locale: string;
  dict: Dict;
  siteId?: string;
}) {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<Files>({});
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [currentSiteId, setCurrentSiteId] = useState<string | undefined>(siteId);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [selectedModel, setSelectedModel] = useState("openrouter/auto");
  const [models, setModels] = useState<{ id: string; name: string; tier: string; available: boolean }[]>([]);
  const [userPlan, setUserPlan] = useState("free");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fileNames = useMemo(() => Object.keys(files), [files]);
  const hasFiles = fileNames.length > 0;
  const previewHtml = useMemo(() => buildPreviewHtml(files), [files]);

  // Check auth state & load models
  useEffect(() => {
    fetch("/auth/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setUser(data); })
      .catch(() => {});

    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models || []);
        setUserPlan(data.plan || "free");
        // Default to best available model
        const available = (data.models || []).filter((m: { available: boolean }) => m.available);
        if (available.length > 0) {
          setSelectedModel(available[available.length - 1].id);
        }
      })
      .catch(() => {});
  }, []);

  // Load existing site if editing
  useEffect(() => {
    if (siteId) {
      fetch(`/api/sites?id=${siteId}`)
        .then((r) => {
          if (!r.ok) throw new Error("Failed");
          return r.json();
        })
        .then((data) => {
          if (data.site?.files && typeof data.site.files === "object" && !Array.isArray(data.site.files)) {
            // New format: files is Record<string, string>
            setFiles(data.site.files);
          } else if (data.site?.htmlContent) {
            setFiles({ "index.html": data.site.htmlContent });
          }
          if (data.site) setCurrentSiteId(data.site.id.toString());
        })
        .catch(() => {});
    }
  }, [siteId]);

  // Auto-scroll only within the chat container
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatHistory, streamingContent]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setPublishedUrl(null);

    const userMessage = { role: "user", content: prompt };
    setChatHistory((prev) => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPrompt,
          model: selectedModel,
          files: hasFiles ? files : undefined,
          siteId: currentSiteId,
          history: chatHistory.slice(-6),
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setStreamingContent(fullResponse);

        // Live-parse files during streaming
        const parsed = parseFiles(fullResponse);
        if (Object.keys(parsed).length > 0) {
          setFiles(parsed);
        }
      }

      // Final parse
      const finalFiles = parseFiles(fullResponse);
      if (Object.keys(finalFiles).length > 0) {
        setFiles(finalFiles);
        // Switch to preview after generation
        setActiveTab("preview");
      }

      setStreamingContent("");
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: fullResponse },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Error generating site. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!hasFiles || publishing) return;
    setPublishing(true);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files,
          siteId: currentSiteId,
          title:
            chatHistory.find((m) => m.role === "user")?.content.slice(0, 50) ||
            "My Site",
        }),
      });

      const data = await res.json();
      if (data.url) {
        setPublishedUrl(data.url);
        if (data.siteId) setCurrentSiteId(data.siteId.toString());
      }
    } catch {
      alert("Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const handleNew = () => {
    setFiles({});
    setPrompt("");
    setChatHistory([]);
    setCurrentSiteId(undefined);
    setPublishedUrl(null);
    setActiveTab("preview");
    window.history.replaceState(null, "", `/${locale}/editor`);
  };

  const updateFile = (name: string, content: string) => {
    setFiles((prev) => ({ ...prev, [name]: content }));
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      {/* Left: Chat panel */}
      <div className="flex flex-col w-full lg:w-100 border-b lg:border-b-0 lg:border-r border-card-border bg-background">
        <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
          <h2 className="font-semibold">{dict.editor.title}</h2>
          <button
            onClick={handleNew}
            className="text-sm text-accent hover:text-accent-dark"
          >
            {dict.editor.newSite}
          </button>
        </div>

        {/* Chat messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[30vh] lg:max-h-none">
          {chatHistory.length === 0 && (
            <div className="text-center text-muted py-12">
              <svg className="mx-auto h-12 w-12 text-muted/50 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-sm">{dict.editor.placeholder}</p>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`text-sm rounded-lg px-3 py-2 ${
                msg.role === "user"
                  ? "bg-accent/10 text-foreground ml-6"
                  : "bg-card-bg text-foreground mr-6"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          ))}
          {loading && (
            <div className="bg-card-bg text-foreground mr-6 rounded-lg px-3 py-2 text-sm">
              {streamingContent ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                </div>
              ) : (
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                </span>
              )}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Files panel */}
        {hasFiles && (
          <div className="border-t border-card-border">
            <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              Files
            </div>
            <div className="px-2 pb-2 space-y-0.5">
              {fileNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveTab(name)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition ${
                    activeTab === name
                      ? "bg-accent/10 text-foreground"
                      : "text-muted hover:text-foreground hover:bg-card-bg"
                  }`}
                >
                  <span className={`text-xs font-bold ${getFileColor(name)}`}>
                    {getFileIcon(name)}
                  </span>
                  <span className="truncate">{name}</span>
                  <span className="ml-auto text-xs text-muted">
                    {Math.ceil(files[name].length / 1024)}kb
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-card-border space-y-2">
          {!user && (
            <p className="text-xs text-muted">{dict.editor.loginToManage}</p>
          )}
          {/* Model selector */}
          {models.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex-1 text-xs rounded-md border border-card-border bg-card-bg px-2 py-1.5 text-foreground focus:outline-none focus:border-accent appearance-none cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} disabled={!m.available}>
                    {m.name} {!m.available ? `(${m.tier})` : ""}
                  </option>
                ))}
              </select>
              {userPlan === "free" && (
                <a
                  href={`/${locale}/pricing`}
                  className="shrink-0 text-xs text-accent hover:underline"
                >
                  Upgrade
                </a>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder={dict.editor.placeholder}
              rows={2}
              className="flex-1 resize-none rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="self-end rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition disabled:opacity-50"
            >
              {loading ? "..." : dict.editor.send}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Preview / File tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Tabs & Actions */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-card-border overflow-x-auto">
          <div className="flex items-center gap-1 min-w-0">
            {/* Preview tab */}
            <button
              onClick={() => setActiveTab("preview")}
              className={`shrink-0 px-3 py-1.5 text-sm rounded-md transition ${
                activeTab === "preview"
                  ? "bg-card-bg text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {dict.editor.preview}
            </button>

            {/* File tabs */}
            {fileNames.map((name) => (
              <button
                key={name}
                onClick={() => setActiveTab(name)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition ${
                  activeTab === name
                    ? "bg-card-bg text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span className={`text-xs font-bold ${getFileColor(name)}`}>
                  {getFileIcon(name)}
                </span>
                {name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {publishedUrl && (
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline truncate max-w-50"
              >
                {publishedUrl}
              </a>
            )}
            <button
              onClick={async () => {
                const { exportSiteAsZip } = await import("@/lib/export-site");
                await exportSiteAsZip(files, "my-site");
              }}
              disabled={!hasFiles}
              className="rounded-lg border border-card-border px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground hover:border-accent transition disabled:opacity-50"
              title="Export as ZIP"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
            <button
              onClick={handlePublish}
              disabled={!hasFiles || publishing}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white transition disabled:opacity-50 ${
                publishedUrl
                  ? "bg-success hover:bg-success/80"
                  : "bg-accent hover:bg-accent-dark"
              }`}
            >
              {publishing
                ? dict.editor.publishing
                : publishedUrl
                  ? dict.editor.published
                  : dict.editor.publish}
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0">
          {activeTab === "preview" ? (
            previewHtml ? (
              <iframe
                ref={iframeRef}
                srcDoc={previewHtml}
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted">
                <p>{dict.editor.placeholder}</p>
              </div>
            )
          ) : files[activeTab] !== undefined ? (
            <textarea
              value={files[activeTab]}
              onChange={(e) => updateFile(activeTab, e.target.value)}
              className="w-full h-full code-editor bg-card-bg p-4 text-foreground focus:outline-none"
              spellCheck={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted">
              <p>Select a file</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
