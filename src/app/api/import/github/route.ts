import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { users, sites } from "@/lib/schema";
import { eq } from "drizzle-orm";

const STATIC_EXTENSIONS = new Set([
  ".html",
  ".css",
  ".js",
  ".json",
  ".svg",
  ".txt",
  ".xml",
  ".ico",
  ".webmanifest",
]);

const IGNORE_PATHS = new Set([
  "node_modules",
  ".git",
  ".github",
  ".next",
  "dist",
  "build",
  ".env",
  ".env.local",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
]);

const MAX_FILES = 20;
const MAX_FILE_SIZE = 500_000; // 500KB per file
const MAX_TOTAL_SIZE = 2_000_000; // 2MB total

function getExtension(path: string): string {
  const dot = path.lastIndexOf(".");
  return dot >= 0 ? path.slice(dot) : "";
}

function shouldInclude(path: string): boolean {
  const parts = path.split("/");
  if (parts.some((p) => IGNORE_PATHS.has(p))) return false;
  const ext = getExtension(path);
  return STATIC_EXTENSIONS.has(ext);
}

async function getDbUser() {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return null;
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.auth0Id, session.user.sub))
    .limit(1);
  return dbUser ?? null;
}

type GitHubTreeItem = {
  path: string;
  type: string;
  size?: number;
  sha: string;
};

export async function POST(request: Request) {
  const user = await getDbUser();
  if (!user?.githubToken) {
    return NextResponse.json(
      { error: "GitHub not connected" },
      { status: 400 }
    );
  }

  const { repo, branch } = await request.json();
  if (!repo) {
    return NextResponse.json({ error: "Missing repo" }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${user.githubToken}`,
    Accept: "application/vnd.github+json",
  };

  // Get repo tree recursively
  const branchName = branch || "main";
  const treeRes = await fetch(
    `https://api.github.com/repos/${repo}/git/trees/${branchName}?recursive=1`,
    { headers }
  );

  if (!treeRes.ok) {
    // Try "master" if "main" fails
    if (branchName === "main") {
      const retryRes = await fetch(
        `https://api.github.com/repos/${repo}/git/trees/master?recursive=1`,
        { headers }
      );
      if (!retryRes.ok) {
        return NextResponse.json(
          { error: "Cannot access repository. Check if it exists and you have access." },
          { status: 400 }
        );
      }
      const retryData = await retryRes.json();
      return processTree(retryData.tree, repo, user, headers);
    }
    return NextResponse.json(
      { error: "Cannot access repository branch" },
      { status: 400 }
    );
  }

  const treeData = await treeRes.json();
  return processTree(treeData.tree, repo, user, headers);
}

async function processTree(
  tree: GitHubTreeItem[],
  repo: string,
  user: { id: number; username: string | null },
  headers: Record<string, string>
) {
  // Filter to static files
  const staticFiles = tree.filter(
    (item: GitHubTreeItem) =>
      item.type === "blob" &&
      shouldInclude(item.path) &&
      (item.size || 0) <= MAX_FILE_SIZE
  );

  if (staticFiles.length === 0) {
    return NextResponse.json(
      { error: "No static files found in this repository (HTML, CSS, JS)." },
      { status: 400 }
    );
  }

  // Limit files
  const filesToFetch = staticFiles.slice(0, MAX_FILES);

  // Fetch file contents
  const files: Record<string, string> = {};
  let totalSize = 0;

  for (const file of filesToFetch) {
    if (totalSize >= MAX_TOTAL_SIZE) break;

    const contentRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${file.path}`,
      { headers }
    );

    if (!contentRes.ok) continue;

    const contentData = await contentRes.json();
    if (contentData.encoding === "base64" && contentData.content) {
      const decoded = Buffer.from(contentData.content, "base64").toString(
        "utf-8"
      );
      // Use just the filename for root files, keep path for nested
      const name = file.path.includes("/") ? file.path : file.path;
      files[name] = decoded;
      totalSize += decoded.length;
    }
  }

  if (Object.keys(files).length === 0) {
    return NextResponse.json(
      { error: "Could not read any files from the repository." },
      { status: 400 }
    );
  }

  // Generate slug
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "page-";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }

  // Extract title from index.html
  const html = files["index.html"] || "";
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const repoName = repo.split("/").pop() || "Imported Site";
  const title = titleMatch ? titleMatch[1] : repoName;

  // Upload to R2 if configured
  const { isR2Configured, uploadSiteToR2 } = await import("@/lib/r2");
  if (isR2Configured()) {
    await uploadSiteToR2(slug, files);
  }

  // Save metadata to DB
  const [site] = await db
    .insert(sites)
    .values({
      title,
      slug,
      htmlContent: isR2Configured() ? "{}" : JSON.stringify(files),
      published: false,
      isAnonymous: false,
      userId: user.id,
      sessionId: null,
    })
    .returning();

  return NextResponse.json({
    siteId: site.id,
    slug,
    title,
    fileCount: Object.keys(files).length,
    totalSize,
  });
}
