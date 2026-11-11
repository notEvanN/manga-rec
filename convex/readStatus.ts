import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { readStatusValidator } from "./lib/validators";
import { getCurrentUser, requireUser } from "./lib/auth";

export const forTitle = query({
  args: { titleId: v.id("titles") },
  handler: async (ctx, { titleId }) => {
    return await ctx.db
      .query("readStatus")
      .withIndex("by_title", (q) => q.eq("titleId", titleId))
      .collect();
  },
});

// Statuses for the signed-in user (empty for guests).
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("readStatus")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const setStatus = mutation({
  args: {
    titleId: v.id("titles"),
    status: readStatusValidator,
  },
  handler: async (ctx, { titleId, status }) => {
    const user = await requireUser(ctx);

    const existing = await ctx.db
      .query("readStatus")
      .withIndex("by_user_and_title", (q) => q.eq("userId", user._id).eq("titleId", titleId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { status });
    } else {
      await ctx.db.insert("readStatus", { userId: user._id, titleId, status });
    }
  },
});
