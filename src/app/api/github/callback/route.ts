import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/en/profile?github=error", request.url)
    );
  }

  // Verify the user is logged in
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    return NextResponse.redirect(
      new URL("/en/profile?github=error", request.url)
    );
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.auth0Id, session.user.sub))
    .limit(1);

  if (!dbUser) {
    return NextResponse.redirect(
      new URL("/en/profile?github=error", request.url)
    );
  }

  // Exchange code for access token
  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(
      new URL("/en/profile?github=error", request.url)
    );
  }

  // Get GitHub username
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const githubUser = await userRes.json();

  // Save token and username
  await db
    .update(users)
    .set({
      githubToken: tokenData.access_token,
      githubUsername: githubUser.login || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, dbUser.id));

  return NextResponse.redirect(
    new URL("/en/profile?github=connected", request.url)
  );
}
