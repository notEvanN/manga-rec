import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

async function attachRatings(ctx: QueryCtx, titles: any[]) {
  const allRatings = await ctx.db.query("ratings").collect();

  const scoresByTitle: Record<string, number[]> = {};
  for (const r of allRatings) {
    if (!scoresByTitle[r.titleId]) scoresByTitle[r.titleId] = [];
    scoresByTitle[r.titleId].push(r.score);
  }

  return titles.map((t) => {
    const scores = scoresByTitle[t._id] || [];
    const avgRating = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;
    return { ...t, avgRating, ratingCount: scores.length };
  });
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const titles = await ctx.db.query("titles").order("desc").collect();
    return await attachRatings(ctx, titles);
  },
});

export const listSortedByRating = query({
  args: {},
  handler: async (ctx) => {
    const titles = await ctx.db.query("titles").collect();
    const withAvg = await attachRatings(ctx, titles);
    withAvg.sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
    return withAvg;
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    coverUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("titles", args);
  },
});

export const addWithMetadata = mutation({
  args: {
    name: v.string(),
    coverUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    userId: v.optional(v.id("users")),
    score: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("reading"),
        v.literal("completed"),
        v.literal("plan_to_read"),
        v.literal("dropped")
      )
    ),
    slop: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
      const { userId, score, status, slop, ...titleArgs } = args;

      if ((score !== undefined || status !== undefined) && !userId) {
        throw new Error("Select your name before adding a rating or status.");
      }
      if (score !== undefined && (score < 1 || score > 10)) {
        throw new Error("Score must be between 1 and 10.");
      }

      const existing = await ctx.db.query("titles").collect();
      const isDuplicate = existing.some(
        (t) => t.name.trim().toLowerCase() === titleArgs.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        throw new Error(`"${titleArgs.name}" already exists in the list.`);
      }

      const titleId = await ctx.db.insert("titles", { ...titleArgs, addedBy: userId, slop });

      if (userId && score !== undefined) {
        await ctx.db.insert("ratings", { userId, titleId, score });
      }
      if (userId && status !== undefined) {
        await ctx.db.insert("readStatus", { userId, titleId, status });
      }

      return titleId;
    },
  });

export const deleteDuplicates = mutation({
  args: {},
  handler: async (ctx) => {
    const allTitles = await ctx.db.query("titles").order("asc").collect();

    const seen = new Map<string, string>(); // normalized name -> first titleId
    const toDelete: string[] = [];

    for (const t of allTitles) {
      const key = t.name.trim().toLowerCase();
      if (seen.has(key)) {
        toDelete.push(t._id);
      } else {
        seen.set(key, t._id);
      }
    }

    let deletedRatings = 0;
    let deletedStatuses = 0;

    for (const titleId of toDelete) {
      const ratings = await ctx.db
        .query("ratings")
        .withIndex("by_title", (q) => q.eq("titleId", titleId as any))
        .collect();
      for (const r of ratings) {
        await ctx.db.delete(r._id);
        deletedRatings++;
      }

      const statuses = await ctx.db
        .query("readStatus")
        .withIndex("by_title", (q) => q.eq("titleId", titleId as any))
        .collect();
      for (const s of statuses) {
        await ctx.db.delete(s._id);
        deletedStatuses++;
      }

      await ctx.db.delete(titleId as any);
    }

    return {
      titlesDeleted: toDelete.length,
      ratingsDeleted: deletedRatings,
      statusesDeleted: deletedStatuses,
    };
  },
});