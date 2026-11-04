import { query, mutation, internalMutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Returns the signed-in user's record, or null for guests.
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

// Same as getCurrentUser, but throws for guests. Use in mutations that need a user.
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Sign in to do that.");
  return user;
}

export const me = query({
  args: {},
  handler: async (ctx) => getCurrentUser(ctx),
});

// Public list: only expose names, never emails.
export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(({ _id, name }) => ({ _id, name }));
  },
});

// Called after sign-in to create the user record if it doesn't exist yet.
export const ensure = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const name = args.name?.trim() || "Anonymous";
    const email = args.email;

    const existing = await getCurrentUser(ctx);
    if (existing) {
      const updates: { name?: string; email?: string } = {};
      if (existing.name === "Anonymous" && name !== "Anonymous") updates.name = name;
      if (!existing.email && email) updates.email = email;
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates);
      }
      return existing._id;
    }

    return await ctx.db.insert("users", { clerkId: identity.subject, name, email });
  },
});

// Called by the Clerk webhook when an account is deleted.
export const deleteByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (!user) return;

    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user_and_title", (q) => q.eq("userId", user._id))
      .collect();
    for (const r of ratings) await ctx.db.delete(r._id);

    const statuses = await ctx.db
      .query("readStatus")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const s of statuses) await ctx.db.delete(s._id);

    // Keep titles the user added (other people may have rated them), just unlink them.
    const titles = await ctx.db
      .query("titles")
      .withIndex("by_addedBy", (q) => q.eq("addedBy", user._id))
      .collect();
    for (const t of titles) await ctx.db.patch(t._id, { addedBy: undefined });

    await ctx.db.delete(user._id);
  },
});
