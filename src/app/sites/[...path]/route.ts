import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Expect: /sites/{username}/{slug}.html
  if (segments.length !== 2) {
    return new Response("Not Found", { status: 404 });
  }

  const [username, filename] = segments;
  if (!filename.endsWith(".html")) {
    return new Response("Not Found", { status: 404 });
  }

  const slug = filename.replace(/\.html$/, "");

  // 1. Try to serve the static file from public/sites/
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "sites",
      username,
      filename
    );
    const content = await readFile(filePath, "utf-8");
    return new Response(content, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  } catch {
    // Static file not found, fall through to DB lookup
  }

  // 2. Fallback: serve from database (for serverless envs with ephemeral filesystem)
  let site;

  if (username === "anonymous") {
    [site] = await db
      .select()
      .from(sites)
      .where(
        and(
          eq(sites.slug, slug),
          eq(sites.isAnonymous, true),
          eq(sites.published, true)
        )
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

  return new Response(site.htmlContent, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
