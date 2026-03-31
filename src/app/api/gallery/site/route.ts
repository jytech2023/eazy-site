import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteId = url.searchParams.get("id");

  if (!siteId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, Number(siteId)), eq(sites.published, true)))
    .limit(1);

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  let files: Record<string, string> = {};
  try {
    files = JSON.parse(site.htmlContent);
  } catch {
    files = { "index.html": site.htmlContent };
  }

  return NextResponse.json({
    id: site.id,
    title: site.title,
    files,
  });
}
