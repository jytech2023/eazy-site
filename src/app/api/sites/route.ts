import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { users, sites } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";

// Helper to get or create user
async function getDbUser(session: { user: { sub: string; email?: string; name?: string; picture?: string; nickname?: string } }) {
  const auth0Id = session.user.sub;
  let [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.auth0Id, auth0Id))
    .limit(1);

  if (!dbUser) {
    const username =
      session.user.nickname ||
      session.user.email?.split("@")[0] ||
      `user${Date.now()}`;
    [dbUser] = await db
      .insert(users)
      .values({
        auth0Id,
        email: session.user.email || null,
        name: session.user.name || null,
        username,
        avatar: session.user.picture || null,
      })
      .returning();
  }
  return dbUser;
}

// GET: List user's sites or get a single site
export async function GET(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const siteId = url.searchParams.get("id");
  const dbUser = await getDbUser(session);

  if (siteId) {
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, parseInt(siteId)), eq(sites.userId, dbUser.id)))
      .limit(1);

    return NextResponse.json({ site: site || null });
  }

  const userSites = await db
    .select()
    .from(sites)
    .where(eq(sites.userId, dbUser.id))
    .orderBy(sites.updatedAt);

  return NextResponse.json({
    sites: userSites.map((s) => ({ ...s, username: dbUser.username })),
    plan: dbUser.plan,
  });
}

// PATCH: Update a site
export async function PATCH(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;
  const dbUser = await getDbUser(session);

  const [updated] = await db
    .update(sites)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(sites.id, id), eq(sites.userId, dbUser.id)))
    .returning();

  // If unpublishing, remove the static file
  if (updates.published === false && updated) {
    try {
      const filePath = path.join(
        process.cwd(),
        "public",
        "sites",
        dbUser.username!,
        `${updated.slug}.html`
      );
      await unlink(filePath);
    } catch {
      // File may not exist
    }
  }

  return NextResponse.json({ site: updated });
}

// DELETE: Delete a site
export async function DELETE(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const siteId = url.searchParams.get("id");
  if (!siteId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const dbUser = await getDbUser(session);

  // Get site info before deleting to remove static file
  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, parseInt(siteId)), eq(sites.userId, dbUser.id)))
    .limit(1);

  if (site) {
    await db.delete(sites).where(eq(sites.id, site.id));
    // Remove static file
    try {
      const filePath = path.join(
        process.cwd(),
        "public",
        "sites",
        dbUser.username!,
        `${site.slug}.html`
      );
      await unlink(filePath);
    } catch {
      // File may not exist
    }
  }

  return NextResponse.json({ ok: true });
}
