import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./users";

export function validateScore(score: number) {
  if (!Number.isInteger(score) || score < 1 || score > 10) {
    throw new Error("Score must be a whole number between 1 and 10.");
  }
}

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
    titleId: v.id("titles"),
    score: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, { titleId, score, comment }) => {
    const user = await requireUser(ctx);
    validateScore(score);

    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_user_and_title", (q) => q.eq("userId", user._id).eq("titleId", titleId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { score, comment });
    } else {
      await ctx.db.insert("ratings", { userId: user._id, titleId, score, comment });
    }
  },
});
