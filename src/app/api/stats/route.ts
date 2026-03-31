import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { modelUsage, sites, users } from "@/lib/schema";
import { sql, count, desc } from "drizzle-orm";

export async function GET() {
  // Model usage counts
  const modelCounts = await db
    .select({
      model: modelUsage.model,
      count: count(),
    })
    .from(modelUsage)
    .groupBy(modelUsage.model)
    .orderBy(desc(count()));

  // Total generations
  const [totalGen] = await db
    .select({ count: count() })
    .from(modelUsage);

  // Total published sites
  const [totalSites] = await db
    .select({ count: count() })
    .from(sites);

  // Total users
  const [totalUsers] = await db
    .select({ count: count() })
    .from(users);

  // Usage over last 30 days (daily)
  const dailyUsage = await db
    .select({
      date: sql<string>`DATE(${modelUsage.createdAt})`.as("date"),
      model: modelUsage.model,
      count: count(),
    })
    .from(modelUsage)
    .where(sql`${modelUsage.createdAt} > NOW() - INTERVAL '30 days'`)
    .groupBy(sql`DATE(${modelUsage.createdAt})`, modelUsage.model)
    .orderBy(sql`DATE(${modelUsage.createdAt})`);

  // Sites created over last 30 days (daily)
  const dailySites = await db
    .select({
      date: sql<string>`DATE(${sites.createdAt})`.as("date"),
      count: count(),
    })
    .from(sites)
    .where(sql`${sites.createdAt} > NOW() - INTERVAL '30 days'`)
    .groupBy(sql`DATE(${sites.createdAt})`)
    .orderBy(sql`DATE(${sites.createdAt})`);

  return NextResponse.json({
    models: modelCounts,
    totalGenerations: totalGen.count,
    totalSites: totalSites.count,
    totalUsers: totalUsers.count,
    dailyUsage,
    dailySites,
  });
}
