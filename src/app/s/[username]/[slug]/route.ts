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

  // Check if site owner has a paid plan
  let isPaid = false;
  if (site.userId) {
    const [owner] = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, site.userId))
      .limit(1);
    if (owner && owner.plan !== "free") {
      isPaid = true;
    }
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

  // Inject promotional banner for free/anonymous sites
  if (!isPaid) {
    const baseUrl = process.env.APP_BASE_URL || "https://easysite.jytech.us";
    const banner = `<div style="position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-align:center;padding:6px 16px;font-family:-apple-system,system-ui,sans-serif;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
  Built with <a href="${baseUrl}" style="color:#fff;font-weight:600;text-decoration:underline;" target="_blank" rel="noopener">EasySite</a> — Create yours free in seconds
  <a href="${baseUrl}" style="background:#fff;color:#6366f1;padding:2px 10px;border-radius:4px;font-size:12px;font-weight:600;text-decoration:none;margin-left:8px;" target="_blank" rel="noopener">Try it</a>
</div>
<div style="height:32px;"></div>`;

    if (html.includes("<body")) {
      html = html.replace(/(<body[^>]*>)/i, `$1\n${banner}`);
    } else {
      html = banner + html;
    }
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
