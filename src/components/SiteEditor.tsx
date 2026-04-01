"use client";

import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

const WebContainerPreview = lazy(() => import("./WebContainerPreview"));
const TerminalComponent = lazy(() => import("./Terminal"));
const CodeEditorComponent = lazy(() => import("./CodeEditor"));

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

// Detect if AI is requesting file contents (mini RAG: AI asks → we auto-reply with files)
function detectFileRequests(response: string, currentFiles: Files): string[] {
  const fileNames = Object.keys(currentFiles);
  if (fileNames.length === 0) return [];

  // Strip think blocks before checking
  const cleaned = stripThinkBlocks(response);

  // Check if response is asking for files
  const askingPatterns = /\b(please (share|provide|copy|paste|send|show)|need (the |to see |to read )?(full |complete )?(content|code|source|file)|can you (share|provide|send|show)|copy and paste|provide (the |them|me ))/i;
  if (!askingPatterns.test(cleaned)) return [];

  // Find which files are mentioned
  const requested: string[] = [];
  for (const name of fileNames) {
    const basename = name.split("/").pop()!;
    const nameNoExt = basename.replace(/\.\w+$/, "");
    if (cleaned.includes(basename) || cleaned.includes(name)) {
      requested.push(name);
    } else if (nameNoExt.length > 3 && cleaned.includes(nameNoExt)) {
      requested.push(name);
    }
  }

  // If AI is asking for files AND also generated some code, still provide the files
  // (AI might have done partial work and needs more context)
  return requested;
}

// Detect ```bash command blocks in AI response for execution approval
function parseCommandBlocks(response: string): string[] {
  const commands: string[] = [];
  const regex = /```(?:bash|sh|shell)\s+command\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(response)) !== null) {
    const cmd = match[1].trim();
    if (cmd) commands.push(cmd);
  }
  return commands;
}

// Count how many files are still being streamed (opened but not closed)
function countInProgressFiles(response: string): number {
  const cleaned = stripThinkBlocks(response);
  const opened = (cleaned.match(/```\w+\s+filename=/g) || []).length;
  const closed = (cleaned.match(/\n```(?:\n|$)/g) || []).length;
  return Math.max(0, opened - closed);
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
  const [taskQueue, setTaskQueue] = useState<{ id: string; text: string }[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [pendingFileCount, setPendingFileCount] = useState(0);
  const [leftPanel, setLeftPanel] = useState<"chat" | "files">("chat");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [serverLogs, setServerLogs] = useState<string[]>([]);
  const [pendingCommands, setPendingCommands] = useState<{ id: string; command: string; status: "pending" | "running" | "done" | "skipped"; output?: string }[]>([]);
  const [openTabs, setOpenTabs] = useState<Set<string>>(new Set());
  const [containerStatus, setContainerStatus] = useState<{ status: string; url: string | null }>({ status: "idle", url: null });
  const [buildStatus, setBuildStatus] = useState<"idle" | "building" | "success" | "failed" | "saving">("idle");
  const handleContainerStatus = useCallback((s: string, url: string | null) => {
    setContainerStatus({ status: s, url });
  }, []);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const autoContRef = useRef(0);
  const pendingAutoContRef = useRef(false);
  const processingQueueRef = useRef(false);

  const fileNames = useMemo(() => Object.keys(files), [files]);
  const hasFiles = fileNames.length > 0;
  const previewHtml = useMemo(() => buildPreviewHtml(files), [files]);

  // Refresh: sync files from WebContainer filesystem + reload preview
  const handleRefresh = useCallback(async () => {
    if (files["package.json"]) {
      try {
        const { readAllFiles } = await import("./WebContainerPreview");
        const containerFiles = await readAllFiles();
        if (containerFiles) {
          setFiles(containerFiles);
          setOpenTabs((prev) => {
            const next = new Set<string>();
            prev.forEach((t) => { if (containerFiles[t] !== undefined) next.add(t); });
            return next;
          });
          setActiveTab((prev) => prev !== "preview" && containerFiles[prev] === undefined ? "preview" : prev);
        }
      } catch {}
    }
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.location.reload();
    }
  }, [files]);

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

    // Fetch from API — try public endpoint first (avoids 401 noise), then authenticated
    const loadSite = async () => {
      let data = null;

      // Try public gallery endpoint first (works for all published/anonymous sites)
      try {
        const r = await fetch(`/api/gallery/site?id=${siteId}`);
        if (r.ok) {
          const galleryData = await r.json();
          if (galleryData.files && Object.keys(galleryData.files).length > 0) {
            data = { site: { files: galleryData.files, id: galleryData.id } };
          }
        }
      } catch {}

      // Fall back to authenticated endpoint (for user's own unpublished sites)
      if (!data?.site) {
        try {
          const r = await fetch(`/api/sites?id=${siteId}`);
          if (r.ok) {
            data = await r.json();
          }
        } catch {}
      }

      return data;
    };

    loadSite()
      .then((data) => {
        if (data?.site?.files && typeof data.site.files === "object" && !Array.isArray(data.site.files)) {
          // Filter out build artifacts (dist/) and lock files — editor only needs source
          const sourceFiles: Record<string, string> = {};
          for (const [name, content] of Object.entries(data.site.files as Record<string, string>)) {
            if (name.startsWith("dist/") || name === "package-lock.json") continue;
            sourceFiles[name] = content;
          }
          setFiles(sourceFiles);
        } else if (data?.site?.htmlContent) {
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

  // Submit handler: if AI is busy, queue the task; otherwise run immediately
  const handleSubmit = () => {
    const text = prompt.trim();
    if (!text) return;

    if (loading) {
      // AI is busy — add to task queue
      setTaskQueue((prev) => [...prev, { id: crypto.randomUUID(), text }]);
      setPrompt("");
      // Reset textarea height
      const ta = document.querySelector<HTMLTextAreaElement>(".editor-input-textarea");
      if (ta) ta.style.height = "auto";
      return;
    }

    handleGenerate();
  };

  // Process next item from the task queue
  const processNextTask = () => {
    setTaskQueue((prev) => {
      if (prev.length === 0) return prev;
      const [next, ...rest] = prev;
      // Fire off generation with the queued prompt
      setTimeout(() => handleGenerate(next.text), 100);
      return rest;
    });
  };

  const handleGenerate = async (overridePrompt?: string) => {
    const effectivePrompt = overridePrompt || prompt;
    if (!effectivePrompt.trim()) return;
    if (loading && !overridePrompt) return; // Prevent double-fire, but allow queue-driven calls
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
          files: hasFiles ? Object.fromEntries(
            Object.entries(files).filter(([name]) =>
              !name.startsWith("dist/") && name !== "package-lock.json"
            )
          ) : undefined,
          activeFile: activeTab !== "preview" ? activeTab : undefined,
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
      let lastCommittedCount = 0;
      let lastChunkTime = Date.now();
      let dotCount = 0;

      // Show activity indicator immediately — AI may be reading files via tools before generating text
      if (hasFiles) {
        setStreamingContent("*Analyzing project files...*");
      }

      // Animate the activity indicator while waiting for text
      const toolActivityTimer = setInterval(() => {
        if (!fullResponse.trim()) {
          dotCount = (dotCount + 1) % 4;
          const dots = ".".repeat(dotCount + 1);
          const elapsed = Math.floor((Date.now() - lastChunkTime) / 1000);
          setStreamingContent(
            elapsed > 5
              ? `*Reading and analyzing files${dots} (${elapsed}s)*`
              : `*Analyzing project files${dots}*`
          );
        }
      }, 800);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        lastChunkTime = Date.now();
        setStreamingContent(fullResponse);

        // Only commit fully-closed files during streaming
        const completeParsed = parseFiles(fullResponse);
        const completeCount = Object.keys(completeParsed).length;
        const inProgress = countInProgressFiles(fullResponse);
        setPendingFileCount(inProgress);

        if (completeCount > lastCommittedCount) {
          const merged = mergeFiles(existingFiles, completeParsed);
          setFiles(merged);
          lastCommittedCount = completeCount;
        }
      }

      clearInterval(toolActivityTimer);

      // Final parse, extract inline assets, and merge all files
      setPendingFileCount(0);
      let finalParsed = parseFiles(fullResponse);
      if (Object.keys(finalParsed).length > 0) {
        finalParsed = extractInlineAssets(finalParsed);
        const finalMerged = mergeFiles(existingFiles, finalParsed);
        setFiles(finalMerged);
        setActiveTab("preview");
      }

      // Detect truncated output (inspired by Claude-Code's max_output_tokens recovery)
      const wasTruncated = detectTruncation(fullResponse);

      // Detect if AI is requesting file contents instead of generating code
      // Use current files state (not snapshot) so newly loaded files are available
      const currentFilesForRAG = { ...existingFiles, ...parseFiles(fullResponse) };
      const requestedFiles = detectFileRequests(fullResponse, currentFilesForRAG);

      // Detect command blocks in AI response
      const commands = parseCommandBlocks(fullResponse);
      if (commands.length > 0 && files["package.json"]) {
        setPendingCommands(commands.map((cmd) => ({
          id: crypto.randomUUID(),
          command: cmd,
          status: "pending" as const,
        })));
      }

      setStreamingContent("");
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: fullResponse + (wasTruncated ? "\n\n⚠️ *Output truncated — auto-continuing...*" : "") },
      ]);

      // Always save after AI generation (this is critical — not gated by autoSaveEnabled)
      const finalFiles = mergeFiles(existingFiles, finalParsed);
      if (Object.keys(finalParsed).length > 0) {
        autoSave(finalFiles);
      }

      // If AI requested files, auto-reply with their contents (mini RAG)
      if (requestedFiles.length > 0 && autoContRef.current < 5) {
        autoContRef.current++;
        const fileContents = requestedFiles
          .map((name) => {
            const content = currentFilesForRAG[name];
            if (!content) return null;
            const ext = name.split(".").pop();
            return `\`\`\`${ext} filename=${name}\n${content}\n\`\`\``;
          })
          .filter(Boolean)
          .join("\n\n");

        if (fileContents) {
          const autoReply = `Here are the requested files:\n\n${fileContents}\n\nPlease proceed with the changes now.`;
          pendingAutoContRef.current = false;
          setTimeout(() => handleGenerate(autoReply), 500);
          return; // Skip truncation auto-continue — file request takes priority
        }
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

      // Process next queued task (unless a task is being edited — pause pickup)
      if (!pendingAutoContRef.current && !editingTaskId) {
        setTimeout(() => processNextTask(), 300);
      }
    }
  };

  // Run build in WebContainer and save the output
  const runBuildAndSave = useCallback(async () => {
    if (!files["package.json"]) return;
    if (buildStatus === "building") return; // Already building

    setBuildStatus("building");
    try {
      const { buildInContainer } = await import("./WebContainerPreview");
      const built = await buildInContainer();
      if (built) {
        // Save source + built output together
        const allFiles = { ...files, ...built };
        setBuildStatus("saving");
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: allFiles,
            siteId: currentSiteId,
            draft: !!user,
            title: chatHistory.find((m) => m.role === "user")?.content.slice(0, 50) || "My Site",
          }),
        });
        const data = await res.json();
        if (data.url && !user) setPublishedUrl(data.url);
        if (data.siteId) setCurrentSiteId(data.siteId.toString());
        setBuildStatus("success");
      } else {
        setBuildStatus("failed");
      }
    } catch {
      setBuildStatus("failed");
    }
    setTimeout(() => setBuildStatus("idle"), 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, currentSiteId, user, buildStatus]);

  // Build once when WebContainer first becomes ready (5 min cooldown)
  const hasBuiltOnceRef = useRef(false);
  useEffect(() => {
    if (containerStatus.status === "ready" && files["package.json"] && !hasBuiltOnceRef.current) {
      hasBuiltOnceRef.current = true;
      const timer = setTimeout(() => runBuildAndSave(), 5 * 60 * 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerStatus.status]);

  // Auto-save after each generation turn (fire-and-forget)
  // Anonymous: saves as published (public). Logged-in: saves as draft (private).
  const autoSave = async (filesToSave: Files) => {
    try {
      setBuildStatus("saving");
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: filesToSave,
          siteId: currentSiteId,
          draft: !!user,
          title: chatHistory.find((m) => m.role === "user")?.content.slice(0, 50) || "My Site",
        }),
      });
      const data = await res.json();
      if (data.url && !user) setPublishedUrl(data.url);
      if (data.siteId) setCurrentSiteId(data.siteId.toString());
      setBuildStatus("success");
      setTimeout(() => setBuildStatus("idle"), 3000);
    } catch {
      setBuildStatus("idle");
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

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Run a pending command in WebContainer
  const handleRunCommand = async (id: string) => {
    setPendingCommands((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: "running" as const } : c)
    );

    const cmd = pendingCommands.find((c) => c.id === id);
    if (!cmd) return;

    try {
      const { runCommand } = await import("./WebContainerPreview");
      const result = await runCommand(cmd.command);
      setPendingCommands((prev) =>
        prev.map((c) => c.id === id ? {
          ...c,
          status: "done" as const,
          output: result.output + (result.exitCode !== 0 ? `\n(exit code: ${result.exitCode})` : ""),
        } : c)
      );

      // Add command result to chat so AI has context
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: `[Command executed: \`${cmd.command}\`]\n\`\`\`\n${result.output.slice(0, 2000)}\n\`\`\`` },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setPendingCommands((prev) =>
        prev.map((c) => c.id === id ? { ...c, status: "done" as const, output: `Error: ${msg}` } : c)
      );
    }
  };

  const handleSkipCommand = (id: string) => {
    setPendingCommands((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: "skipped" as const } : c)
    );
  };

  const handleRunAllCommands = async () => {
    for (const cmd of pendingCommands) {
      if (cmd.status === "pending") {
        await handleRunCommand(cmd.id);
      }
    }
  };

  const handleDismissCommands = () => {
    setPendingCommands((prev) => prev.filter((c) => c.status !== "done" && c.status !== "skipped"));
  };

  const renameFile = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName || files[trimmed]) {
      setRenamingFile(null);
      return;
    }
    setFiles((prev) => {
      const updated: Record<string, string> = {};
      for (const [name, content] of Object.entries(prev)) {
        updated[name === oldName ? trimmed : name] = content;
      }
      return updated;
    });
    // Update active tab and open tabs
    if (activeTab === oldName) setActiveTab(trimmed);
    setOpenTabs((prev) => {
      if (!prev.has(oldName)) return prev;
      const next = new Set(prev);
      next.delete(oldName);
      next.add(trimmed);
      return next;
    });
    setRenamingFile(null);
  };

  const deleteFile = (name: string) => {
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    if (activeTab === name) setActiveTab("preview");
    setOpenTabs((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  };

  const updateFile = (name: string, content: string) => {
    setFiles((prev) => {
      const updated = { ...prev, [name]: content };

      // Debounced auto-save: save to DB 2s after last edit (only if enabled)
      if (autoSaveEnabled) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          autoSave(updated);
        }, 2000);
      }

      return updated;
    });
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
      <div className="flex items-center gap-2">
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
        <LanguageSwitcher locale={locale} />
        <ThemeToggle />
      </div>
    </nav>

    <div className="flex flex-col lg:flex-row flex-1 min-h-0">
      {/* Left: Chat + Files panel */}
      <div className="flex flex-col w-full lg:w-100 border-b lg:border-b-0 lg:border-r border-card-border bg-background">

        {/* Panel tabs */}
        <div className="flex items-center border-b border-card-border shrink-0">
          <button
            onClick={() => setLeftPanel("chat")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition ${
              leftPanel === "chat"
                ? "text-foreground border-b-2 border-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            Chat
            {loading && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
          </button>
          <button
            onClick={() => setLeftPanel("files")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition ${
              leftPanel === "files"
                ? "text-foreground border-b-2 border-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            Files
            {hasFiles && <span className="text-[10px] text-muted">({fileNames.length})</span>}
            {pendingFileCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
          </button>
        </div>

        {/* Chat view */}
        {leftPanel === "chat" ? (
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
        ) : (
          /* Files view */
          <div className="flex-1 overflow-y-auto min-h-0 max-h-[30vh] lg:max-h-none">
            {hasFiles ? (
              <div className="p-2 space-y-0.5">
                {/* Refresh file list */}
                <div className="flex items-center justify-end px-1 pb-1">
                  <button
                    onClick={handleRefresh}
                    className="p-1 rounded text-muted hover:text-foreground hover:bg-card-bg transition"
                    title="Refresh files"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M20.016 4.356v4.992" />
                    </svg>
                  </button>
                </div>
                {fileNames.map((name) => (
                  <div key={name} className="group flex items-center gap-1">
                    {renamingFile === name ? (
                      <div className="flex-1 flex items-center gap-1 px-2 py-1">
                        <span className={`text-xs font-bold ${getFileColor(name)}`}>
                          {getFileIcon(name)}
                        </span>
                        <input
                          autoFocus
                          defaultValue={name}
                          className="flex-1 text-sm bg-card-bg border border-accent rounded px-1.5 py-0.5 text-foreground focus:outline-none"
                          onBlur={(e) => renameFile(name, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameFile(name, (e.target as HTMLInputElement).value);
                            if (e.key === "Escape") setRenamingFile(null);
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTab(name);
                          setOpenTabs((prev) => new Set(prev).add(name));
                        }}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          setRenamingFile(name);
                        }}
                        className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition ${
                          activeTab === name && openTabs.has(name)
                            ? "bg-accent/10 text-foreground border border-accent/20"
                            : "text-muted hover:text-foreground hover:bg-card-bg"
                        }`}
                        title="Click to open, double-click to rename"
                      >
                        <span className={`text-xs font-bold ${getFileColor(name)}`}>
                          {getFileIcon(name)}
                        </span>
                        <span className="truncate">{name}</span>
                        <span className="ml-auto text-xs text-muted">
                          {files[name].length < 1024
                            ? `${files[name].length} B`
                            : `${(files[name].length / 1024).toFixed(1)} KB`}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${name}?`)) deleteFile(name);
                      }}
                      className="shrink-0 p-1 rounded text-muted/30 hover:text-danger transition opacity-0 group-hover:opacity-100"
                      title="Delete file"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
                {pendingFileCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    {pendingFileCount} file{pendingFileCount > 1 ? "s" : ""} generating...
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted text-sm py-12">
                No files yet
              </div>
            )}
          </div>
        )}

        {/* Task Queue */}
        {taskQueue.length > 0 && (
          <div className="border-t border-card-border">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
                Queue ({taskQueue.length})
              </span>
              {editingTaskId && (
                <span className="text-yellow-400 normal-case font-normal">paused</span>
              )}
            </div>
            <div className="px-2 pb-2 space-y-1">
              {taskQueue.map((task, idx) => (
                <div
                  key={task.id}
                  className="flex items-start gap-1.5 group"
                >
                  <span className="shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  {editingTaskId === task.id ? (
                    <textarea
                      autoFocus
                      defaultValue={task.text}
                      rows={2}
                      className="flex-1 text-xs rounded-md border border-accent bg-card-bg px-2 py-1 text-foreground resize-none focus:outline-none"
                      onBlur={(e) => {
                        const newText = e.target.value.trim();
                        if (newText) {
                          setTaskQueue((prev) =>
                            prev.map((t) => t.id === task.id ? { ...t, text: newText } : t)
                          );
                        }
                        setEditingTaskId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          (e.target as HTMLTextAreaElement).blur();
                        }
                        if (e.key === "Escape") {
                          setEditingTaskId(null);
                        }
                      }}
                    />
                  ) : (
                    <p
                      className="flex-1 text-xs text-muted truncate cursor-pointer hover:text-foreground transition py-0.5"
                      onClick={() => setEditingTaskId(task.id)}
                      title="Click to edit"
                    >
                      {task.text}
                    </p>
                  )}
                  <button
                    onClick={() => setTaskQueue((prev) => prev.filter((t) => t.id !== task.id))}
                    className="shrink-0 p-0.5 text-muted/50 hover:text-danger transition opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Command Approval */}
        {pendingCommands.some((c) => c.status === "pending" || c.status === "running") && (
          <div className="border-t border-card-border bg-yellow-500/5">
            <div className="px-3 py-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Commands to run
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleRunAllCommands}
                  disabled={pendingCommands.some((c) => c.status === "running")}
                  className="text-xs px-2 py-0.5 rounded bg-success/20 text-success hover:bg-success/30 transition disabled:opacity-50"
                >
                  Run All
                </button>
                <button
                  onClick={() => setPendingCommands((prev) => prev.map((c) => c.status === "pending" ? { ...c, status: "skipped" as const } : c))}
                  className="text-xs px-2 py-0.5 rounded bg-muted/20 text-muted hover:bg-muted/30 transition"
                >
                  Skip All
                </button>
              </div>
            </div>
            <div className="px-2 pb-2 space-y-1">
              {pendingCommands.filter((c) => c.status !== "skipped" && c.status !== "done").map((cmd) => (
                <div key={cmd.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-background/50">
                  <code className="flex-1 text-xs font-mono text-foreground truncate">$ {cmd.command}</code>
                  {cmd.status === "pending" ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleRunCommand(cmd.id)}
                        className="text-xs px-2 py-0.5 rounded bg-success/20 text-success hover:bg-success/30 transition"
                      >
                        Run
                      </button>
                      <button
                        onClick={() => handleSkipCommand(cmd.id)}
                        className="text-xs px-2 py-0.5 rounded bg-muted/20 text-muted hover:bg-muted/30 transition"
                      >
                        Skip
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-yellow-400 animate-pulse shrink-0">Running...</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Command Results */}
        {pendingCommands.some((c) => c.status === "done") && (
          <div className="border-t border-card-border">
            <div className="px-3 py-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Results</span>
              <button onClick={handleDismissCommands} className="text-xs text-muted hover:text-foreground transition">
                Dismiss
              </button>
            </div>
            <div className="px-2 pb-2 space-y-1 max-h-32 overflow-y-auto">
              {pendingCommands.filter((c) => c.status === "done").map((cmd) => (
                <div key={cmd.id} className="px-2 py-1 rounded-md bg-background/50">
                  <code className="text-xs font-mono text-muted">$ {cmd.command}</code>
                  {cmd.output && (
                    <pre className="text-xs text-foreground/70 mt-0.5 whitespace-pre-wrap break-words max-h-20 overflow-y-auto">{cmd.output.slice(0, 500)}</pre>
                  )}
                </div>
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
              onChange={(e) => {
                setPrompt(e.target.value);
                // Auto-grow: reset height then set to scrollHeight
                const el = e.target;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={dict.editor.placeholder}
              rows={1}
              className="editor-input-textarea w-full resize-none bg-transparent px-3 pt-3 pb-1 text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
              style={{ minHeight: "36px", maxHeight: "160px" }}
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
              <div className="flex items-center gap-1">
                {loading && (
                  <button
                    onClick={handleCancel}
                    className="rounded-lg border border-danger/30 bg-danger/10 p-1.5 text-danger hover:bg-danger/20 transition"
                    title="Stop"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className={`rounded-lg p-1.5 text-white transition disabled:opacity-30 ${loading ? "bg-yellow-500 hover:bg-yellow-600" : "bg-accent hover:bg-accent-dark"}`}
                  title={loading ? "Add to queue" : dict.editor.send}
                >
                  {loading ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </div>
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

            {fileNames.filter((name) => openTabs.has(name)).map((name) => (
              <div
                key={name}
                className={`shrink-0 flex items-center gap-1 rounded-md transition group ${
                  activeTab === name
                    ? "bg-background text-foreground shadow-sm border border-card-border"
                    : "text-muted hover:text-foreground hover:bg-background/50"
                }`}
              >
                <button
                  onClick={() => setActiveTab(name)}
                  className="flex items-center gap-1.5 pl-3 pr-1 py-1.5 text-xs font-medium"
                >
                  <span className={`font-bold ${getFileColor(name)}`}>
                    {getFileIcon(name)}
                  </span>
                  {name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenTabs((prev) => { const next = new Set(prev); next.delete(name); return next; });
                    if (activeTab === name) setActiveTab("preview");
                  }}
                  className="p-1 mr-0.5 rounded text-muted/50 hover:text-foreground hover:bg-card-border/50 transition opacity-0 group-hover:opacity-100"
                  title="Close tab"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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

            {/* Refresh: sync files from container + reload preview */}
            <button
              onClick={handleRefresh}
              disabled={!hasFiles}
              className="rounded-md border border-card-border p-1.5 text-muted hover:text-foreground hover:border-accent transition disabled:opacity-50"
              title="Refresh files & preview"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M20.016 4.356v4.992" />
              </svg>
            </button>

            {/* Rebuild & save */}
            {files["package.json"] && containerStatus.status === "ready" && (
              <button
                onClick={() => runBuildAndSave()}
                disabled={buildStatus === "building" || buildStatus === "saving"}
                className={`rounded-md border p-1.5 transition ${
                  buildStatus === "building" || buildStatus === "saving"
                    ? "border-yellow-500/30 text-yellow-400 animate-pulse"
                    : buildStatus === "success"
                      ? "border-success/30 text-success"
                      : buildStatus === "failed"
                        ? "border-danger/30 text-danger"
                        : "border-card-border text-muted hover:text-foreground hover:border-accent"
                }`}
                title={
                  buildStatus === "building" ? "Building..."
                    : buildStatus === "saving" ? "Saving..."
                    : buildStatus === "failed" ? "Build failed — click to retry"
                    : "Rebuild & save"
                }
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.107A1.5 1.5 0 005 13.39v4.223c0 .536.29 1.03.756 1.292l5.384 3.107a1.5 1.5 0 001.52 0l5.384-3.107A1.5 1.5 0 0019 17.613V13.39a1.5 1.5 0 00-.756-1.292L12.86 9.09M11.42 15.17l5.384-3.107M11.42 15.17V20.7m5.44-8.717L12 9.09m4.86 3.893V8.76a1.5 1.5 0 00-.756-1.292l-5.384-3.107a1.5 1.5 0 00-1.52 0L3.816 7.468A1.5 1.5 0 003.06 8.76v4.222" />
                </svg>
              </button>
            )}

            {/* Save without build (for non-framework projects) */}
            {hasFiles && !files["package.json"] && (
              <button
                onClick={() => autoSave(files)}
                disabled={buildStatus === "saving"}
                className={`rounded-md border p-1.5 transition ${
                  buildStatus === "saving"
                    ? "border-yellow-500/30 text-yellow-400 animate-pulse"
                    : buildStatus === "success"
                      ? "border-success/30 text-success"
                      : "border-card-border text-muted hover:text-foreground hover:border-accent"
                }`}
                title={buildStatus === "saving" ? "Saving..." : buildStatus === "success" ? "Saved!" : "Save now"}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
            )}

            {/* Terminal toggle */}
            {files["package.json"] && (
              <button
                onClick={() => {
                  if (!terminalOpen) {
                    // Wire up the container getter for the terminal
                    import("./WebContainerPreview").then(({ getContainer }) => {
                      import("./Terminal").then(({ setContainerGetter }) => {
                        setContainerGetter(getContainer);
                      });
                    });
                  }
                  setTerminalOpen((prev) => !prev);
                }}
                className={`rounded-md border p-1.5 transition ${
                  terminalOpen
                    ? "border-accent text-accent bg-accent/10"
                    : "border-card-border text-muted hover:text-foreground hover:border-accent"
                }`}
                title="Toggle terminal"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3M5.25 20.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </button>
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
                <WebContainerPreview
                  files={files}
                  onStatusChange={handleContainerStatus}
                  onLog={(line) => setServerLogs((prev) => [...prev, line])}
                />
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
            <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" /></div>}>
              <CodeEditorComponent
                filename={activeTab}
                value={files[activeTab]}
                onChange={(val) => updateFile(activeTab, val)}
              />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full text-muted">
              <p>Select a file</p>
            </div>
          )}
        </div>

        {/* Terminal panel */}
        {terminalOpen && (
          <Suspense fallback={null}>
            <TerminalComponent visible={terminalOpen} onClose={() => setTerminalOpen(false)} serverLogs={serverLogs} />
          </Suspense>
        )}
      </div>
    </div>

    {/* Status bar */}
    <div className="flex items-center justify-between px-4 py-1 border-t border-card-border bg-card-bg text-xs text-muted shrink-0">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : hasFiles ? "bg-green-400" : "bg-muted/50"}`} />
          {loading
            ? pendingFileCount > 0
              ? `Writing file... (${pendingFileCount} in progress)`
              : "Generating..."
            : hasFiles ? "Ready" : "No site"}
        </span>
        {hasFiles && (
          <span>{fileNames.length} file{fileNames.length > 1 ? "s" : ""}{pendingFileCount > 0 ? ` (+${pendingFileCount})` : ""} · {totalSize < 1024 ? `${totalSize} B` : `${(totalSize / 1024).toFixed(1)} KB`}</span>
        )}
        {chatHistory.filter((m) => m.role === "user").length > 0 && (
          <span>{chatHistory.filter((m) => m.role === "user").length} turn{chatHistory.filter((m) => m.role === "user").length > 1 ? "s" : ""}</span>
        )}
        {taskQueue.length > 0 && (
          <span className="text-yellow-400">{taskQueue.length} queued</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {buildStatus !== "idle" && (
          <span className="flex items-center gap-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              buildStatus === "success" ? "bg-success"
                : buildStatus === "failed" ? "bg-danger"
                : "bg-blue-400 animate-pulse"
            }`} />
            {buildStatus === "building" ? "Building..."
              : buildStatus === "saving" ? "Saving..."
              : buildStatus === "success" ? "Saved"
              : "Build failed"}
          </span>
        )}
        {containerStatus.status !== "idle" && (
          <span className="flex items-center gap-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              containerStatus.status === "ready" ? "bg-success"
                : containerStatus.status === "error" ? "bg-danger"
                : "bg-yellow-400 animate-pulse"
            }`} />
            {containerStatus.status === "ready"
              ? "Server running"
              : containerStatus.status === "error"
                ? "Server error"
                : containerStatus.status === "booting"
                  ? "Booting..."
                  : containerStatus.status === "installing"
                    ? "Installing..."
                    : "Starting..."}
          </span>
        )}
        {publishedUrl && (
          <span className="text-green-400">Published</span>
        )}
        <button
          onClick={() => setAutoSaveEnabled((prev) => !prev)}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition ${
            autoSaveEnabled
              ? "text-success hover:text-success/80"
              : "text-muted/50 hover:text-muted"
          }`}
          title={autoSaveEnabled ? "Auto-save edits ON — click to disable" : "Auto-save edits OFF — manual edits won't save automatically"}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {autoSaveEnabled ? "Auto" : "Manual"}
        </button>
        <span>{resolvedModelName}</span>
      </div>
    </div>
    </div>
  );
}
