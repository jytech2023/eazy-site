import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

const FREE_DAILY_VIEW_LIMIT = 300_000;

// Inline CSS and JS files into the HTML so it works as a standalone page.
// For Vite builds: some CSS is loaded dynamically by JS, not via <link> tags.
// We inject ALL CSS files into <head> and ALL JS at end of <body>.
function inlineAssets(html: string, filesMap: Record<string, string>): string {
  let result = html;

  const byBasename = new Map<string, { name: string; content: string }>();
  for (const [name, content] of Object.entries(filesMap)) {
    if (name.endsWith(".html")) continue;
    const basename = name.split("/").pop()!;
    byBasename.set(basename, { name, content });
  }

  // Track which CSS files get inlined via <link> replacement
  const inlinedCssFiles = new Set<string>();

  // Replace <link> stylesheet references
  result = result.replace(
    /<link[^>]*href=["']([^"']+\.css)["'][^>]*\/?>/gi,
    (match, href: string) => {
      const basename = href.split("/").pop()!;
      const file = byBasename.get(basename);
      if (file) { inlinedCssFiles.add(file.name); return `<style>\n${file.content}\n</style>`; }
      const exact = filesMap[href] || filesMap[href.replace(/^\//, "")];
      if (exact) { inlinedCssFiles.add(href); return `<style>\n${exact}\n</style>`; }
      return match;
    }
  );

  // Inject any remaining CSS files that weren't referenced by <link> tags
  // (Vite often loads CSS via JS dynamic imports — these would be missing)
  const extraCss: string[] = [];
  for (const [name, content] of Object.entries(filesMap)) {
    if (!name.endsWith(".css")) continue;
    if (inlinedCssFiles.has(name)) continue;
    // Include dist/ CSS files and top-level CSS (style.css, src/style.css)
    if (name.startsWith("dist/") || !name.includes("/") || name.startsWith("src/")) {
      extraCss.push(`<style>/* ${name} */\n${content}\n</style>`);
    }
  }
  if (extraCss.length > 0) {
    const headCloseIdx = result.lastIndexOf("</head>");
    if (headCloseIdx !== -1) {
      result = result.slice(0, headCloseIdx) + extraCss.join("\n") + "\n" + result.slice(headCloseIdx);
    }
  }

  // Replace <script> references — collect and move to end of body
  const inlinedScripts: string[] = [];
  result = result.replace(
    /<script[^>]*src=["']([^"']+\.js)["'][^>]*>\s*<\/script>/gi,
    (match, src: string) => {
      const basename = src.split("/").pop()!;
      const file = byBasename.get(basename);
      if (file) { inlinedScripts.push(file.content); return ""; }
      const exact = filesMap[src] || filesMap[src.replace(/^\//, "")];
      if (exact) { inlinedScripts.push(exact); return ""; }
      return match;
    }
  );

  if (inlinedScripts.length > 0) {
    const scripts = inlinedScripts.map((s) => `<script>\n${s}\n</script>`).join("\n");
    const bodyCloseIdx = result.lastIndexOf("</body>");
    if (bodyCloseIdx !== -1) {
      result = result.slice(0, bodyCloseIdx) + scripts + "\n" + result.slice(bodyCloseIdx);
    } else {
      result += scripts;
    }
  }

  return result;
}

async function getFilesForSite(
  site: { htmlContent: string; slug: string }
): Promise<Record<string, string> | null> {
  // Try R2 first
  const { isR2Configured, getSiteFilesFromR2 } = await import("@/lib/r2");
  if (isR2Configured()) {
    const r2Files = await getSiteFilesFromR2(site.slug);
    if (r2Files) return r2Files;
  }

  // Fallback to DB
  try {
    const files = JSON.parse(site.htmlContent);
    if (typeof files === "object" && files["index.html"]) return files;
  } catch {}

  if (site.htmlContent && site.htmlContent.trim().startsWith("<!")) {
    return { "index.html": site.htmlContent };
  }

  return null;
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
        and(eq(sites.slug, slug), eq(sites.userId, dbUser.id), eq(sites.published, true))
      )
      .limit(1);
  }

  if (!site) {
    return new Response("Not Found", { status: 404 });
  }

  // Check daily view limit for free plan
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

  // Check daily views — self-resetting, no cron needed
  const today = new Date().toISOString().slice(0, 10); // "2026-03-31"
  const todayViews = site.viewsDate === today ? site.viewsToday : 0;

  if (!isPaid && todayViews >= FREE_DAILY_VIEW_LIMIT) {
    const baseUrl = process.env.APP_BASE_URL || "https://easysite.jytech.us";
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Site Paused</title><style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#0f0f0f;color:#fff}.card{text-align:center;padding:3rem 2rem;max-width:480px}h1{font-size:1.5rem;margin-bottom:0.75rem}p{color:#888;margin-bottom:1.5rem;line-height:1.6}a{display:inline-block;background:#6366f1;color:#fff;padding:0.75rem 2rem;border-radius:0.5rem;text-decoration:none;font-weight:500}</style></head><body><div class="card"><h1>Site Temporarily Paused</h1><p>This site has exceeded 300,000 views today on the free plan. It will be available again tomorrow, or the owner can upgrade for unlimited views.</p><a href="${baseUrl}/en/pricing">View Plans</a></div></body></html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  // Increment view count (fire and forget, self-resetting daily)
  if (site.viewsDate === today) {
    db.update(sites)
      .set({
        views: sql`${sites.views} + 1`,
        viewsToday: sql`${sites.viewsToday} + 1`,
      })
      .where(eq(sites.id, site.id))
      .catch(() => {});
  } else {
    // New day — reset daily counter
    db.update(sites)
      .set({
        views: sql`${sites.views} + 1`,
        viewsToday: 1,
        viewsDate: today,
      })
      .where(eq(sites.id, site.id))
      .catch(() => {});
  }

  // Get files from R2 or DB
  const filesMap = await getFilesForSite(site);
  if (!filesMap) {
    return new Response("Site content not found", { status: 404 });
  }

  // Handle React/framework projects
  let html: string;
  if (filesMap["package.json"] && Object.keys(filesMap).some((f) => /\.(jsx|tsx)$/.test(f))) {
    if (filesMap["dist/index.html"]) {
      html = filesMap["dist/index.html"];
      html = inlineAssets(html, filesMap);
    } else {
      const baseUrl = process.env.APP_BASE_URL || "https://easysite.jytech.us";
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${site.title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#0f0f0f;color:#fff}.card{text-align:center;padding:3rem 2rem;max-width:480px}h1{font-size:1.5rem;margin-bottom:0.75rem}p{color:#888;margin-bottom:1.5rem;line-height:1.6}a{display:inline-block;background:#6366f1;color:#fff;padding:0.75rem 2rem;border-radius:0.5rem;text-decoration:none;font-weight:500}</style></head><body><div class="card"><h1>This site uses React</h1><p>Open it in the EasySite editor to preview and interact.</p><a href="${baseUrl}/en/editor/${site.id}">Open in Editor</a></div></body></html>`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cross-Origin-Resource-Policy": "cross-origin",
          },
        }
      );
    }
  } else {
    html = filesMap["index.html"] || "";
    html = inlineAssets(html, filesMap);
  }

  // Inject promo banner for free/anonymous sites
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
