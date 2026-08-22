import { sql } from "drizzle-orm";
import { boolean, customType, integer, jsonb, pgEnum, pgPolicy, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
    dataType: () => "bytea",
    toDriver: (value) => value,
    fromDriver: (value) => Buffer.isBuffer(value) ? value : Buffer.from(value as Uint8Array),
});

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];

// RLS is enabled with no public policies, so only the owning DB role (the app's server connection) can read or write.
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    banned: boolean("banned").notNull().default(false),
    bannedReason: text("banned_reason"),
    bannedAt: timestamp("banned_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();

// Profiles are readable by everyone; inserts/updates/deletes are left to the owning DB role only.
export const profiles = pgTable(
    "profiles",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .notNull()
            .unique()
            .references(() => users.id, { onDelete: "cascade" }),
        displayName: text("display_name").notNull(),
        bio: text("bio"),
        avatarUrl: text("avatar_url"),
        // Arbitrary committee position label (e.g. "President"); null means not a committee member.
        position: text("position"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    () => [
        pgPolicy("profiles_select_all", {
            for: "select",
            to: "public",
            using: sql`true`,
        }),
    ],
).enableRLS();

// Sessions hold auth tokens; RLS is enabled with no public policies at all.
export const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();

export const uploadedFiles = pgTable(
    "uploaded_files",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        filename: text("filename").notNull(),
        mimeType: text("mime_type").notNull(),
        content: bytea("content").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    () => [pgPolicy("uploaded_files_select_all", { for: "select", to: "public", using: sql`true` })],
).enableRLS();