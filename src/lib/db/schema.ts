import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

type JsonRecord = { [key: string]: string | number | boolean | null };

export const domains = sqliteTable("domains", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  basePrompt: text("base_prompt").notNull(),
  description: text("description"),
  restrictions: text("restrictions", { mode: "json" }).$type<JsonRecord>().default({}),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  activeDomainId: text("active_domain_id").references(() => domains.id),
  preferences: text("preferences", { mode: "json" }).$type<JsonRecord>().default({}),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const projects = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  domainId: text("domain_id").references(() => domains.id),
  name: text("name").notNull(),
  description: text("description"),
  synopsis: text("synopsis"),
  characters: text("characters"),
  styleNotes: text("style_notes"),
  styleGuideUrl: text("style_guide_url"),
  styleGuideFilename: text("style_guide_filename"),
  contextData: text("context_data", { mode: "json" }).$type<JsonRecord>().default({}),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const glossaryEntries = sqliteTable("glossary_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  originalTerm: text("original_term").notNull(),
  translatedTerm: text("translated_term").notNull(),
  notes: text("notes"),
  tag: text("tag"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  domainId: text("domain_id").references(() => domains.id),
  title: text("title").default("Nova conversa"),
  sessionType: text("session_type", { enum: ["translation", "review"] })
    .notNull()
    .default("translation"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  attachments: text("attachments", { mode: "json" }).$type<string[]>().default([]),
  tokensUsed: integer("tokens_used"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const userSessions = sqliteTable("user_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
});

export const styleGuides = sqliteTable("style_guides", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  parsedRules: text("parsed_rules", { mode: "json" }).$type<string[]>().default([]),
  parsingStatus: text("parsing_status", {
    enum: ["pending", "processing", "done", "error"],
  }).default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});
