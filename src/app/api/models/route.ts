import { NextResponse } from "next/server";
import { getAvailableModels, MODELS } from "@/lib/models";

export async function GET() {
  let plan = "free";
  let user: { name?: string; email?: string } | null = null;

  try {
    const { auth0 } = await import("@/lib/auth0");
    const session = await auth0.getSession();

    if (session?.user) {
      user = {
        name: session.user.name as string | undefined,
        email: session.user.email as string | undefined,
      };

      if (session.user.email && process.env.DATABASE_URL) {
        const { db } = await import("@/lib/db");
        const { users } = await import("@/lib/schema");
        const { eq } = await import("drizzle-orm");

        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email as string))
          .limit(1);

        if (dbUser) {
          plan = dbUser.plan || "free";
        }
      }
    }
  } catch {
    // Anonymous - free tier
  }

  const available = getAvailableModels(plan);
  const all = MODELS.map((m) => ({
    ...m,
    available: available.some((a) => a.id === m.id),
  }));

  return NextResponse.json({ models: all, plan, user });
}
