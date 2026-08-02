import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("titles").collect();
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