import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { mysqlTable, int, varchar, mysqlEnum, text, timestamp } from 'drizzle-orm/mysql-core';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

// Re-define tables inline for the seed script (no TS)
const puppiesTable = mysqlTable("puppies", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

const puppyPhotos = mysqlTable("puppy_photos", {
  id: int("id").autoincrement().primaryKey(),
  puppyId: int("puppyId").notNull(),
  url: text("url").notNull(),
  caption: varchar("caption", { length: 500 }),
  takenAt: timestamp("takenAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const weightLogs = mysqlTable("weight_logs", {
  id: int("id").autoincrement().primaryKey(),
  puppyId: int("puppyId").notNull(),
  weightGrams: int("weightGrams").notNull(),
  measuredAt: timestamp("measuredAt").notNull(),
  note: varchar("note", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const puppyData = [
  {
    slug: 'scottie', name: 'Scottie', nickname: null, sex: 'F',
    coat: 'Black with some rust', birthWeightGrams: 595, currentWeightGrams: 920,
    status: 'available', birthOrder: 1,
    notes: 'The firstborn and the biggest of the litter. Scottie has a striking black coat with warm rust markings.',
    photos: [
      { url: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663028511378/cubTCKQneecSbqSJATRBZZ/scottie_174a1aa8.jpg', caption: 'Scottie at a few days old', takenAt: new Date('2026-02-24') },
    ],
    weights: [
      { weightGrams: 595, measuredAt: new Date('2026-02-22'), note: 'Birth weight' },
      { weightGrams: 920, measuredAt: new Date('2026-02-27'), note: 'Day 5' },
    ],
  },
  {
    slug: 'carmel', name: 'Carmel', nickname: null, sex: 'F',
    coat: 'Red / Rust', birthWeightGrams: 502, currentWeightGrams: 786,
    status: 'available', birthOrder: 2,
    notes: 'Carmel has a beautiful warm red-rust coat that glows in the light. She is calm and content.',
    photos: [
      { url: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663028511378/cubTCKQneecSbqSJATRBZZ/carmel_50f9ea0b.jpg', caption: 'Carmel at a few days old', takenAt: new Date('2026-02-24') },
    ],
    weights: [
      { weightGrams: 502, measuredAt: new Date('2026-02-22'), note: 'Birth weight' },
      { weightGrams: 786, measuredAt: new Date('2026-02-27'), note: 'Day 5' },
    ],
  },
  {
    slug: 'ricochet', name: 'Ricochet', nickname: 'The Runt', sex: 'M',
    coat: 'Mix brown / black', birthWeightGrams: 397, currentWeightGrams: 673,
    status: 'available', birthOrder: 3,
    notes: 'The smallest of the litter but full of determination. Despite being the runt, he is thriving.',
    photos: [
      { url: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663028511378/cubTCKQneecSbqSJATRBZZ/ricochet_29cd0183.jpg', caption: 'Ricochet at a few days old', takenAt: new Date('2026-02-24') },
    ],
    weights: [
      { weightGrams: 397, measuredAt: new Date('2026-02-22'), note: 'Birth weight' },
      { weightGrams: 673, measuredAt: new Date('2026-02-27'), note: 'Day 5' },
    ],
  },
  {
    slug: 'cloud', name: 'Cloud', nickname: null, sex: 'M',
    coat: 'Brown with white chest patches', birthWeightGrams: 510, currentWeightGrams: 760,
    status: 'available', birthOrder: 4,
    notes: 'Cloud stands out with his distinctive white chest patches. He is gentle and easygoing.',
    photos: [
      { url: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663028511378/cubTCKQneecSbqSJATRBZZ/cloud_new_72fb5763.png', caption: 'Cloud at about a week old', takenAt: new Date('2026-02-27') },
      { url: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663028511378/cubTCKQneecSbqSJATRBZZ/cloud_fullres_784b05b9.jpg', caption: 'Cloud at a few days old', takenAt: new Date('2026-02-24') },
    ],
    weights: [
      { weightGrams: 510, measuredAt: new Date('2026-02-22'), note: 'Birth weight' },
      { weightGrams: 760, measuredAt: new Date('2026-02-27'), note: 'Day 5' },
    ],
  },
  {
    slug: 'rusty', name: 'Rusty', nickname: null, sex: 'F',
    coat: 'Red / Rust', birthWeightGrams: 500, currentWeightGrams: 790,
    status: 'available', birthOrder: 5,
    notes: 'Rusty shares the warm red-rust coloring of her sister Carmel. She is active and curious.',
    photos: [
      { url: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663028511378/cubTCKQneecSbqSJATRBZZ/rusty_95f87163.jpg', caption: 'Rusty at a few days old', takenAt: new Date('2026-02-24') },
    ],
    weights: [
      { weightGrams: 500, measuredAt: new Date('2026-02-22'), note: 'Birth weight' },
      { weightGrams: 790, measuredAt: new Date('2026-02-27'), note: 'Day 5' },
    ],
  },
  {
    slug: 'frankie', name: 'Frankie', nickname: null, sex: 'F',
    coat: 'Mix brown / black', birthWeightGrams: 550, currentWeightGrams: 840,
    status: 'available', birthOrder: 6,
    notes: 'Frankie is a strong, healthy girl with a rich mix of brown and black in her coat.',
    photos: [
      { url: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663028511378/cubTCKQneecSbqSJATRBZZ/frankie_789b2a18.jpg', caption: 'Frankie at a few days old', takenAt: new Date('2026-02-24') },
    ],
    weights: [
      { weightGrams: 550, measuredAt: new Date('2026-02-22'), note: 'Birth weight' },
      { weightGrams: 840, measuredAt: new Date('2026-02-27'), note: 'Day 5' },
    ],
  },
];

async function seed() {
  console.log('Seeding puppies...');

  for (const pup of puppyData) {
    // Upsert puppy
    await db.insert(puppiesTable).values({
      slug: pup.slug,
      name: pup.name,
      nickname: pup.nickname,
      sex: pup.sex,
      coat: pup.coat,
      birthWeightGrams: pup.birthWeightGrams,
      currentWeightGrams: pup.currentWeightGrams,
      status: pup.status,
      notes: pup.notes,
      birthOrder: pup.birthOrder,
    }).onDuplicateKeyUpdate({
      set: {
        name: pup.name,
        currentWeightGrams: pup.currentWeightGrams,
        notes: pup.notes,
      },
    });

    // Get the puppy ID
    const rows = await db.select({ id: puppiesTable.id }).from(puppiesTable).where(eq(puppiesTable.slug, pup.slug)).limit(1);
    const puppyId = rows[0].id;

    // Insert photos (skip duplicates by checking existing)
    const existingPhotos = await db.select({ url: puppyPhotos.url }).from(puppyPhotos).where(eq(puppyPhotos.puppyId, puppyId));
    const existingUrls = new Set(existingPhotos.map(p => p.url));

    for (const photo of pup.photos) {
      if (!existingUrls.has(photo.url)) {
        await db.insert(puppyPhotos).values({
          puppyId,
          url: photo.url,
          caption: photo.caption,
          takenAt: photo.takenAt,
        });
      }
    }

    // Insert weight logs (skip duplicates)
    const existingWeights = await db.select({ measuredAt: weightLogs.measuredAt }).from(weightLogs).where(eq(weightLogs.puppyId, puppyId));
    const existingDates = new Set(existingWeights.map(w => w.measuredAt?.toISOString()));

    for (const wl of pup.weights) {
      if (!existingDates.has(wl.measuredAt.toISOString())) {
        await db.insert(weightLogs).values({
          puppyId,
          weightGrams: wl.weightGrams,
          measuredAt: wl.measuredAt,
          note: wl.note,
        });
      }
    }

    console.log(`  ✓ ${pup.name} (ID: ${puppyId})`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
