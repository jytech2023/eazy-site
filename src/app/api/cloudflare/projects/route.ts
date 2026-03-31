import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

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

async function listPagesProjects(apiToken: string, accountId: string) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`,
    { headers: { Authorization: `Bearer ${apiToken}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.result || []).map(
    (p: { name: string; subdomain: string; created_on: string }) => ({
      name: p.name,
      subdomain: p.subdomain,
      createdOn: p.created_on,
    })
  );
}

// GET: List projects using saved credentials
export async function GET() {
  const user = await getDbUser();
  if (!user?.cfApiToken || !user?.cfAccountId) {
    return NextResponse.json(
      { error: "Cloudflare not connected" },
      { status: 400 }
    );
  }

  const projects = await listPagesProjects(user.cfApiToken, user.cfAccountId);
  if (projects === null) {
    return NextResponse.json(
      { error: "Cannot list projects. Check your Cloudflare token permissions." },
      { status: 400 }
    );
  }

  return NextResponse.json({ projects });
}

// POST: List projects using a provided token (for profile setup)
export async function POST(request: Request) {
  const { cfApiToken } = await request.json();
  if (!cfApiToken) {
    return NextResponse.json({ error: "API Token required" }, { status: 400 });
  }

  // Get account ID from token
  const accountsRes = await fetch(
    "https://api.cloudflare.com/client/v4/accounts",
    { headers: { Authorization: `Bearer ${cfApiToken}` } }
  );
  if (!accountsRes.ok) {
    return NextResponse.json({ error: "Invalid API token" }, { status: 400 });
  }

  const accountsData = await accountsRes.json();
  const accounts = accountsData?.result;
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return NextResponse.json(
      { error: "No accounts found" },
      { status: 400 }
    );
  }

  const accountId = accounts[0].id;
  const accountName = accounts[0].name;

  const projects = await listPagesProjects(cfApiToken, accountId);
  if (projects === null) {
    return NextResponse.json(
      { error: "Cannot list projects. Make sure your token has Cloudflare Pages permission." },
      { status: 400 }
    );
  }

  return NextResponse.json({ accountId, accountName, projects });
}

// PUT: Create a new Pages project using saved credentials
export async function PUT(request: Request) {
  const user = await getDbUser();
  if (!user?.cfApiToken || !user?.cfAccountId) {
    return NextResponse.json(
      { error: "Cloudflare not connected" },
      { status: 400 }
    );
  }

  const { projectName } = await request.json();
  if (!projectName) {
    return NextResponse.json(
      { error: "Project name required" },
      { status: 400 }
    );
  }

  const res = await fetch(
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

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.errors?.[0]?.message || "Failed to create project";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({
    name: data.result.name,
    subdomain: data.result.subdomain,
  });
}
