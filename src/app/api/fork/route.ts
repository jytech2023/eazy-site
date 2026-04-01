import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { auth0 } from "@/lib/auth0";

export async function POST(request: Request) {
  const { siteId } = await request.json();

  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  // Get the source site (must be published)
  const [source] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, Number(siteId)), eq(sites.published, true)))
    .limit(1);

  if (!source) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Get or create DB user
  let userId: number | null = null;
  let isAnonymous = true;

  try {
    const session = await auth0.getSession();
    if (session?.user?.sub) {
      let [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.auth0Id, session.user.sub))
        .limit(1);

      if (!dbUser) {
        // Auto-create user
        const user = session.user;
        const username =
          (user.nickname as string) ||
          (user.email as string)?.split("@")[0] ||
          `user${Date.now()}`;
        [dbUser] = await db
          .insert(users)
          .values({
            auth0Id: user.sub as string,
            email: (user.email as string) || null,
            name: (user.name as string) || null,
            username,
            avatar: (user.picture as string) || null,
          })
          .returning();
      }

      if (dbUser) {
        userId = dbUser.id;
        isAnonymous = false;
      }
    }
  } catch {}

  // Generate new slug
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "page-";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }

  // Create forked site
  const [forked] = await db
    .insert(sites)
    .values({
      title: `${source.title} (fork)`,
      slug,
      htmlContent: "{}",
      published: isAnonymous, // anonymous sites are always public
      isAnonymous,
      userId,
      sessionId: null,
      forkedFrom: source.id,
    })
    .returning();

  // Get files from R2 first, fallback to DB
  let files: Record<string, string> = {};
  const { isR2Configured, getSiteFilesFromR2, uploadSiteToR2 } = await import("@/lib/r2");
  if (isR2Configured()) {
    const r2Files = await getSiteFilesFromR2(source.slug);
    if (r2Files) files = r2Files;
  }
  if (Object.keys(files).length === 0) {
    try {
      files = JSON.parse(source.htmlContent);
    } catch {
      if (source.htmlContent) files = { "index.html": source.htmlContent };
    }
  }

  // Upload forked files to R2 under the new slug
  if (isR2Configured() && Object.keys(files).length > 0) {
    await uploadSiteToR2(slug, files);
  }

  return NextResponse.json({
    siteId: forked.id,
    slug: forked.slug,
    title: forked.title,
    forkedFrom: source.id,
    files,
  });
}
