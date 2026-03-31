import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
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

export const sites = pgTable("sites", {
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

export const modelUsage = pgTable("model_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id")
    .references(() => sites.id)
    .notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
