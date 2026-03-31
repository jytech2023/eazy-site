import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "page-";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

async function writeStaticFile(
  username: string,
  slug: string,
  html: string
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "sites", username);
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.html`);
  await writeFile(filePath, html, "utf-8");
  return `/sites/${username}/${slug}.html`;
}

// Try to get the logged-in username, returns null for anonymous
async function getUsername(): Promise<string | null> {
  // Only attempt auth if DB is configured
  if (!process.env.DATABASE_URL) return null;

  try {
    const { auth0 } = await import("@/lib/auth0");
    const session = await auth0.getSession();
    if (!session) return null;

    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/schema");
    const { eq } = await import("drizzle-orm");

    const auth0Id = session.user.sub as string;
    let [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))
      .limit(1);

    if (!dbUser) {
      const username =
        (session.user.nickname as string) ||
        (session.user.email as string)?.split("@")[0] ||
        `user${Date.now()}`;
      [dbUser] = await db
        .insert(users)
        .values({
          auth0Id,
          email: (session.user.email as string) || null,
          name: (session.user.name as string) || null,
          username,
          avatar: (session.user.picture as string) || null,
        })
        .returning();
    }

    return dbUser.username;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { html, title } = await request.json();

  if (!html) {
    return NextResponse.json({ error: "No HTML content" }, { status: 400 });
  }

  const slug = generateSlug();
  const username = (await getUsername()) || "anonymous";

  // Write static HTML file
  const url = await writeStaticFile(username, slug, html);

  // Optionally persist to DB if configured
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@/lib/db");
      const { sites } = await import("@/lib/schema");

      await db.insert(sites).values({
        title: title || "Untitled",
        slug,
        htmlContent: html,
        published: true,
        isAnonymous: username === "anonymous",
        userId: null,
        sessionId: null,
      });
    } catch {
      // DB not available, static file still works
    }
  }

  return NextResponse.json({ url });
}
