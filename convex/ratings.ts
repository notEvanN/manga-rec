import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const forTitle = query({
  args: { titleId: v.id("titles") },
  handler: async (ctx, { titleId }) => {
    return await ctx.db
      .query("ratings")
      .withIndex("by_title", (q) => q.eq("titleId", titleId))
      .collect();
  },
});

export const rate = mutation({
  args: {
    userId: v.id("users"),
    titleId: v.id("titles"),
    score: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.score < 1 || args.score > 10) {
      throw new Error("Score must be between 1 and 10.");
    }

    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_user_and_title", (q) =>
        q.eq("userId", args.userId).eq("titleId", args.titleId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        score: args.score,
        comment: args.comment,
      });
    } else {
      await ctx.db.insert("ratings", args);
    }
  },
});