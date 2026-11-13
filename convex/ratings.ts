import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib/auth";
import { logActivity } from "./lib/activity";
import { validateScore } from "./lib/validators";

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
    // Comment-only edits (same score) don't go in the feed.
    if (existing?.score !== score) {
      await logActivity(ctx, { userId: user._id, titleId, kind: "rated", score });
    }
  },
});
