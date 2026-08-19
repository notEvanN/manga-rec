import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

//Clerk-authenticated helper function
async function getAuthUser(ctx: any) {
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
    const identity = await getAuthUser(ctx);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) return existing._id;

    // First time this Clerk user hits your app
    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name ?? identity.email ?? "Anonymous",
    });
  },
});