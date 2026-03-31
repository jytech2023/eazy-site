import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { readdir, readFile, rm, stat } from "fs/promises";
import path from "path";

// Get username from Auth0 session
async function getUsername(): Promise<string | null> {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return null;
    return (
      (session.user.nickname as string) ||
      (session.user.email as string)?.split("@")[0] ||
      null
    );
  } catch {
    return null;
  }
}

// Scan filesystem to list sites for a user
async function listSitesFromFS(username: string) {
  const userDir = path.join(process.cwd(), "public", "sites", username);
  try {
    const entries = await readdir(userDir);
    const sites = [];

    for (const entry of entries) {
      const entryPath = path.join(userDir, entry);
      const entryStat = await stat(entryPath);

      if (entryStat.isDirectory()) {
        // Multi-file site (new format): public/sites/{username}/{slug}/
        const slugDir = path.join(userDir, entry);
        const dirFiles = await readdir(slugDir);
        let title = "Untitled";

        // Try to extract <title> from index.html
        if (dirFiles.includes("index.html")) {
          const html = await readFile(
            path.join(slugDir, "index.html"),
            "utf-8"
          );
          const titleMatch = html.match(/<title>(.*?)<\/title>/i);
          if (titleMatch) title = titleMatch[1];
        }

        sites.push({
          id: entry,
          slug: entry,
          title,
          published: true,
          isAnonymous: username === "anonymous",
          username,
          files: dirFiles,
          createdAt: entryStat.birthtime.toISOString(),
          updatedAt: entryStat.mtime.toISOString(),
        });
      } else if (entry.endsWith(".html")) {
        // Legacy single-file site: public/sites/{username}/{slug}.html
        const slug = entry.replace(/\.html$/, "");
        const html = await readFile(entryPath, "utf-8");
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);

        sites.push({
          id: slug,
          slug,
          title: titleMatch ? titleMatch[1] : "Untitled",
          published: true,
          isAnonymous: username === "anonymous",
          username,
          files: [entry],
          createdAt: entryStat.birthtime.toISOString(),
          updatedAt: entryStat.mtime.toISOString(),
        });
      }
    }

    // Sort by updatedAt descending
    sites.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return sites;
  } catch {
    return [];
  }
}

// GET: List user's sites
export async function GET(request: Request) {
  const username = await getUsername();
  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const siteId = url.searchParams.get("id");

  const sites = await listSitesFromFS(username);

  if (siteId) {
    const site = sites.find((s) => s.id === siteId || s.slug === siteId);
    if (site) {
      // Load full file contents for editing
      const siteDir = path.join(
        process.cwd(),
        "public",
        "sites",
        username,
        site.slug
      );
      const files: Record<string, string> = {};
      try {
        const dirStat = await stat(siteDir);
        if (dirStat.isDirectory()) {
          const dirFiles = await readdir(siteDir);
          for (const f of dirFiles) {
            files[f] = await readFile(path.join(siteDir, f), "utf-8");
          }
        }
      } catch {
        // Legacy single file
        try {
          const html = await readFile(
            path.join(
              process.cwd(),
              "public",
              "sites",
              username,
              `${site.slug}.html`
            ),
            "utf-8"
          );
          files["index.html"] = html;
        } catch {
          // not found
        }
      }
      return NextResponse.json({ site: { ...site, files } });
    }
    return NextResponse.json({ site: null });
  }

  return NextResponse.json({ sites, plan: "free" });
}

// DELETE: Delete a site
export async function DELETE(request: Request) {
  const username = await getUsername();
  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const siteId = url.searchParams.get("id");
  if (!siteId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Try removing directory first (multi-file), then single file (legacy)
  try {
    const dirPath = path.join(
      process.cwd(),
      "public",
      "sites",
      username,
      siteId
    );
    await rm(dirPath, { recursive: true });
  } catch {
    try {
      const filePath = path.join(
        process.cwd(),
        "public",
        "sites",
        username,
        `${siteId}.html`
      );
      await rm(filePath);
    } catch {
      // not found
    }
  }

  return NextResponse.json({ ok: true });
}

// PATCH: Update a site (e.g. unpublish = delete files)
export async function PATCH(request: Request) {
  const username = await getUsername();
  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, published } = body;

  // Unpublish = remove from filesystem
  if (published === false && id) {
    try {
      const dirPath = path.join(
        process.cwd(),
        "public",
        "sites",
        username,
        id
      );
      await rm(dirPath, { recursive: true });
    } catch {
      try {
        const filePath = path.join(
          process.cwd(),
          "public",
          "sites",
          username,
          `${id}.html`
        );
        await rm(filePath);
      } catch {
        // not found
      }
    }
  }

  return NextResponse.json({ ok: true });
}
