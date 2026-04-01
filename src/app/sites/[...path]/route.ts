import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot) : "";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Expect: /sites/{username}/{slug}/{filename?}
  if (segments.length < 2) {
    return new Response("Not Found", { status: 404 });
  }

  const username = segments[0];
  const slug = segments[1];
  const filename = segments[2] || "index.html";

  // Look up site from database
  let site;

  if (username === "anonymous") {
    [site] = await db
      .select()
      .from(sites)
      .where(
        and(eq(sites.slug, slug), eq(sites.isAnonymous, true), eq(sites.published, true))
      )
      .limit(1);
  } else {
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!dbUser) {
      return new Response("Not Found", { status: 404 });
    }

    [site] = await db
      .select()
      .from(sites)
      .where(
        and(
          eq(sites.slug, slug),
          eq(sites.userId, dbUser.id),
          eq(sites.published, true)
        )
      )
      .limit(1);
  }

  if (!site) {
    return new Response("Not Found", { status: 404 });
  }

  // Get file from R2 first, fallback to DB
  let fileContent: string | undefined;

  const { isR2Configured, getFileFromR2 } = await import("@/lib/r2");
  if (isR2Configured()) {
    const r2File = await getFileFromR2(site.slug, filename);
    if (r2File) fileContent = r2File.content;
  }

  if (fileContent === undefined) {
    try {
      const filesMap = JSON.parse(site.htmlContent) as Record<string, string>;
      fileContent = filesMap[filename];
    } catch {
      if (filename === "index.html" && site.htmlContent) {
        fileContent = site.htmlContent;
      }
    }
  }

  if (fileContent === undefined) {
    return new Response("Not Found", { status: 404 });
  }

  const ext = getExtension(filename);
  const contentType = MIME_TYPES[ext] || "text/html; charset=utf-8";

  return new Response(fileContent, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
