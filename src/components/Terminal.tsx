"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { WebContainer } from "@webcontainer/api";

// Module-level reference to the shared WebContainer instance
let getGlobalContainer: (() => Promise<WebContainer>) | null = null;

export function setContainerGetter(getter: () => Promise<WebContainer>) {
  getGlobalContainer = getter;
}

interface ShellTab {
  id: number;
  label: string;
  type: "shell" | "server";
}

let nextShellId = 1;

export default function Terminal({
  visible,
  onClose,
  serverLogs,
}: {
  visible: boolean;
  onClose: () => void;
  serverLogs?: string[];
}) {
  const [tabs, setTabs] = useState<ShellTab[]>(() => [
    { id: 0, label: "Server", type: "server" },
    { id: nextShellId, label: "Shell 1", type: "shell" },
  ]);
  const [activeTabId, setActiveTabId] = useState(0); // Default to Server tab

  // Refs keyed by tab id
  const termContainersRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const xtermsRef = useRef<Map<number, import("@xterm/xterm").Terminal>>(new Map());
  const shellWritersRef = useRef<Map<number, WritableStreamDefaultWriter>>(new Map());
  const initedRef = useRef<Set<number>>(new Set());
  const fitAddonsRef = useRef<Map<number, import("@xterm/addon-fit").FitAddon>>(new Map());

  // Server log terminal
  const serverTermRef = useRef<import("@xterm/xterm").Terminal | null>(null);
  const serverInitedRef = useRef(false);
  const serverContainerRef = useRef<HTMLDivElement | null>(null);
  const serverFitRef = useRef<import("@xterm/addon-fit").FitAddon | null>(null);
  const lastServerLogIndexRef = useRef(0);

  const initShellTerminal = useCallback(async (tabId: number) => {
    if (initedRef.current.has(tabId)) return;
    const el = termContainersRef.current.get(tabId);
    if (!el) return;
    initedRef.current.add(tabId);

    const { Terminal } = await import("@xterm/xterm");
    const { FitAddon } = await import("@xterm/addon-fit");
    await import("@xterm/xterm/css/xterm.css");

    const term = new Terminal({
      fontSize: 13,
      fontFamily: "var(--font-geist-mono), monospace",
      theme: {
        background: "#1a1a1a",
        foreground: "#e0e0e0",
        cursor: "#6366f1",
        selectionBackground: "#6366f140",
      },
      cursorBlink: true,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(el);
    fitAddon.fit();
    xtermsRef.current.set(tabId, term);
    fitAddonsRef.current.set(tabId, fitAddon);

    const observer = new ResizeObserver(() => fitAddon.fit());
    observer.observe(el);

    try {
      if (!getGlobalContainer) {
        term.writeln("\x1b[33mWebContainer not available. Boot a project with package.json first.\x1b[0m");
        return;
      }

      const container = await getGlobalContainer();
      term.writeln("\x1b[32mConnected to WebContainer shell\x1b[0m");
      term.writeln("");

      const shell = await container.spawn("jsh", {
        terminal: { cols: term.cols, rows: term.rows },
      });

      shell.output.pipeTo(
        new WritableStream({
          write(data) {
            term.write(data);
          },
        })
      );

      const writer = shell.input.getWriter();
      shellWritersRef.current.set(tabId, writer);

      term.onData((data) => {
        writer.write(data);
      });

      term.onResize(({ cols, rows }) => {
        shell.resize({ cols, rows });
      });
    } catch (err) {
      term.writeln(`\x1b[31mFailed to start shell: ${err}\x1b[0m`);
    }
  }, []);

  const initServerTerminal = useCallback(async () => {
    if (serverInitedRef.current || !serverContainerRef.current) return;
    serverInitedRef.current = true;

    const { Terminal } = await import("@xterm/xterm");
    const { FitAddon } = await import("@xterm/addon-fit");
    await import("@xterm/xterm/css/xterm.css");

    const term = new Terminal({
      fontSize: 13,
      fontFamily: "var(--font-geist-mono), monospace",
      theme: {
        background: "#1a1a1a",
        foreground: "#e0e0e0",
        cursor: "#6366f1",
        selectionBackground: "#6366f140",
      },
      disableStdin: true,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(serverContainerRef.current);
    fitAddon.fit();
    serverTermRef.current = term;
    serverFitRef.current = fitAddon;

    const observer = new ResizeObserver(() => fitAddon.fit());
    observer.observe(serverContainerRef.current);

    term.writeln("\x1b[90m--- Server output ---\x1b[0m");
    // Write any existing logs
    if (serverLogs) {
      for (const line of serverLogs) {
        term.writeln(line);
      }
      lastServerLogIndexRef.current = serverLogs.length;
    }
  }, [serverLogs]);

  // Stream new server logs to the server terminal
  useEffect(() => {
    if (!serverTermRef.current || !serverLogs) return;
    const start = lastServerLogIndexRef.current;
    for (let i = start; i < serverLogs.length; i++) {
      serverTermRef.current.writeln(serverLogs[i]);
    }
    lastServerLogIndexRef.current = serverLogs.length;
  }, [serverLogs]);

  // Init active tab's terminal
  useEffect(() => {
    if (!visible) return;
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;
    if (activeTab.type === "server") {
      initServerTerminal();
    } else {
      initShellTerminal(activeTabId);
    }
  }, [visible, activeTabId, tabs, initShellTerminal, initServerTerminal]);

  // Re-fit when switching tabs
  useEffect(() => {
    if (!visible) return;
    requestAnimationFrame(() => {
      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (activeTab?.type === "server") {
        serverFitRef.current?.fit();
      } else {
        fitAddonsRef.current.get(activeTabId)?.fit();
      }
    });
  }, [visible, activeTabId, tabs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shellWritersRef.current.forEach((w) => w.close().catch(() => {}));
      xtermsRef.current.forEach((t) => t.dispose());
      serverTermRef.current?.dispose();
      xtermsRef.current.clear();
      shellWritersRef.current.clear();
      fitAddonsRef.current.clear();
      initedRef.current.clear();
      serverTermRef.current = null;
      serverInitedRef.current = false;
      lastServerLogIndexRef.current = 0;
    };
  }, []);

  const addShell = () => {
    nextShellId++;
    const shellCount = tabs.filter((t) => t.type === "shell").length + 1;
    const newTab: ShellTab = { id: nextShellId, label: `Shell ${shellCount}`, type: "shell" };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: number) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab || tab.type === "server") return; // can't close server tab

    // Cleanup this shell
    shellWritersRef.current.get(tabId)?.close().catch(() => {});
    xtermsRef.current.get(tabId)?.dispose();
    shellWritersRef.current.delete(tabId);
    xtermsRef.current.delete(tabId);
    fitAddonsRef.current.delete(tabId);
    initedRef.current.delete(tabId);

    setTabs((prev) => prev.filter((t) => t.id !== tabId));
    if (activeTabId === tabId) {
      // Switch to the last remaining tab
      setActiveTabId((prev) => {
        const remaining = tabs.filter((t) => t.id !== tabId);
        return remaining[remaining.length - 1]?.id ?? 0;
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="border-t border-card-border bg-[#1a1a1a] flex flex-col shrink-0" style={{ height: "220px" }}>
      {/* Tab bar */}
      <div className="flex items-center justify-between px-1 border-b border-card-border/50 shrink-0">
        <div className="flex items-center gap-0 overflow-x-auto min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-1 shrink-0 group ${
                activeTabId === tab.id
                  ? "bg-[#1a1a1a] text-foreground"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              <button
                onClick={() => setActiveTabId(tab.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
              >
                {tab.type === "server" ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3" />
                  </svg>
                )}
                {tab.label}
              </button>
              {tab.type === "shell" && (
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className="p-0.5 mr-1 rounded text-muted/40 hover:text-foreground transition opacity-0 group-hover:opacity-100"
                  title="Close shell"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* Add shell button */}
          <button
            onClick={addShell}
            className="shrink-0 p-1 ml-0.5 text-muted hover:text-foreground transition rounded hover:bg-white/5"
            title="New shell"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-muted hover:text-foreground transition shrink-0"
          title="Close terminal panel"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Terminal panels */}
      <div className="flex-1 min-h-0 relative">
        {/* Server log terminal */}
        <div
          ref={serverContainerRef}
          className="absolute inset-0 p-1"
          style={{ display: activeTabId === 0 ? "block" : "none" }}
        />

        {/* Shell terminals */}
        {tabs.filter((t) => t.type === "shell").map((tab) => (
          <div
            key={tab.id}
            ref={(el) => {
              if (el) termContainersRef.current.set(tab.id, el);
              else termContainersRef.current.delete(tab.id);
            }}
            className="absolute inset-0 p-1"
            style={{ display: activeTabId === tab.id ? "block" : "none" }}
          />
        ))}
      </div>
    </div>
  );
}
