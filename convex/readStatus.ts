import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const forTitle = query({
  args: { titleId: v.id("titles") },
  handler: async (ctx, { titleId }) => {
    return await ctx.db
      .query("readStatus")
      .withIndex("by_title", (q) => q.eq("titleId", titleId))
      .collect();
  },
});

export const setStatus = mutation({
  args: {
    userId: v.id("users"),
    titleId: v.id("titles"),
    status: v.union(
      v.literal("reading"),
      v.literal("completed"),
      v.literal("plan_to_read"),
      v.literal("dropped")
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("readStatus")
      .withIndex("by_user_and_title", (q) =>
        q.eq("userId", args.userId).eq("titleId", args.titleId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { status: args.status });
    } else {
      await ctx.db.insert("readStatus", args);
    }
  },
});