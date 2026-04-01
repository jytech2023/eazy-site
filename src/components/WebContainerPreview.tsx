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

// Expose the container getter for the Terminal component
export { getContainer };

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

// Run a shell command in the container and return the output
export async function runCommand(command: string): Promise<{ exitCode: number; output: string }> {
  if (!globalContainer) throw new Error("WebContainer not booted");

  const args = command.split(/\s+/);
  const cmd = args.shift()!;
  const process = await globalContainer.spawn(cmd, args);

  let output = "";
  await process.output.pipeTo(
    new WritableStream({
      write(data) {
        output += data;
      },
    })
  );

  const exitCode = await process.exit;
  return { exitCode, output };
}

// Read all source files from the container filesystem (skips node_modules, dist, .next, etc.)
export async function readAllFiles(): Promise<Record<string, string> | null> {
  if (!globalContainer) return null;
  const SKIP = new Set(["node_modules", "dist", ".next", ".cache", "build", ".git"]);
  try {
    const result: Record<string, string> = {};
    async function walk(dir: string) {
      const entries = await globalContainer!.fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = dir === "." ? entry.name : `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
          if (!SKIP.has(entry.name)) await walk(fullPath);
        } else {
          try {
            const content = await globalContainer!.fs.readFile(fullPath, "utf-8");
            result[fullPath] = content;
          } catch {
            // skip binary / unreadable files
          }
        }
      }
    }
    await walk(".");
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

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
      log("\x1b[36m[container]\x1b[0m Booted successfully");

      // Mount files
      const tree = filesToTree(files);
      await container.mount(tree);
      const fileCount = Object.keys(files).filter((f) => !f.startsWith("dist/")).length;
      log(`\x1b[36m[container]\x1b[0m ${fileCount} files mounted`);
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
      log("\x1b[32m[container]\x1b[0m Dependencies installed ✓");

      // Detect start script
      let startCmd = "start";
      try {
        const pkg = JSON.parse(files["package.json"]);
        if (pkg.scripts?.dev) startCmd = "dev";
        else if (pkg.scripts?.start) startCmd = "start";
      } catch {}

      // Start dev server
      setStatus("running");
      log(`\x1b[36m[container]\x1b[0m Starting dev server (npm run ${startCmd})...`);

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
        log(`\x1b[32m[container]\x1b[0m Server ready at ${url} ✓`);
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

  // Update only changed files individually (avoids disrupting Vite's file watcher)
  const prevFilesRef = useRef<Files>({});
  const updateFiles = useCallback(async () => {
    if (!containerRef.current || !mountedRef.current) return;
    const container = containerRef.current;

    // Diff: find which files actually changed
    const changed: string[] = [];
    for (const [name, content] of Object.entries(files)) {
      if (name.startsWith("dist/")) continue;
      if (prevFilesRef.current[name] !== content) {
        changed.push(name);
      }
    }
    if (changed.length === 0) return;

    prevFilesRef.current = { ...files };

    try {
      // Write each changed file individually instead of remounting the entire tree
      for (const name of changed) {
        // Ensure parent directories exist
        const parts = name.split("/");
        if (parts.length > 1) {
          let dir = "";
          for (let i = 0; i < parts.length - 1; i++) {
            dir += (dir ? "/" : "") + parts[i];
            try { await container.fs.mkdir(dir); } catch { /* already exists */ }
          }
        }
        await container.fs.writeFile(name, files[name]);
      }
      log(`\x1b[33m[update]\x1b[0m ${changed.join(", ")}`);
    } catch (err) {
      // Fallback: full remount if individual writes fail
      try {
        const tree = filesToTree(files);
        await container.mount(tree);
        log(`\x1b[33m[update]\x1b[0m remounted all files`);
      } catch (mountErr) {
        log(`\x1b[31m[error]\x1b[0m Failed to update files: ${mountErr}`);
      }
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

  // Update files when they change (debounced to avoid spam during streaming)
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (mountedRef.current && status === "ready") {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
      updateTimerRef.current = setTimeout(() => updateFiles(), 3000);
    }
    return () => {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    };
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
