import { NextResponse } from "next/server";

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "page-";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

async function getAuthUser() {
  try {
    const { auth0 } = await import("@/lib/auth0");
    const session = await auth0.getSession();
    if (!session?.user) return null;
    return session.user;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { files, html, title, siteId, draft } = body;

  const siteFiles: Record<string, string> =
    files && Object.keys(files).length > 0
      ? files
      : html
        ? { "index.html": html }
        : {};

  if (Object.keys(siteFiles).length === 0) {
    return NextResponse.json({ error: "No content" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  const authUser = await getAuthUser();

  const { db } = await import("@/lib/db");
  const { sites, users } = await import("@/lib/schema");
  const { eq, and } = await import("drizzle-orm");

  // Look up DB user
  let dbUser = null;
  let username = "anonymous";

  if (authUser?.sub) {
    [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, authUser.sub))
      .limit(1);

    if (dbUser) {
      username =
        dbUser.username ||
        (authUser.nickname as string) ||
        (authUser.email as string)?.split("@")[0] ||
        "anonymous";
    }
  }

  const shouldPublish = username === "anonymous" ? true : !draft;

  let savedSiteId: number;
  let slug: string;

  // Check if R2 is available
  const { isR2Configured, uploadSiteToR2 } = await import("@/lib/r2");
  const useR2 = isR2Configured();

  // R2 is primary storage; DB stores files only as fallback when R2 is not configured
  const dbContent = useR2 ? "{}" : JSON.stringify(siteFiles);

  try {
    if (siteId) {
      const numericId = Number(siteId);
      const conditions = dbUser
        ? and(eq(sites.id, numericId), eq(sites.userId, dbUser.id))
        : eq(sites.id, numericId);

      const [existing] = await db
        .select()
        .from(sites)
        .where(conditions)
        .limit(1);

      if (existing) {
        // Don't overwrite existing content with empty — protect against race conditions
        const hasContent = Object.keys(siteFiles).length > 0 && dbContent !== "{}";
        await db
          .update(sites)
          .set({
            title: title || existing.title,
            ...(hasContent ? { htmlContent: dbContent } : {}),
            published: shouldPublish,
            updatedAt: new Date(),
          })
          .where(eq(sites.id, existing.id));

        savedSiteId = existing.id;
        slug = existing.slug;
      } else {
        slug = generateSlug();
        const [inserted] = await db
          .insert(sites)
          .values({
            title: title || "Untitled",
            slug,
            htmlContent: dbContent,
            published: shouldPublish,
            isAnonymous: username === "anonymous",
            userId: dbUser?.id ?? null,
            sessionId: null,
          })
          .returning();
        savedSiteId = inserted.id;
      }
    } else {
      slug = generateSlug();
      const [inserted] = await db
        .insert(sites)
        .values({
          title: title || "Untitled",
          slug,
          htmlContent: dbContent,
          published: shouldPublish,
          isAnonymous: username === "anonymous",
          userId: dbUser?.id ?? null,
          sessionId: null,
        })
        .returning();
      savedSiteId = inserted.id;
    }

    // Upload files to R2 — if this fails, fall back to storing in DB
    if (useR2) {
      try {
        await uploadSiteToR2(slug, siteFiles);
      } catch (r2Err) {
        console.error("R2 upload failed, storing in DB instead:", r2Err);
        // R2 failed — update DB with actual file content
        await db
          .update(sites)
          .set({ htmlContent: JSON.stringify(siteFiles) })
          .where(eq(sites.id, savedSiteId));
      }
    }
  } catch (err) {
    console.error("Failed to publish site:", err);
    return NextResponse.json(
      { error: "Failed to publish" },
      { status: 500 }
    );
  }

  const siteUrl = `/s/${username}/${slug}`;

  // Deploy to Cloudflare Pages if configured
  let cfDeployUrl: string | null = null;
  if (dbUser?.cfApiToken && dbUser?.cfAccountId) {
    const [savedSite] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, savedSiteId))
      .limit(1);

    if (savedSite?.cfPagesProject) {
      try {
        const { deployToCloudflarePages } = await import(
          "@/lib/cloudflare-pages"
        );
        const deployment = await deployToCloudflarePages({
          apiToken: dbUser.cfApiToken,
          accountId: dbUser.cfAccountId,
          projectName: savedSite.cfPagesProject,
          files: siteFiles,
        });
        cfDeployUrl = deployment.url;
      } catch (err) {
        console.error("Cloudflare Pages deployment failed:", err);
      }
    }
  }

  return NextResponse.json({
    url: siteUrl,
    siteId: savedSiteId,
    cfUrl: cfDeployUrl,
  });
}
