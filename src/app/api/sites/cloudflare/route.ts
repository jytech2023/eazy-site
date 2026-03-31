import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

async function getDbUser() {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return null;
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.auth0Id, session.user.sub))
    .limit(1);
  return dbUser ?? null;
}

// PUT: Connect site to a CF Pages project (existing or new)
export async function PUT(request: Request) {
  const user = await getDbUser();
  if (!user?.cfApiToken || !user?.cfAccountId) {
    return NextResponse.json(
      { error: "Connect your Cloudflare account in Profile first" },
      { status: 400 }
    );
  }

  const { siteId, cfPagesProject, createNew } = await request.json();

  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  // Verify user owns the site
  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, Number(siteId)), eq(sites.userId, user.id)))
    .limit(1);

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  let projectName = cfPagesProject;

  // Create new project if requested
  if (createNew && projectName) {
    const createRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${user.cfAccountId}/pages/projects`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.cfApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          production_branch: "main",
        }),
      }
    );

    if (!createRes.ok) {
      const data = await createRes.json();
      const msg = data?.errors?.[0]?.message || "Failed to create project";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } else if (projectName) {
    // Verify project exists
    const verifyRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${user.cfAccountId}/pages/projects/${projectName}`,
      { headers: { Authorization: `Bearer ${user.cfApiToken}` } }
    );

    if (!verifyRes.ok) {
      return NextResponse.json(
        { error: "Project not found in your Cloudflare account" },
        { status: 400 }
      );
    }
  }

  // Update site with CF project
  await db
    .update(sites)
    .set({ cfPagesProject: projectName || null })
    .where(eq(sites.id, site.id));

  return NextResponse.json({ success: true, cfPagesProject: projectName });
}

// DELETE: Disconnect site from CF project
export async function DELETE(request: Request) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await request.json();
  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  await db
    .update(sites)
    .set({ cfPagesProject: null })
    .where(and(eq(sites.id, Number(siteId)), eq(sites.userId, user.id)));

  return NextResponse.json({ success: true });
}
