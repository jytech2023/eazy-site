import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites, users } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

const MAX_FREE_SITES = 10_000;

// Daily cron: archive oldest free sites beyond 10K limit
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Count total free published sites (anonymous + free-plan users)
  const [freeCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(sites)
    .leftJoin(users, eq(sites.userId, users.id))
    .where(
      and(
        eq(sites.published, true),
        sql`(${sites.isAnonymous} = true OR ${users.plan} = 'free' OR ${sites.userId} IS NULL)`
      )
    );

  const totalFree = Number(freeCount.count);
  let archived = 0;

  if (totalFree > MAX_FREE_SITES) {
    const excess = totalFree - MAX_FREE_SITES;

    const oldest = await db
      .select({ id: sites.id })
      .from(sites)
      .leftJoin(users, eq(sites.userId, users.id))
      .where(
        and(
          eq(sites.published, true),
          sql`(${sites.isAnonymous} = true OR ${users.plan} = 'free' OR ${sites.userId} IS NULL)`
        )
      )
      .orderBy(sites.createdAt)
      .limit(excess);

    if (oldest.length > 0) {
      const ids = oldest.map((s) => s.id);
      await db
        .update(sites)
        .set({ published: false })
        .where(sql`${sites.id} IN ${ids}`);
      archived = ids.length;
    }
  }

  return NextResponse.json({
    success: true,
    totalFreeSites: totalFree,
    archived,
    timestamp: new Date().toISOString(),
  });
}
