import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Puppy profiles — one row per puppy.
 */
export const puppiesTable = mysqlTable("puppies", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nickname: varchar("nickname", { length: 100 }),
  sex: mysqlEnum("sex", ["M", "F"]).notNull(),
  coat: varchar("coat", { length: 200 }).notNull(),
  birthWeightGrams: int("birthWeightGrams").notNull(),
  currentWeightGrams: int("currentWeightGrams").notNull(),
  status: mysqlEnum("status", ["available", "reserved", "adopted"]).default("available").notNull(),
  notes: text("notes"),
  birthOrder: int("birthOrder").notNull(),
  bornAt: timestamp("bornAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PuppyRow = typeof puppiesTable.$inferSelect;
export type InsertPuppy = typeof puppiesTable.$inferInsert;

/**
 * Photos for each puppy — supports the time-lapse gallery feature.
 * Most recent photo (by takenAt) is the "hero" image on the card.
 */
export const puppyPhotos = mysqlTable("puppy_photos", {
  id: int("id").autoincrement().primaryKey(),
  puppyId: int("puppyId").notNull(),
  url: text("url").notNull(),
  caption: varchar("caption", { length: 500 }),
  takenAt: timestamp("takenAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PuppyPhotoRow = typeof puppyPhotos.$inferSelect;
export type InsertPuppyPhoto = typeof puppyPhotos.$inferInsert;

/**
 * Weight tracking log — one entry per weigh-in.
 */
export const weightLogs = mysqlTable("weight_logs", {
  id: int("id").autoincrement().primaryKey(),
  puppyId: int("puppyId").notNull(),
  weightGrams: int("weightGrams").notNull(),
  measuredAt: timestamp("measuredAt").notNull(),
  note: varchar("note", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeightLogRow = typeof weightLogs.$inferSelect;
export type InsertWeightLog = typeof weightLogs.$inferInsert;

/**
 * Adoption applications / interest forms.
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  puppyId: int("puppyId"),
  puppyPreference: varchar("puppyPreference", { length: 200 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "reviewed", "contacted", "approved", "rejected"]).default("new").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApplicationRow = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Heart/like counts per puppy.
 * Uses a visitorId (fingerprint from localStorage) to allow one heart per visitor per puppy.
 */
export const puppyHearts = mysqlTable("puppy_hearts", {
  id: int("id").autoincrement().primaryKey(),
  puppyId: int("puppyId").notNull(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PuppyHeartRow = typeof puppyHearts.$inferSelect;
export type InsertPuppyHeart = typeof puppyHearts.$inferInsert;
