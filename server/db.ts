import { eq, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  puppiesTable, InsertPuppy, PuppyRow,
  puppyPhotos, InsertPuppyPhoto, PuppyPhotoRow,
  weightLogs, InsertWeightLog, WeightLogRow,
  applications, InsertApplication, ApplicationRow,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── User helpers ──────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ── Puppy helpers ─────────────────────────────────────────────

export async function getAllPuppies(): Promise<PuppyRow[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(puppiesTable).orderBy(asc(puppiesTable.birthOrder));
}

export async function getPuppyBySlug(slug: string): Promise<PuppyRow | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(puppiesTable).where(eq(puppiesTable.slug, slug)).limit(1);
  return rows[0];
}

export async function getPuppyById(id: number): Promise<PuppyRow | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(puppiesTable).where(eq(puppiesTable.id, id)).limit(1);
  return rows[0];
}

export async function updatePuppy(id: number, data: Partial<InsertPuppy>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(puppiesTable).set(data).where(eq(puppiesTable.id, id));
}

// ── Photo helpers ─────────────────────────────────────────────

export async function getPhotosForPuppy(puppyId: number): Promise<PuppyPhotoRow[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(puppyPhotos).where(eq(puppyPhotos.puppyId, puppyId)).orderBy(desc(puppyPhotos.takenAt));
}

export async function addPhoto(data: InsertPuppyPhoto): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(puppyPhotos).values(data);
}

// ── Weight log helpers ────────────────────────────────────────

export async function getWeightLogsForPuppy(puppyId: number): Promise<WeightLogRow[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weightLogs).where(eq(weightLogs.puppyId, puppyId)).orderBy(asc(weightLogs.measuredAt));
}

export async function addWeightLog(data: InsertWeightLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(weightLogs).values(data);
}

// ── Application helpers ───────────────────────────────────────

export async function createApplication(data: InsertApplication): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(applications).values(data);
}

export async function getAllApplications(): Promise<ApplicationRow[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applications).orderBy(desc(applications.createdAt));
}

export async function getApplicationById(id: number): Promise<ApplicationRow | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return rows[0];
}

export async function updateApplication(id: number, data: Partial<InsertApplication>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(applications).set(data).where(eq(applications.id, id));
}

// ── Heart/Like helpers ───────────────────────────────────────

import { puppyHearts, InsertPuppyHeart } from "../drizzle/schema";
import { sql, and } from "drizzle-orm";

export async function getHeartCounts(): Promise<Record<number, number>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db
    .select({
      puppyId: puppyHearts.puppyId,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(puppyHearts)
    .groupBy(puppyHearts.puppyId);
  const map: Record<number, number> = {};
  for (const r of rows) {
    map[r.puppyId] = Number(r.count);
  }
  return map;
}

export async function getVisitorHearts(visitorId: string): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ puppyId: puppyHearts.puppyId })
    .from(puppyHearts)
    .where(eq(puppyHearts.visitorId, visitorId));
  return rows.map((r) => r.puppyId);
}

export async function toggleHeart(puppyId: number, visitorId: string): Promise<{ hearted: boolean; count: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already hearted
  const existing = await db
    .select()
    .from(puppyHearts)
    .where(and(eq(puppyHearts.puppyId, puppyId), eq(puppyHearts.visitorId, visitorId)))
    .limit(1);

  if (existing.length > 0) {
    // Remove heart
    await db
      .delete(puppyHearts)
      .where(and(eq(puppyHearts.puppyId, puppyId), eq(puppyHearts.visitorId, visitorId)));
  } else {
    // Add heart
    await db.insert(puppyHearts).values({ puppyId, visitorId });
  }

  // Get new count
  const countRows = await db
    .select({ count: sql<number>`count(*)`.as("count") })
    .from(puppyHearts)
    .where(eq(puppyHearts.puppyId, puppyId));
  const count = Number(countRows[0]?.count ?? 0);

  return { hearted: existing.length === 0, count };
}
