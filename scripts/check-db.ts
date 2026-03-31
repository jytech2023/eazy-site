import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);

async function check() {
  const users = await sql`SELECT id, auth0_id, email, username FROM users ORDER BY id`;
  console.log("=== USERS ===");
  console.table(users);

  const sites = await sql`SELECT id, user_id, slug, title, published, is_anonymous FROM sites ORDER BY id`;
  console.log("=== SITES ===");
  console.table(sites);
}

check();
