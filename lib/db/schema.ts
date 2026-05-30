import { sql, relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ─── Better Auth tables ───────────────────────────────────────────────────────

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── User settings ────────────────────────────────────────────────────────────

export const userSettings = sqliteTable(
  "user_settings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    plan: text("plan", { enum: ["free", "starter", "dev", "team"] })
      .notNull()
      .default("free"),
    stripeCustomerId: text("stripe_customer_id"),
    subscriptionId: text("subscription_id"),
    subscriptionEndsAt: integer("subscription_ends_at", { mode: "timestamp" }),
    onboarded: integer("onboarded", { mode: "boolean" }).notNull().default(false),
    isFounding: integer("is_founding", { mode: "boolean" }).notNull().default(false),
    foundingMemberOrder: integer("founding_member_order"),
    // Google OAuth tokens for Sheets access
    googleAccessToken: text("google_access_token"),
    googleRefreshToken: text("google_refresh_token"),
    googleTokenExpiresAt: integer("google_token_expires_at"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex("idx_user_settings_user_id").on(t.userId)]
);

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(), // nanoid
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    googleSpreadsheetId: text("google_spreadsheet_id").notNull(),
    spreadsheetTitle: text("spreadsheet_title"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_projects_user_id").on(t.userId),
    index("idx_projects_created_at").on(t.createdAt),
  ]
);

// ─── Sheet Bindings (Endpoints) ───────────────────────────────────────────────

export const sheetBindings = sqliteTable(
  "sheet_bindings",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    sheetName: text("sheet_name").notNull(), // e.g. "Sheet1", "customers"
    slug: text("slug").notNull(),            // URL slug e.g. "customers"
    cacheTtl: integer("cache_ttl").notNull().default(0), // seconds; 0 = no cache
    corsOrigins: text("cors_origins").notNull().default("*"), // comma-separated or "*"
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_sheet_bindings_project_id").on(t.projectId),
    index("idx_sheet_bindings_slug").on(t.projectId, t.slug),
  ]
);

// ─── API Keys ─────────────────────────────────────────────────────────────────

export const apiKeys = sqliteTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    keyHash: text("key_hash").notNull(), // argon2id hash — never store plaintext
    keyPrefix: text("key_prefix").notNull(), // first 8 chars for display: "sk_live_"
    label: text("label"),
    rateLimit: integer("rate_limit").notNull().default(1000), // req/day (free=1000)
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_api_keys_project_id").on(t.projectId),
    index("idx_api_keys_prefix").on(t.keyPrefix),
  ]
);

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export const webhooks = sqliteTable(
  "webhooks",
  {
    id: text("id").primaryKey(),
    sheetBindingId: text("sheet_binding_id")
      .notNull()
      .references(() => sheetBindings.id, { onDelete: "cascade" }),
    targetUrl: text("target_url").notNull(),
    events: text("events").notNull().default("row.created,row.updated,row.deleted"),
    secret: text("secret").notNull(), // HMAC signing secret
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    lastDeliveredAt: integer("last_delivered_at", { mode: "timestamp" }),
    lastRowHash: text("last_row_hash"), // hash of sheet data for change detection
    failureCount: integer("failure_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_webhooks_binding_id").on(t.sheetBindingId),
  ]
);

// ─── Usage Logs ───────────────────────────────────────────────────────────────

export const usageLogs = sqliteTable(
  "usage_logs",
  {
    id: text("id").primaryKey(),
    apiKeyId: text("api_key_id")
      .references(() => apiKeys.id, { onDelete: "set null" }),
    sheetBindingId: text("sheet_binding_id")
      .references(() => sheetBindings.id, { onDelete: "set null" }),
    projectId: text("project_id")
      .references(() => projects.id, { onDelete: "set null" }),
    method: text("method").notNull(), // GET / POST / PUT / DELETE
    statusCode: integer("status_code").notNull(),
    cached: integer("cached", { mode: "boolean" }).notNull().default(false),
    responseMs: integer("response_ms"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_usage_logs_api_key_id").on(t.apiKeyId),
    index("idx_usage_logs_project_id").on(t.projectId),
    index("idx_usage_logs_created_at").on(t.createdAt),
  ]
);

// ─── Processed Webhooks (Stripe idempotency) ──────────────────────────────────

export const processedWebhooks = sqliteTable("processed_webhooks", {
  id: text("id").primaryKey(), // Stripe event id
  eventType: text("event_type").notNull(),
  processedAt: integer("processed_at").notNull(), // unix seconds
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  projects: many(projects),
  settings: one(userSettings, {
    fields: [user.id],
    references: [userSettings.userId],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(user, { fields: [projects.userId], references: [user.id] }),
  sheetBindings: many(sheetBindings),
  apiKeys: many(apiKeys),
  usageLogs: many(usageLogs),
}));

export const sheetBindingsRelations = relations(sheetBindings, ({ one, many }) => ({
  project: one(projects, { fields: [sheetBindings.projectId], references: [projects.id] }),
  webhooks: many(webhooks),
  usageLogs: many(usageLogs),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  project: one(projects, { fields: [apiKeys.projectId], references: [projects.id] }),
  usageLogs: many(usageLogs),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  sheetBinding: one(sheetBindings, {
    fields: [webhooks.sheetBindingId],
    references: [sheetBindings.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, { fields: [userSettings.userId], references: [user.id] }),
}));
