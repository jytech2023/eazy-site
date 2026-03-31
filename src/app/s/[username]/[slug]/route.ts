import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string; slug: string }> }
) {
  const { username, slug } = await params;

  let site;

  if (username === "anonymous") {
    [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.slug, slug), eq(sites.isAnonymous, true), eq(sites.published, true)))
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

  // Extract index.html from multi-file JSON, or use raw content for legacy
  let html: string;
  try {
    const filesMap = JSON.parse(site.htmlContent) as Record<string, string>;
    html = filesMap["index.html"] || site.htmlContent;
  } catch {
    html = site.htmlContent;
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
