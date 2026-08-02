import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("titles").order("desc").collect();
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