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
  },
  handler: async (ctx, args) => {
    const { userId, score, status, ...titleArgs } = args;

    if ((score !== undefined || status !== undefined) && !userId) {
      throw new Error("Select your name before adding a rating or status.");
    }

    if (score !== undefined && (score < 1 || score > 10)) {
      throw new Error("Score must be between 1 and 10.");
    }

    const titleId = await ctx.db.insert("titles", titleArgs);

    if (userId && score !== undefined) {
      await ctx.db.insert("ratings", { userId, titleId, score });
    }

    if (userId && status !== undefined) {
      await ctx.db.insert("readStatus", { userId, titleId, status });
    }

    return titleId;
  },
});