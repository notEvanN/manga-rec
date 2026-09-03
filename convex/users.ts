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
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const name = args.name ?? "Anonymous";
    const email = args.email ?? undefined;

    if (existing) {
      const updates: any = {};
      if (!existing.name || existing.name === "Anonymous") updates.name = name;
      if (!existing.email && email) updates.email = email;
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates);
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name,
      email,
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
