"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Files = Record<string, string>;

// Module-level singleton — WebContainer only allows one instance per page
let globalContainer: import("@webcontainer/api").WebContainer | null = null;
let bootPromise: Promise<import("@webcontainer/api").WebContainer> | null = null;

async function getContainer(): Promise<import("@webcontainer/api").WebContainer> {
  if (globalContainer) return globalContainer;
  if (bootPromise) return bootPromise;
  bootPromise = import("@webcontainer/api").then(async ({ WebContainer }) => {
    globalContainer = await WebContainer.boot();
    return globalContainer;
  });
  return bootPromise;
}

type Status = "idle" | "booting" | "installing" | "running" | "error" | "ready";

const STATUS_LABELS: Record<Status, string> = {
  idle: "Idle",
  booting: "Booting container...",
  installing: "Installing dependencies...",
  running: "Starting dev server...",
  error: "Error",
  ready: "Running",
};

export type WebContainerStatus = Status;

// Run `npm run build` in the container and return the built files
export async function buildInContainer(): Promise<Record<string, string> | null> {
  if (!globalContainer) return null;
  try {
    const buildProcess = await globalContainer.spawn("npm", ["run", "build"]);
    const exitCode = await buildProcess.exit;
    if (exitCode !== 0) return null;

    // Read dist/ directory
    const builtFiles: Record<string, string> = {};
    async function readDir(path: string) {
      const entries = await globalContainer!.fs.readdir(path, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path === "." ? entry.name : `${path}/${entry.name}`;
        if (entry.isDirectory()) {
          await readDir(fullPath);
        } else {
          const content = await globalContainer!.fs.readFile(fullPath, "utf-8");
          builtFiles[fullPath] = content;
        }
      }
    }
    await readDir("dist");
    return Object.keys(builtFiles).length > 0 ? builtFiles : null;
  } catch {
    return null;
  }
}

export default function WebContainerPreview({
  files,
  onLog,
  onStatusChange,
}: {
  files: Files;
  onLog?: (line: string) => void;
  onStatusChange?: (status: Status, url: string | null) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<import("@webcontainer/api").WebContainer | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mountedRef = useRef(false);

  const log = useCallback(
    (msg: string) => {
      onLog?.(msg);
    },
    [onLog]
  );

  // Convert flat files to WebContainer file system tree
  function filesToTree(files: Files): Record<string, { file: { contents: string } } | { directory: Record<string, { file: { contents: string } }> }> {
    const tree: Record<string, unknown> = {};

    for (const [path, contents] of Object.entries(files)) {
      const parts = path.split("/");
      let current = tree;

      for (let i = 0; i < parts.length - 1; i++) {
        const dir = parts[i];
        if (!current[dir]) {
          current[dir] = { directory: {} };
        }
        current = (current[dir] as { directory: Record<string, unknown> }).directory;
      }

      const fileName = parts[parts.length - 1];
      current[fileName] = { file: { contents } };
    }

    return tree as Record<string, { file: { contents: string } }>;
  }

  // Boot and run
  const boot = useCallback(async () => {
    if (!files["package.json"]) return;

    setStatus("booting");
    setError(null);
    setPreviewUrl(null);

    try {
      const container = await getContainer();
      containerRef.current = container;
      log("[container] Booted");

      // Mount files
      const tree = filesToTree(files);
      await container.mount(tree);
      log("[container] Files mounted");
      mountedRef.current = true;

      // Install dependencies
      setStatus("installing");
      log("[container] Running npm install...");
      const installProcess = await container.spawn("npm", ["install"]);

      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            log(`[npm] ${data}`);
          },
        })
      );

      const installExit = await installProcess.exit;
      if (installExit !== 0) {
        throw new Error(`npm install failed with exit code ${installExit}`);
      }
      log("[container] Dependencies installed");

      // Start dev server
      setStatus("running");
      log("[container] Starting dev server...");

      // Detect start script
      let startCmd = "start";
      try {
        const pkg = JSON.parse(files["package.json"]);
        if (pkg.scripts?.dev) startCmd = "dev";
        else if (pkg.scripts?.start) startCmd = "start";
      } catch {}

      const serverProcess = await container.spawn("npm", ["run", startCmd]);
      serverProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            log(`[server] ${data}`);
          },
        })
      );

      // Wait for server to be ready
      container.on("server-ready", (_port, url) => {
        log(`[container] Server ready at ${url}`);
        setPreviewUrl(url);
        setStatus("ready");
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to boot container";
      log(`[error] ${msg}`);
      setError(msg);
      setStatus("error");
    }
  }, [files, log]);

  // Update files without full reboot
  const updateFiles = useCallback(async () => {
    if (!containerRef.current || !mountedRef.current) return;

    try {
      const tree = filesToTree(files);
      await containerRef.current.mount(tree);
      log("[container] Files updated");
    } catch (err) {
      log(`[error] Failed to update files: ${err}`);
    }
  }, [files, log]);

  // Notify parent of status changes
  useEffect(() => {
    onStatusChange?.(status, previewUrl);
  }, [status, previewUrl, onStatusChange]);

  // Auto-boot on first render if package.json exists
  useEffect(() => {
    if (files["package.json"] && status === "idle") {
      boot();
    }
  }, [files, status, boot]);

  // Update files when they change (after initial boot)
  useEffect(() => {
    if (mountedRef.current && status === "ready") {
      updateFiles();
    }
  }, [files, status, updateFiles]);

  // Cleanup — don't teardown the singleton, just clear the local ref
  useEffect(() => {
    return () => {
      containerRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Preview or status */}
      <div className="flex-1 min-h-0">
        {previewUrl ? (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full bg-white border-0"
            title="Preview"
          />
        ) : error ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <p className="text-danger text-sm mb-2">{error}</p>
              <button
                onClick={boot}
                className="text-xs text-accent hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : status !== "idle" ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-muted">{STATUS_LABELS[status]}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            <p>Add a package.json to enable Node.js preview</p>
          </div>
        )}
      </div>

    </div>
  );
}
