/**
 * Shared types for puppy data — used by both frontend and backend.
 * These mirror the DB schema shapes returned by tRPC.
 */

export interface PuppyPhoto {
  id: number;
  puppyId: number;
  url: string;
  caption: string | null;
  takenAt: Date;
  createdAt: Date;
}

export interface WeightLog {
  id: number;
  puppyId: number;
  weightGrams: number;
  measuredAt: Date;
  note: string | null;
  createdAt: Date;
}

export interface PuppyWithDetails {
  id: number;
  slug: string;
  name: string;
  nickname: string | null;
  sex: "M" | "F";
  coat: string;
  birthWeightGrams: number;
  currentWeightGrams: number;
  status: "available" | "reserved" | "adopted";
  notes: string | null;
  birthOrder: number;
  bornAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  photos: PuppyPhoto[];
  weightLogs: WeightLog[];
}

export type PuppyStatus = "available" | "reserved" | "adopted";
