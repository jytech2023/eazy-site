"use client";

import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const WebContainerPreview = lazy(() => import("./WebContainerPreview"));

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
    registerPrivate: string;
    saveDraft: string;
  };
  nav: {
    home: string;
    dashboard: string;
    pricing: string;
    models: string;
    blog: string;
    gallery: string;
    login: string;
  };
};

type Files = Record<string, string>;

const PROSE_CLASSES = "prose prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2 prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-a:text-accent prose-code:text-accent prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-background/50 prose-pre:text-foreground";

// Render assistant message with <think> blocks shown as collapsible sections
function AssistantMessage({ content }: { content: string }) {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  const parts: { type: "think" | "text"; content: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = thinkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "think", content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }

  // No think blocks — render normally
  if (parts.length === 1 && parts[0].type === "text") {
    return (
      <div className={PROSE_CLASSES}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div>
      {parts.map((part, i) =>
        part.type === "think" ? (
          <details key={i} className="mb-2 rounded-md border border-card-border bg-background/30 overflow-hidden">
            <summary className="px-3 py-1.5 text-xs font-medium text-muted cursor-pointer select-none hover:text-foreground transition">
              Thinking...
            </summary>
            <div className={`px-3 py-2 text-xs text-muted border-t border-card-border ${PROSE_CLASSES}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.content}</ReactMarkdown>
            </div>
          </details>
        ) : (
          <div key={i} className={PROSE_CLASSES}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.content.trim()}</ReactMarkdown>
          </div>
        )
      )}
    </div>
  );
}

// Strip <think>...</think> reasoning blocks from model output (Qwen3 models)
function stripThinkBlocks(response: string): string {
  return response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

// Parse AI response into files: { "index.html": "...", "style.css": "..." }
// Supports partial updates — only returns files that appear in the response
function parseFiles(response: string): Files {
  const cleaned = stripThinkBlocks(response);
  const files: Files = {};
  // Match ```lang filename=xxx\n...\n``` (supports nested backticks by being non-greedy)
  const regex = /```(\w+)\s+filename=([^\n]+)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(cleaned)) !== null) {
    const filename = match[2].trim();
    files[filename] = match[3].trimEnd();
  }

  // Fallback: if no filename= blocks found, try old single-HTML format
  if (Object.keys(files).length === 0) {
    const htmlMatch = cleaned.match(/```html\n([\s\S]*?)```/);
    if (htmlMatch) {
      files["index.html"] = htmlMatch[1].trimEnd();
    } else if (cleaned.startsWith("<!DOCTYPE")) {
      files["index.html"] = cleaned;
    }
  }

  return files;
}

// If the AI inlined styles/scripts into HTML instead of creating separate files,
// extract them into style.css and script.js automatically.
function extractInlineAssets(files: Files): Files {
  const html = files["index.html"];
  if (!html) return files;

  // Already has separate style.css — skip extraction
  if (files["style.css"] && files["script.js"]) return files;

  const result = { ...files };
  let updatedHtml = html;

  // Extract <style> blocks into style.css (if no style.css exists)
  if (!files["style.css"]) {
    const styleBlocks: string[] = [];
    updatedHtml = updatedHtml.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/gi,
      (_match, css: string) => {
        const trimmed = css.trim();
        if (trimmed) styleBlocks.push(trimmed);
        return '<link rel="stylesheet" href="style.css">';
      }
    );
    if (styleBlocks.length > 0) {
      result["style.css"] = styleBlocks.join("\n\n");
    }
  }

  // Extract inline <script> blocks into script.js (if no script.js exists)
  // Skip scripts with src= (those are CDN links like Google Fonts, etc.)
  if (!files["script.js"]) {
    const scriptBlocks: string[] = [];
    updatedHtml = updatedHtml.replace(
      /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi,
      (_match, js: string) => {
        const trimmed = js.trim();
        if (trimmed) {
          scriptBlocks.push(trimmed);
          return '<script src="script.js"></script>';
        }
        return "";
      }
    );
    if (scriptBlocks.length > 0) {
      result["script.js"] = scriptBlocks.join("\n\n");
    }
  }

  result["index.html"] = updatedHtml;
  return result;
}

// Merge partial file updates from AI with existing files
// AI in editing mode only outputs changed files — merge them with the current set
function mergeFiles(existing: Files, updates: Files): Files {
  if (Object.keys(existing).length === 0) return updates;
  if (Object.keys(updates).length === 0) return existing;
  return { ...existing, ...updates };
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
  const [selectedModel, setSelectedModel] = useState("auto");
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [models, setModels] = useState<{ id: string; name: string; tier: string; available: boolean }[]>([]);
  const [userPlan, setUserPlan] = useState("free");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const autoContRef = useRef(0); // Track auto-continuation count to prevent infinite loops
  const pendingAutoContRef = useRef(false);

  const fileNames = useMemo(() => Object.keys(files), [files]);
  const hasFiles = fileNames.length > 0;
  const previewHtml = useMemo(() => buildPreviewHtml(files), [files]);

  // Hide shared Navbar and Footer — editor has its own built-in nav
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("nav.sticky");
    const footer = document.querySelector<HTMLElement>("footer");
    if (nav) nav.style.display = "none";
    if (footer) footer.style.display = "none";
    return () => {
      if (nav) nav.style.display = "";
      if (footer) footer.style.display = "";
    };
  }, []);

  // Load models and auth state in a single request (no separate /auth/profile call)
  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models || []);
        setUserPlan(data.plan || "free");
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Load existing site if editing
  useEffect(() => {
    if (!siteId) return;

    // Check sessionStorage for fork data first (avoids extra API call)
    const forkKey = `fork-${siteId}`;
    const forkData = sessionStorage.getItem(forkKey);
    if (forkData) {
      try {
        const forkFiles = JSON.parse(forkData);
        setFiles(forkFiles);
        setCurrentSiteId(siteId);
        sessionStorage.removeItem(forkKey);
        return;
      } catch {}
    }

    // Otherwise fetch from API
    fetch(`/api/sites?id=${siteId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        if (data.site?.files && typeof data.site.files === "object" && !Array.isArray(data.site.files)) {
          setFiles(data.site.files);
        } else if (data.site?.htmlContent) {
          setFiles({ "index.html": data.site.htmlContent });
        }
        if (data.site) setCurrentSiteId(data.site.id.toString());
      })
      .catch(() => {});
  }, [siteId]);

  // Auto-continue: when a generation ends with truncation, auto-send "continue"
  useEffect(() => {
    if (!loading && pendingAutoContRef.current) {
      pendingAutoContRef.current = false;
      // Directly trigger a continue generation after brief delay
      const timer = setTimeout(() => handleGenerate("continue"), 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Auto-scroll only within the chat container
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatHistory, streamingContent]);

  // Cancel an in-progress generation (inspired by Claude-Code's abort handling)
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Detect if AI output was truncated mid-code-block (inspired by Claude-Code's max_output_tokens recovery)
  function detectTruncation(response: string): boolean {
    const openBlocks = (response.match(/```\w+\s+filename=/g) || []).length;
    const closeBlocks = (response.match(/\n```(?:\n|$)/g) || []).length;
    return openBlocks > closeBlocks;
  }

  const handleGenerate = async (overridePrompt?: string) => {
    const effectivePrompt = overridePrompt || prompt;
    if (!effectivePrompt.trim() || loading) return;
    setLoading(true);
    setPublishedUrl(null);

    // Set up abort controller for cancellation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage = { role: "user", content: effectivePrompt };
    setChatHistory((prev) => [...prev, userMessage]);
    const currentPrompt = effectivePrompt;
    if (!overridePrompt) setPrompt("");

    // Snapshot current files before generation for merge
    const existingFiles = { ...files };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPrompt,
          model: selectedModel,
          files: hasFiles ? files : undefined,
          siteId: currentSiteId,
          history: chatHistory.slice(-8),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`Generation failed: ${res.status} ${errorText.slice(0, 100)}`);
      }

      // Track which model was actually used (important for auto mode)
      const modelUsed = res.headers.get("X-Model-Used");
      if (modelUsed) setActiveModel(modelUsed);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setStreamingContent(fullResponse);

        // Live-parse files during streaming and merge with existing
        const parsed = parseFiles(fullResponse);
        if (Object.keys(parsed).length > 0) {
          const merged = mergeFiles(existingFiles, parsed);
          setFiles(merged);
        }
      }

      // Final parse, extract inline assets, and merge
      let finalParsed = parseFiles(fullResponse);
      if (Object.keys(finalParsed).length > 0) {
        finalParsed = extractInlineAssets(finalParsed);
        const finalMerged = mergeFiles(existingFiles, finalParsed);
        setFiles(finalMerged);
        setActiveTab("preview");
      }

      // Detect truncated output (inspired by Claude-Code's max_output_tokens recovery)
      const wasTruncated = detectTruncation(fullResponse);

      setStreamingContent("");
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: fullResponse + (wasTruncated ? "\n\n⚠️ *Output truncated — auto-continuing...*" : "") },
      ]);

      // Auto-publish for anonymous users after each turn
      const finalFiles = mergeFiles(existingFiles, finalParsed);
      if (!user && Object.keys(finalParsed).length > 0) {
        autoPublish(finalFiles);
      }

      // Auto-continue if output was truncated (max 2 continuations to prevent loops)
      if (wasTruncated && autoContRef.current < 2) {
        autoContRef.current++;
        pendingAutoContRef.current = true;
      } else {
        autoContRef.current = 0;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled — keep whatever was streamed so far
        const partial = streamingContent || "";
        setStreamingContent("");
        if (partial.trim()) {
          const partialParsed = parseFiles(partial);
          if (Object.keys(partialParsed).length > 0) {
            setFiles(mergeFiles(existingFiles, partialParsed));
          }
          setChatHistory((prev) => [
            ...prev,
            { role: "assistant", content: partial + "\n\n⚠️ *Stopped. Partial output kept. Say \"continue\" to resume.*" },
          ]);
        } else {
          setChatHistory((prev) => [
            ...prev,
            { role: "assistant", content: "*(Cancelled)*" },
          ]);
        }
      } else {
        const message = err instanceof Error ? err.message : "Unknown error";
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: `Error generating site: ${message}. Please try again.` },
        ]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Auto-publish for anonymous users (fire-and-forget, no loading state)
  const autoPublish = async (filesToPublish: Files) => {
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: filesToPublish,
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
      // Silent fail for auto-publish
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

  const totalSize = Object.values(files).reduce((sum, c) => sum + c.length, 0);
  const resolvedModelName = (() => {
    if (selectedModel === "auto") {
      if (activeModel) {
        const found = models.find((m) => m.id === activeModel);
        const name = found?.name || activeModel.split("/").pop()?.replace(/:free$/, "") || "Auto";
        return `Auto (${name})`;
      }
      return "Auto";
    }
    return models.find((m) => m.id === selectedModel)?.name || selectedModel.split("/").pop() || "Auto";
  })();

  return (
    <div className="flex flex-col h-screen">
    {/* Editor Nav */}
    <nav className="flex items-center justify-between px-4 h-12 border-b border-card-border bg-background shrink-0">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}`} className="text-lg font-bold gradient-text">
          EasySite
        </Link>
        <div className="hidden sm:flex items-center gap-3 text-xs text-muted">
          <Link href={`/${locale}`} className="hover:text-foreground transition">{dict.nav.home}</Link>
          <Link href={`/${locale}/pricing`} className="hover:text-foreground transition">{dict.nav.pricing}</Link>
          <Link href={`/${locale}/models`} className="hover:text-foreground transition">{dict.nav.models}</Link>
          <Link href={`/${locale}/blog`} className="hover:text-foreground transition">{dict.nav.blog}</Link>
          <Link href={`/${locale}/gallery`} className="hover:text-foreground transition">{dict.nav.gallery}</Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleNew}
          className="text-xs text-accent hover:text-accent-dark transition"
        >
          + {dict.editor.newSite}
        </button>
        {user ? (
          <Link href={`/${locale}/dashboard`} className="text-xs text-muted hover:text-foreground transition">
            {dict.nav.dashboard}
          </Link>
        ) : (
          <a href="/auth/login" className="text-xs rounded-md bg-accent px-3 py-1 text-white hover:bg-accent-dark transition">
            {dict.nav.login}
          </a>
        )}
      </div>
    </nav>

    <div className="flex flex-col lg:flex-row flex-1 min-h-0">
      {/* Left: Chat panel */}
      <div className="flex flex-col w-full lg:w-100 border-b lg:border-b-0 lg:border-r border-card-border bg-background">

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
                <AssistantMessage content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          ))}
          {loading && (
            <div className="bg-card-bg text-foreground mr-6 rounded-lg px-3 py-2 text-sm">
              {streamingContent ? (
                <AssistantMessage content={streamingContent} />
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
        <div className="p-3 border-t border-card-border">
          {!user && (
            <p className="text-xs text-muted mb-2 px-1">{dict.editor.loginToManage}</p>
          )}
          <div className="rounded-xl border border-card-border bg-card-bg focus-within:border-accent transition">
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
              className="w-full resize-none bg-transparent px-3 pt-3 pb-1 text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-1.5">
                {models.length > 0 && (
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="text-xs rounded-md bg-background/50 border border-card-border px-2 py-1 text-muted hover:text-foreground focus:outline-none focus:border-accent appearance-none cursor-pointer"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id} disabled={!m.available}>
                        {m.name} {!m.available ? `(${m.tier})` : ""}
                      </option>
                    ))}
                  </select>
                )}
                {userPlan === "free" && (
                  <a
                    href={`/${locale}/pricing`}
                    className="text-xs text-accent hover:underline"
                  >
                    Upgrade
                  </a>
                )}
              </div>
              {loading ? (
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-danger/30 bg-danger/10 p-1.5 text-danger hover:bg-danger/20 transition"
                  title="Stop"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => handleGenerate()}
                  disabled={!prompt.trim()}
                  className="rounded-lg bg-accent p-1.5 text-white hover:bg-accent-dark transition disabled:opacity-30"
                  title={dict.editor.send}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Preview / File tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-card-border bg-card-bg/30">
          {/* Left: Tabs */}
          <div className="flex items-center gap-0.5 min-w-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab("preview")}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === "preview"
                  ? "bg-background text-foreground shadow-sm border border-card-border"
                  : "text-muted hover:text-foreground hover:bg-background/50"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {dict.editor.preview}
            </button>

            {fileNames.map((name) => (
              <button
                key={name}
                onClick={() => setActiveTab(name)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  activeTab === name
                    ? "bg-background text-foreground shadow-sm border border-card-border"
                    : "text-muted hover:text-foreground hover:bg-background/50"
                }`}
              >
                <span className={`font-bold ${getFileColor(name)}`}>
                  {getFileIcon(name)}
                </span>
                {name}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {publishedUrl && (
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-xs text-success hover:underline truncate max-w-40"
              >
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                {publishedUrl.replace(/^\/s\//, "")}
              </a>
            )}

            <button
              onClick={async () => {
                const { exportSiteAsZip } = await import("@/lib/export-site");
                await exportSiteAsZip(files, "my-site");
              }}
              disabled={!hasFiles}
              className="rounded-md border border-card-border p-1.5 text-muted hover:text-foreground hover:border-accent transition disabled:opacity-50"
              title="Export as ZIP"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>

            {user ? (
              <button
                onClick={handlePublish}
                disabled={!hasFiles || publishing}
                className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50 ${
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
            ) : (
              <a
                href="/auth/login"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-dark transition"
              >
                {dict.editor.registerPrivate}
              </a>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0">
          {activeTab === "preview" ? (
            files["package.json"] ? (
              <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" /></div>}>
                <WebContainerPreview files={files} />
              </Suspense>
            ) : previewHtml ? (
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

    {/* Status bar */}
    <div className="flex items-center justify-between px-4 py-1 border-t border-card-border bg-card-bg text-xs text-muted shrink-0">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : hasFiles ? "bg-green-400" : "bg-muted/50"}`} />
          {loading ? "Generating..." : hasFiles ? "Ready" : "No site"}
        </span>
        {hasFiles && (
          <span>{fileNames.length} file{fileNames.length > 1 ? "s" : ""} · {totalSize < 1024 ? `${totalSize} B` : `${(totalSize / 1024).toFixed(1)} KB`}</span>
        )}
        {chatHistory.filter((m) => m.role === "user").length > 0 && (
          <span>{chatHistory.filter((m) => m.role === "user").length} turn{chatHistory.filter((m) => m.role === "user").length > 1 ? "s" : ""}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {publishedUrl && (
          <span className="text-green-400">Published</span>
        )}
        <span>{resolvedModelName}</span>
      </div>
    </div>
    </div>
  );
}
