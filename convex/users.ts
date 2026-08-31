import { query, mutation, MutationCtx, QueryCtx, internalMutation } from "./_generated/server";
import { v } from "convex/values";

//Clerk-authenticated helper function
async function getAuthUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

//Get current authenticated user record from DB
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Called after sign-in to create the user record if it doesn't exist yet, replaces create
export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null; // guest browsing

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) return existing._id;

    // First time Clerk user enters
    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name ?? identity.email ?? "Anonymous",
      email: identity.email,
    });
  },
});

export const deleteByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) return;

    // Delete ratings
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user_and_title", (q) => q.eq("userId", user._id))
      .collect();
    for (const r of ratings) await ctx.db.delete(r._id);

    // Delete read statuses
    const statuses = await ctx.db
      .query("readStatus")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const s of statuses) await ctx.db.delete(s._id);

    // Disassociate titles
    const titles = await ctx.db.query("titles").collect();
    for (const t of titles) {
      if (t.addedBy === user._id) {
        await ctx.db.delete(t._id);
      }
    }

    await ctx.db.delete(user._id);
  },
});
