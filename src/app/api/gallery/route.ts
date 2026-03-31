import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get all published sites, newest first
  const publishedSites = await db
    .select({
      id: sites.id,
      title: sites.title,
      slug: sites.slug,
      isAnonymous: sites.isAnonymous,
      createdAt: sites.createdAt,
      userId: sites.userId,
      username: users.username,
      userAvatar: users.avatar,
    })
    .from(sites)
    .leftJoin(users, eq(sites.userId, users.id))
    .where(eq(sites.published, true))
    .orderBy(desc(sites.createdAt))
    .limit(limit)
    .offset(offset);

  // Extract preview snippet from each site's HTML
  const formatted = publishedSites.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    isAnonymous: s.isAnonymous,
    username: s.username || "anonymous",
    userAvatar: s.isAnonymous ? null : s.userAvatar,
    createdAt: s.createdAt.toISOString(),
    url: `/s/${s.username || "anonymous"}/${s.slug}`,
  }));

  return NextResponse.json({ sites: formatted, page, hasMore: formatted.length === limit });
}
