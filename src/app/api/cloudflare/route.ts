import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

async function getDbUser() {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return null;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.auth0Id, session.user.sub))
    .limit(1);

  if (existing) return existing;

  // Auto-create user record from Auth0 session
  const user = session.user;
  const username =
    (user.nickname as string) ||
    (user.email as string)?.split("@")[0] ||
    `user${Date.now()}`;

  const [created] = await db
    .insert(users)
    .values({
      auth0Id: user.sub as string,
      email: (user.email as string) || null,
      name: (user.name as string) || null,
      username,
      avatar: (user.picture as string) || null,
    })
    .returning();

  return created ?? null;
}

async function resolveAccount(apiToken: string) {
  const res = await fetch("https://api.cloudflare.com/client/v4/accounts", {
    headers: { Authorization: `Bearer ${apiToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const accounts = data?.result;
  if (!Array.isArray(accounts) || accounts.length === 0) return null;
  return { id: accounts[0].id, name: accounts[0].name };
}

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    cfApiToken: user.cfApiToken ? "••••••••" : "",
    accountName: user.cfAccountId ? "" : "", // will be fetched on connect
    configured: !!(user.cfApiToken && user.cfAccountId),
  });
}

export async function PUT(request: Request) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { cfApiToken } = body;

  if (!cfApiToken) {
    return NextResponse.json(
      { error: "API Token is required" },
      { status: 400 }
    );
  }

  // Verify token and get account info
  const account = await resolveAccount(cfApiToken);
  if (!account) {
    return NextResponse.json(
      { error: "Invalid API token or no account access" },
      { status: 400 }
    );
  }

  // Verify Pages access
  const pagesRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account.id}/pages/projects`,
    { headers: { Authorization: `Bearer ${cfApiToken}` } }
  );

  if (!pagesRes.ok) {
    return NextResponse.json(
      { error: "Token does not have Cloudflare Pages permission. Add Account → Cloudflare Pages → Edit." },
      { status: 400 }
    );
  }

  await db
    .update(users)
    .set({
      cfApiToken,
      cfAccountId: account.id,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return NextResponse.json({ success: true, accountName: account.name });
}

export async function DELETE() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .update(users)
    .set({
      cfApiToken: null,
      cfAccountId: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return NextResponse.json({ success: true });
}
