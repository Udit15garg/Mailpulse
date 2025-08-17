import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  varchar,
  boolean,
  serial,
} from "drizzle-orm/pg-core"
import type { AdapterAccount } from "next-auth/adapters"

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  subject: text("subject"),
  toHash: varchar("to_hash", { length: 128 }),
  messageId: varchar("message_id", { length: 256 }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  pixelToken: varchar("pixel_token", { length: 64 }).notNull(),
  status: varchar("status", { length: 24 }).default("sent"),
})

export const openEvents = pgTable("open_events", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").notNull().references(() => emails.id, { onDelete: "cascade" }),
  ts: timestamp("ts", { withTimezone: true }).defaultNow(),
  ip: varchar("ip", { length: 64 }),
  uaFamily: varchar("ua_family", { length: 64 }),
  device: varchar("device", { length: 64 }),
})