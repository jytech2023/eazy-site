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

export async function GET(request: Request) {
  const user = await getDbUser();
  if (!user?.githubToken) {
    return NextResponse.json(
      { error: "GitHub not connected" },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";

  const res = await fetch(
    `https://api.github.com/user/repos?sort=updated&per_page=30&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${user.githubToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!res.ok) {
    if (res.status === 401) {
      // Token expired/revoked
      await db
        .update(users)
        .set({ githubToken: null, githubUsername: null })
        .where(eq(users.id, user.id));
      return NextResponse.json(
        { error: "GitHub token expired. Please reconnect." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch repos" },
      { status: 400 }
    );
  }

  const repos = await res.json();
  const formatted = repos.map(
    (r: {
      id: number;
      name: string;
      full_name: string;
      private: boolean;
      description: string | null;
      default_branch: string;
      updated_at: string;
      html_url: string;
    }) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      isPrivate: r.private,
      description: r.description,
      defaultBranch: r.default_branch,
      updatedAt: r.updated_at,
      url: r.html_url,
    })
  );

  return NextResponse.json({ repos: formatted });
}
