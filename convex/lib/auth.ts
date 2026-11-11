import { MutationCtx, QueryCtx } from "../_generated/server";

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
