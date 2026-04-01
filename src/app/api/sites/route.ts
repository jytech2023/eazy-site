import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

async function getAuthUser() {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return null;
    return session.user;
  } catch {
    return null;
  }
}

async function getDbUser(authUser: { sub?: string }) {
  if (!authUser.sub) return null;
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.auth0Id, authUser.sub))
    .limit(1);
  return dbUser ?? null;
}

// GET: List user's sites or get a specific site
export async function GET(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getDbUser(authUser);
  const url = new URL(request.url);
  const siteId = url.searchParams.get("id");

  // Get user's sites from DB
  const userSites = dbUser
    ? await db
        .select()
        .from(sites)
        .where(eq(sites.userId, dbUser.id))
        .orderBy(desc(sites.updatedAt))
    : [];

  if (siteId) {
    const site = userSites.find(
      (s) => String(s.id) === siteId || s.slug === siteId
    );
    if (!site) {
      return NextResponse.json({ site: null });
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
        if (site.htmlContent) {
          files = { "index.html": site.htmlContent };
        }
      }
    }

    return NextResponse.json({
      site: {
        id: String(site.id),
        slug: site.slug,
        title: site.title,
        published: site.published,
        isAnonymous: site.isAnonymous,
        forkedFrom: site.forkedFrom,
        username: dbUser?.username || "anonymous",
        files,
        createdAt: site.createdAt.toISOString(),
        updatedAt: site.updatedAt.toISOString(),
      },
    });
  }

  const formatted = userSites.map((s) => {
    let fileNames: string[] = [];
    try {
      const parsed = JSON.parse(s.htmlContent);
      const keys = Object.keys(parsed);
      fileNames = keys.length > 0 ? keys : ["index.html"];
    } catch {
      fileNames = ["index.html"];
    }
    return {
      id: String(s.id),
      slug: s.slug,
      title: s.title,
      published: s.published,
      isAnonymous: s.isAnonymous,
      forkedFrom: s.forkedFrom,
      username: dbUser?.username || "anonymous",
      files: fileNames,
      cfPagesProject: s.cfPagesProject || null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  });

  return NextResponse.json({
    sites: formatted,
    plan: dbUser?.plan || "free",
  });
}

// DELETE: Delete a site
export async function DELETE(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getDbUser(authUser);
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const siteId = url.searchParams.get("id");
  if (!siteId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await db
    .delete(sites)
    .where(and(eq(sites.id, Number(siteId)), eq(sites.userId, dbUser.id)));

  return NextResponse.json({ ok: true });
}

// PATCH: Update a site (e.g. unpublish)
export async function PATCH(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getDbUser(authUser);
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, published } = body;

  if (id && published === false) {
    await db
      .update(sites)
      .set({ published: false, updatedAt: new Date() })
      .where(and(eq(sites.id, Number(id)), eq(sites.userId, dbUser.id)));
  }

  return NextResponse.json({ ok: true });
}
