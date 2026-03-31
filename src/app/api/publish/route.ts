import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "page-";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

async function writeSiteFiles(
  username: string,
  slug: string,
  files: Record<string, string>
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "sites", username, slug);
  await mkdir(dir, { recursive: true });

  for (const [filename, content] of Object.entries(files)) {
    // Sanitize filename to prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(dir, safeName);
    await writeFile(filePath, content, "utf-8");
  }

  return `/sites/${username}/${slug}/index.html`;
}

// Try to get the logged-in username, returns null for anonymous
async function getUsername(): Promise<string | null> {
  try {
    const { auth0 } = await import("@/lib/auth0");
    const session = await auth0.getSession();
    if (!session?.user) return null;

    const username =
      (session.user.nickname as string) ||
      (session.user.email as string)?.split("@")[0] ||
      `user${Date.now()}`;

    return username;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { files, html, title } = body;

  // Support both multi-file and legacy single-html
  const siteFiles: Record<string, string> =
    files && Object.keys(files).length > 0
      ? files
      : html
        ? { "index.html": html }
        : {};

  if (Object.keys(siteFiles).length === 0) {
    return NextResponse.json({ error: "No content" }, { status: 400 });
  }

  const slug = generateSlug();
  const username = (await getUsername()) || "anonymous";

  // Write all static files
  const url = await writeSiteFiles(username, slug, siteFiles);

  // Optionally persist to DB if configured
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@/lib/db");
      const { sites } = await import("@/lib/schema");

      await db.insert(sites).values({
        title: title || "Untitled",
        slug,
        htmlContent: JSON.stringify(siteFiles),
        published: true,
        isAnonymous: username === "anonymous",
        userId: null,
        sessionId: null,
      });
    } catch {
      // DB not available, static files still work
    }
  }

  return NextResponse.json({ url });
}
