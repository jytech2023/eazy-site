import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteId = url.searchParams.get("id");

  if (!siteId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Allow loading any site by ID (published or not) for the editor
  // Published sites are publicly viewable; unpublished sites are accessible by ID only (not listed)
  const [site] = await db
    .select()
    .from(sites)
    .where(eq(sites.id, Number(siteId)))
    .limit(1);

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Get files from R2 first, fallback to DB
  let files: Record<string, string> = {};
  const { isR2Configured, getSiteFilesFromR2 } = await import("@/lib/r2");
  if (isR2Configured()) {
    const r2Files = await getSiteFilesFromR2(site.slug);
    if (r2Files) files = r2Files;
  }
  if (Object.keys(files).length === 0) {
    try {
      files = JSON.parse(site.htmlContent);
    } catch {
      if (site.htmlContent) files = { "index.html": site.htmlContent };
    }
  }

  return NextResponse.json({
    id: site.id,
    title: site.title,
    files,
  });
}
