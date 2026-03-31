import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// Inline CSS and JS files into the HTML so it works as a standalone page.
// This is necessary because the /s/ route only serves index.html — relative
// paths like "style.css" would resolve to /s/username/style.css which doesn't exist.
function inlineAssets(html: string, filesMap: Record<string, string>): string {
  let result = html;

  for (const [name, content] of Object.entries(filesMap)) {
    if (name === "index.html") continue;

    if (name.endsWith(".css")) {
      // Replace <link href="style.css"> with inline <style>
      const linkPattern = new RegExp(
        `<link[^>]*href=["']${name.replace(".", "\\.")}["'][^>]*/?>`,
        "i"
      );
      if (linkPattern.test(result)) {
        result = result.replace(linkPattern, `<style>\n${content}\n</style>`);
      } else if (result.includes("</head>")) {
        result = result.replace("</head>", `<style>\n${content}\n</style>\n</head>`);
      }
    } else if (name.endsWith(".js")) {
      // Replace <script src="script.js"> with inline <script>
      const scriptPattern = new RegExp(
        `<script[^>]*src=["']${name.replace(".", "\\.")}["'][^>]*>\\s*</script>`,
        "i"
      );
      if (scriptPattern.test(result)) {
        result = result.replace(scriptPattern, `<script>\n${content}\n</script>`);
      } else if (result.includes("</body>")) {
        result = result.replace("</body>", `<script>\n${content}\n</script>\n</body>`);
      }
    }
  }

  return result;
}

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

  // Build a self-contained HTML page by inlining CSS/JS assets
  let html: string;
  try {
    const filesMap = JSON.parse(site.htmlContent) as Record<string, string>;
    html = filesMap["index.html"] || site.htmlContent;
    html = inlineAssets(html, filesMap);
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
