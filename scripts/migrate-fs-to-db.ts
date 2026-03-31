/**
 * Migrate sites from filesystem (public/sites/) to database.
 * Run with: npx tsx scripts/migrate-fs-to-db.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, text, timestamp, serial, integer, boolean } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  auth0Id: text("auth0_id").unique(),
  email: text("email").unique(),
  name: text("name"),
  username: text("username").unique(),
  avatar: text("avatar"),
  plan: text("plan").default("free").notNull(),
  planExpiresAt: timestamp("plan_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
  preferredModel: text("preferred_model"),
  cfApiToken: text("cf_api_token"),
  cfAccountId: text("cf_account_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  title: text("title").notNull().default("Untitled Site"),
  slug: text("slug").notNull(),
  htmlContent: text("html_content").notNull().default(""),
  published: boolean("published").default(false).notNull(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  cfPagesProject: text("cf_pages_project"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set. Create a .env file or pass it.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

const SITES_DIR = path.join(process.cwd(), "public", "sites");

async function migrate() {
  const usernames = await readdir(SITES_DIR);
  let total = 0;
  let skipped = 0;

  for (const username of usernames) {
    const userDir = path.join(SITES_DIR, username);
    const userStat = await stat(userDir);
    if (!userStat.isDirectory()) continue;

    const isAnonymous = username === "anonymous";

    // Find or create user in DB (skip for anonymous)
    let userId: number | null = null;
    if (!isAnonymous) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existing) {
        userId = existing.id;
      } else {
        const [created] = await db
          .insert(users)
          .values({ username, email: null, name: username })
          .returning();
        userId = created.id;
        console.log(`  Created user: ${username} (id: ${userId})`);
      }
    }

    const entries = await readdir(userDir);

    for (const entry of entries) {
      const entryPath = path.join(userDir, entry);
      const entryStat = await stat(entryPath);

      let slug: string;
      let filesMap: Record<string, string> = {};
      let title = "Untitled";

      if (entryStat.isDirectory()) {
        // Multi-file site: public/sites/{username}/{slug}/
        slug = entry;
        const dirFiles = await readdir(entryPath);
        for (const f of dirFiles) {
          filesMap[f] = await readFile(path.join(entryPath, f), "utf-8");
        }
      } else if (entry.endsWith(".html")) {
        // Legacy single file: public/sites/{username}/{slug}.html
        slug = entry.replace(/\.html$/, "");
        filesMap["index.html"] = await readFile(entryPath, "utf-8");
      } else {
        continue;
      }

      // Extract title from index.html
      const html = filesMap["index.html"] || "";
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      if (titleMatch) title = titleMatch[1];

      // Check if already in DB
      const [existing] = await db
        .select()
        .from(sites)
        .where(eq(sites.slug, slug))
        .limit(1);

      if (existing) {
        console.log(`  Skip (exists): ${username}/${slug}`);
        skipped++;
        continue;
      }

      await db.insert(sites).values({
        userId,
        title,
        slug,
        htmlContent: JSON.stringify(filesMap),
        published: true,
        isAnonymous,
        sessionId: null,
      });

      const fileCount = Object.keys(filesMap).length;
      console.log(`  Migrated: ${username}/${slug} (${fileCount} file${fileCount > 1 ? "s" : ""}, title: "${title}")`);
      total++;
    }
  }

  console.log(`\nDone! Migrated ${total} sites, skipped ${skipped}.`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
