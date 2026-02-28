import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllPuppies, getPuppyById, updatePuppy,
  getPhotosForPuppy, addPhoto,
  getWeightLogsForPuppy, addWeightLog,
  createApplication, getAllApplications, getApplicationById, updateApplication,
  getHeartCounts, getVisitorHearts, toggleHeart,
} from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Public puppy data ───────────────────────────────────────
  puppies: router({
    list: publicProcedure.query(async () => {
      const pups = await getAllPuppies();
      // For each puppy, fetch photos and weight logs
      const result = await Promise.all(
        pups.map(async (p) => {
          const photos = await getPhotosForPuppy(p.id);
          const weights = await getWeightLogsForPuppy(p.id);
          return { ...p, photos, weightLogs: weights };
        })
      );
      return result;
    }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const puppy = await getPuppyById(input.id);
        if (!puppy) return null;
        const photos = await getPhotosForPuppy(puppy.id);
        const weights = await getWeightLogsForPuppy(puppy.id);
        return { ...puppy, photos, weightLogs: weights };
      }),
  }),

  // ── Public application submission ───────────────────────────
  application: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        puppyId: z.number().nullable().optional(),
        puppyPreference: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createApplication({
          name: input.name,
          email: input.email,
          phone: input.phone,
          puppyId: input.puppyId ?? null,
          puppyPreference: input.puppyPreference ?? null,
          notes: input.notes ?? null,
        });

        // Notify owner about new application
        await notifyOwner({
          title: `New Puppy Application from ${input.name}`,
          content: `Name: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone}\nPuppy: ${input.puppyPreference || 'Open to any'}\nNotes: ${input.notes || 'None'}`,
        }).catch(() => {});

        return { success: true };
      }),
  }),

  // ── Heart/Like system (public, no login required) ──────────
  hearts: router({
    /** Get all heart counts + which ones this visitor has hearted */
    status: publicProcedure
      .input(z.object({ visitorId: z.string().min(1) }))
      .query(async ({ input }) => {
        const counts = await getHeartCounts();
        const visitorHearts = await getVisitorHearts(input.visitorId);
        return { counts, visitorHearts };
      }),

    /** Toggle heart on/off for a puppy */
    toggle: publicProcedure
      .input(z.object({
        puppyId: z.number(),
        visitorId: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return toggleHeart(input.puppyId, input.visitorId);
      }),
  }),

  // ── Admin routes ────────────────────────────────────────────
  admin: router({
    // Applications management
    applications: router({
      list: adminProcedure.query(async () => {
        return getAllApplications();
      }),

      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return getApplicationById(input.id);
        }),

      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["new", "reviewed", "contacted", "approved", "rejected"]),
          adminNotes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          await updateApplication(input.id, {
            status: input.status,
            adminNotes: input.adminNotes,
          });
          return { success: true };
        }),
    }),

    // Puppy management
    puppies: router({
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          nickname: z.string().nullable().optional(),
          coat: z.string().optional(),
          currentWeightGrams: z.number().optional(),
          status: z.enum(["available", "reserved", "adopted"]).optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await updatePuppy(id, data);
          return { success: true };
        }),

      addPhoto: adminProcedure
        .input(z.object({
          puppyId: z.number(),
          url: z.string().url(),
          caption: z.string().optional(),
          takenAt: z.string(), // ISO date string
        }))
        .mutation(async ({ input }) => {
          await addPhoto({
            puppyId: input.puppyId,
            url: input.url,
            caption: input.caption ?? null,
            takenAt: new Date(input.takenAt),
          });
          return { success: true };
        }),

      addWeight: adminProcedure
        .input(z.object({
          puppyId: z.number(),
          weightGrams: z.number(),
          measuredAt: z.string(), // ISO date string
          note: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          await addWeightLog({
            puppyId: input.puppyId,
            weightGrams: input.weightGrams,
            measuredAt: new Date(input.measuredAt),
            note: input.note ?? null,
          });
          // Also update currentWeightGrams on the puppy
          await updatePuppy(input.puppyId, { currentWeightGrams: input.weightGrams });
          return { success: true };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
