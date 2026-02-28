import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Mock the DB helpers ──────────────────────────────────────
vi.mock("./db", () => ({
  getAllPuppies: vi.fn(),
  getPuppyById: vi.fn(),
  updatePuppy: vi.fn(),
  getPhotosForPuppy: vi.fn(),
  addPhoto: vi.fn(),
  getWeightLogsForPuppy: vi.fn(),
  addWeightLog: vi.fn(),
  createApplication: vi.fn(),
  getAllApplications: vi.fn(),
  getApplicationById: vi.fn(),
  updateApplication: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getDb: vi.fn(),
}));

// ── Mock the notification helper ─────────────────────────────
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import {
  getAllPuppies,
  getPuppyById,
  getPhotosForPuppy,
  getWeightLogsForPuppy,
  createApplication,
  getAllApplications,
  updateApplication,
  addPhoto,
  addWeightLog,
  updatePuppy,
} from "./db";

// ── Test data ────────────────────────────────────────────────
const mockPuppy = {
  id: 1,
  slug: "scottie",
  name: "Scottie",
  nickname: "The First Born",
  sex: "F" as const,
  coat: "Black with some rust",
  birthWeightGrams: 595,
  currentWeightGrams: 920,
  status: "available" as const,
  notes: "First born of the litter",
  birthOrder: 1,
  createdAt: new Date("2026-02-22"),
  updatedAt: new Date("2026-02-27"),
};

const mockPhoto = {
  id: 1,
  puppyId: 1,
  url: "https://example.com/scottie.jpg",
  caption: "Day 1",
  takenAt: new Date("2026-02-22"),
  createdAt: new Date("2026-02-22"),
};

const mockWeightLog = {
  id: 1,
  puppyId: 1,
  weightGrams: 595,
  measuredAt: new Date("2026-02-22"),
  note: "Birth weight",
  createdAt: new Date("2026-02-22"),
};

const mockApplication = {
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "555-1234",
  puppyId: 1,
  puppyPreference: "Scottie",
  notes: "I have a big yard",
  status: "new" as const,
  adminNotes: null,
  createdAt: new Date("2026-02-27"),
  updatedAt: new Date("2026-02-27"),
};

// ── Context helpers ──────────────────────────────────────────
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ── Tests ────────────────────────────────────────────────────

describe("puppies.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all puppies with photos and weight logs", async () => {
    (getAllPuppies as ReturnType<typeof vi.fn>).mockResolvedValue([mockPuppy]);
    (getPhotosForPuppy as ReturnType<typeof vi.fn>).mockResolvedValue([mockPhoto]);
    (getWeightLogsForPuppy as ReturnType<typeof vi.fn>).mockResolvedValue([mockWeightLog]);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.puppies.list();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Scottie");
    expect(result[0].photos).toHaveLength(1);
    expect(result[0].weightLogs).toHaveLength(1);
    expect(getAllPuppies).toHaveBeenCalledOnce();
  });

  it("returns empty array when no puppies exist", async () => {
    (getAllPuppies as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.puppies.list();

    expect(result).toEqual([]);
  });
});

describe("puppies.byId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a puppy with details when found", async () => {
    (getPuppyById as ReturnType<typeof vi.fn>).mockResolvedValue(mockPuppy);
    (getPhotosForPuppy as ReturnType<typeof vi.fn>).mockResolvedValue([mockPhoto]);
    (getWeightLogsForPuppy as ReturnType<typeof vi.fn>).mockResolvedValue([mockWeightLog]);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.puppies.byId({ id: 1 });

    expect(result).not.toBeNull();
    expect(result!.name).toBe("Scottie");
    expect(result!.photos).toHaveLength(1);
  });

  it("returns null when puppy not found", async () => {
    (getPuppyById as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.puppies.byId({ id: 999 });

    expect(result).toBeNull();
  });
});

describe("application.submit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates an application and returns success", async () => {
    (createApplication as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.application.submit({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "555-1234",
      puppyId: 1,
      puppyPreference: "Scottie",
      notes: "I have a big yard",
    });

    expect(result).toEqual({ success: true });
    expect(createApplication).toHaveBeenCalledWith({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "555-1234",
      puppyId: 1,
      puppyPreference: "Scottie",
      notes: "I have a big yard",
    });
  });

  it("handles submission without optional fields", async () => {
    (createApplication as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.application.submit({
      name: "John Smith",
      email: "john@example.com",
      phone: "555-5678",
    });

    expect(result).toEqual({ success: true });
    expect(createApplication).toHaveBeenCalledWith({
      name: "John Smith",
      email: "john@example.com",
      phone: "555-5678",
      puppyId: null,
      puppyPreference: null,
      notes: null,
    });
  });
});

describe("admin.applications.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all applications for admin users", async () => {
    (getAllApplications as ReturnType<typeof vi.fn>).mockResolvedValue([mockApplication]);

    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.applications.list();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Jane Doe");
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.applications.list()).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.applications.list()).rejects.toThrow();
  });
});

describe("admin.applications.updateStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates application status for admin", async () => {
    (updateApplication as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.applications.updateStatus({
      id: 1,
      status: "contacted",
      adminNotes: "Called on 2/27",
    });

    expect(result).toEqual({ success: true });
    expect(updateApplication).toHaveBeenCalledWith(1, {
      status: "contacted",
      adminNotes: "Called on 2/27",
    });
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.admin.applications.updateStatus({ id: 1, status: "contacted" })
    ).rejects.toThrow();
  });
});

describe("admin.puppies.update", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates puppy data for admin", async () => {
    (updatePuppy as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.puppies.update({
      id: 1,
      status: "reserved",
      currentWeightGrams: 1000,
    });

    expect(result).toEqual({ success: true });
    expect(updatePuppy).toHaveBeenCalledWith(1, {
      status: "reserved",
      currentWeightGrams: 1000,
    });
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.admin.puppies.update({ id: 1, status: "reserved" })
    ).rejects.toThrow();
  });
});

describe("admin.puppies.addPhoto", () => {
  beforeEach(() => vi.clearAllMocks());

  it("adds a photo for admin", async () => {
    (addPhoto as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.puppies.addPhoto({
      puppyId: 1,
      url: "https://example.com/new-photo.jpg",
      caption: "Week 1",
      takenAt: "2026-03-01T00:00:00.000Z",
    });

    expect(result).toEqual({ success: true });
    expect(addPhoto).toHaveBeenCalledOnce();
  });
});

describe("admin.puppies.addWeight", () => {
  beforeEach(() => vi.clearAllMocks());

  it("adds a weight log and updates puppy for admin", async () => {
    (addWeightLog as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (updatePuppy as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.puppies.addWeight({
      puppyId: 1,
      weightGrams: 1100,
      measuredAt: "2026-03-01T00:00:00.000Z",
      note: "Week 1 weigh-in",
    });

    expect(result).toEqual({ success: true });
    expect(addWeightLog).toHaveBeenCalledOnce();
    expect(updatePuppy).toHaveBeenCalledWith(1, { currentWeightGrams: 1100 });
  });
});
