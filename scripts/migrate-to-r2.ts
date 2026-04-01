/**
 * Migrate site files from DB (htmlContent) to R2.
 * Run with: npx tsx scripts/migrate-to-r2.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

if (!process.env.CF_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.error("R2 credentials not set (CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET || "easysite-files";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".jsx": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function getMime(name: string): string {
  const ext = name.slice(name.lastIndexOf("."));
  return MIME_TYPES[ext] || "application/octet-stream";
}

async function migrate() {
  const rows = await sql`SELECT id, slug, html_content FROM sites WHERE html_content != '{}' AND html_content IS NOT NULL`;

  console.log(`Found ${rows.length} sites to migrate\n`);

  let migrated = 0;
  let skipped = 0;

  for (const row of rows) {
    let files: Record<string, string>;
    try {
      files = JSON.parse(row.html_content);
      if (!files || typeof files !== "object" || !Object.keys(files).length) {
        skipped++;
        continue;
      }
    } catch {
      skipped++;
      continue;
    }

    const fileCount = Object.keys(files).length;
    const totalSize = Object.values(files).reduce((sum, c) => sum + c.length, 0);

    // Upload each file
    for (const [name, content] of Object.entries(files)) {
      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: `${row.slug}/${name}`,
          Body: content,
          ContentType: getMime(name),
        })
      );
    }

    // Clear htmlContent in DB (set to "{}")
    await sql`UPDATE sites SET html_content = '{}' WHERE id = ${row.id}`;

    console.log(`  Migrated: ${row.slug} (${fileCount} files, ${(totalSize / 1024).toFixed(1)}KB)`);
    migrated++;
  }

  console.log(`\nDone! Migrated ${migrated} sites, skipped ${skipped}.`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
