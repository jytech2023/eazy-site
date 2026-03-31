import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// Inline CSS and JS files into the HTML so it works as a standalone page.
// Handles both simple filenames (style.css) and build output paths (/assets/index-hash.js).
function inlineAssets(html: string, filesMap: Record<string, string>): string {
  let result = html;

  // Build a lookup: basename → content (for matching href/src references)
  const byBasename = new Map<string, { name: string; content: string }>();
  for (const [name, content] of Object.entries(filesMap)) {
    if (name.endsWith(".html")) continue;
    // Store by the last path segment (e.g., "dist/assets/index-abc.js" → "index-abc.js")
    const basename = name.split("/").pop()!;
    byBasename.set(basename, { name, content });
  }

  // Replace all <link> stylesheet references
  result = result.replace(
    /<link[^>]*href=["']([^"']+\.css)["'][^>]*\/?>/gi,
    (match, href: string) => {
      const basename = href.split("/").pop()!;
      const file = byBasename.get(basename);
      if (file) {
        return `<style>\n${file.content}\n</style>`;
      }
      // Try exact match from filesMap
      const exact = filesMap[href] || filesMap[href.replace(/^\//, "")];
      if (exact) return `<style>\n${exact}\n</style>`;
      return match;
    }
  );

  // Collect inlined scripts and move them to end of <body>
  // (React's createRoot needs <div id="root"> to exist first)
  const inlinedScripts: string[] = [];

  result = result.replace(
    /<script[^>]*src=["']([^"']+\.js)["'][^>]*>\s*<\/script>/gi,
    (match, src: string) => {
      const basename = src.split("/").pop()!;
      const file = byBasename.get(basename);
      if (file) {
        inlinedScripts.push(file.content);
        return ""; // Remove from original position
      }
      const exact = filesMap[src] || filesMap[src.replace(/^\//, "")];
      if (exact) {
        inlinedScripts.push(exact);
        return "";
      }
      return match;
    }
  );

  // Inject all scripts at end of body so DOM is ready
  // Use lastIndexOf to avoid matching "</body>" strings inside JS code
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

    // Check if this is a framework project (has package.json with JSX/TSX files)
    // These can't be served as static HTML — need a build step
    if (filesMap["package.json"] && Object.keys(filesMap).some((f) => /\.(jsx|tsx)$/.test(f))) {
      // If built output exists (dist/index.html), serve that with inlined assets
      if (filesMap["dist/index.html"]) {
        html = filesMap["dist/index.html"];
        // Collect dist/ files for inlining (strip "dist/" prefix isn't needed — basename matching handles it)
        html = inlineAssets(html, filesMap);
      } else {
        // No built output — show a landing page that links to the editor
        const baseUrl = process.env.APP_BASE_URL || "https://easysite.jytech.us";
        const editUrl = `${baseUrl}/${username === "anonymous" ? "en" : "en"}/editor/${site.id}`;
        html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${site.title || "EasySite"}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#0f0f0f;color:#fff}.card{text-align:center;padding:3rem 2rem;max-width:480px}h1{font-size:1.5rem;margin-bottom:0.75rem}p{color:#888;margin-bottom:1.5rem;line-height:1.6}a{display:inline-block;background:#6366f1;color:#fff;padding:0.75rem 2rem;border-radius:0.5rem;text-decoration:none;font-weight:500;transition:background 0.2s}a:hover{background:#4f46e5}</style></head><body><div class="card"><h1>This site uses React</h1><p>This project requires a build step to run. Open it in the EasySite editor to preview and interact with it.</p><a href="${editUrl}">Open in Editor</a></div></body></html>`;
        // Skip inlineAssets and banner injection
        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=60, s-maxage=300",
            "Cross-Origin-Resource-Policy": "cross-origin",
          },
        });
      }
    } else {
      html = filesMap["index.html"] || site.htmlContent;
      html = inlineAssets(html, filesMap);
    }
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
