"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
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

export default function SiteEditor({
  locale,
  dict,
  siteId,
}: {
  locale: string;
  dict: Dict;
  siteId?: string;
}) {
  const { user } = useUser();
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [currentSiteId, setCurrentSiteId] = useState<string | undefined>(
    siteId
  );
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const [streamingContent, setStreamingContent] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load existing site if editing
  useEffect(() => {
    if (siteId) {
      fetch(`/api/sites?id=${siteId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.site) {
            setHtml(data.site.htmlContent);
            setCurrentSiteId(data.site.id.toString());
          }
        });
    }
  }, [siteId]);

  // Update iframe via srcdoc is handled declaratively below

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setPublishedUrl(null);

    const userMessage = { role: "user", content: prompt };
    setChatHistory((prev) => [...prev, userMessage]);
    setPrompt("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          currentHtml: html,
          siteId: currentSiteId,
          history: chatHistory.slice(-6),
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let extractedHtml = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        // Show streaming markdown in chat
        setStreamingContent(fullResponse);

        // Extract HTML from response (between ```html and ```)
        const htmlMatch = fullResponse.match(
          /```html\n([\s\S]*?)```|<!DOCTYPE[\s\S]*$/i
        );
        if (htmlMatch) {
          extractedHtml = htmlMatch[1] || htmlMatch[0];
          if (extractedHtml.trim().startsWith("<!DOCTYPE")) {
            setHtml(extractedHtml);
          }
        }
      }

      // Final extraction
      const finalMatch = fullResponse.match(/```html\n([\s\S]*?)```/);
      if (finalMatch) {
        extractedHtml = finalMatch[1];
        setHtml(extractedHtml);
      } else if (fullResponse.trim().startsWith("<!DOCTYPE")) {
        extractedHtml = fullResponse.trim();
        setHtml(extractedHtml);
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
    if (!html || publishing) return;
    setPublishing(true);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
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
    setHtml("");
    setPrompt("");
    setChatHistory([]);
    setCurrentSiteId(undefined);
    setPublishedUrl(null);
    window.history.replaceState(null, "", `/${locale}/editor`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      {/* Left: Chat panel */}
      <div className="flex flex-col w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-card-border bg-background">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[30vh] lg:max-h-none">
          {chatHistory.length === 0 && (
            <div className="text-center text-muted py-12">
              <svg
                className="mx-auto h-12 w-12 text-muted/50 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingContent}
                  </ReactMarkdown>
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

        {/* Input */}
        <div className="p-4 border-t border-card-border">
          {!user && (
            <p className="text-xs text-muted mb-2">{dict.editor.loginToManage}</p>
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

      {/* Right: Preview / Code */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Tabs & Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
          <div className="flex gap-1 bg-card-bg rounded-lg p-1">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 text-sm rounded-md transition ${
                activeTab === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {dict.editor.preview}
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1 text-sm rounded-md transition ${
                activeTab === "code"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {dict.editor.code}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {publishedUrl && (
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline truncate max-w-[200px]"
              >
                {publishedUrl}
              </a>
            )}
            <button
              onClick={handlePublish}
              disabled={!html || publishing}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
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
            html ? (
              <iframe
                ref={iframeRef}
                srcDoc={html}
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted">
                <p>{dict.editor.placeholder}</p>
              </div>
            )
          ) : (
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full h-full code-editor bg-card-bg p-4 text-foreground focus:outline-none"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
