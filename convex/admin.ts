import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// One-off operator commands. All internal: run them from the CLI with `npx convex run`,
// the website can't call them.

// Move a pre-auth (name-only) user's data onto their new Clerk account.
// Run from the CLI, e.g.:
//   npx convex run --prod admin:mergeUsers '{"oldUserId":"...","newUserId":"..."}'
// If both users rated or tracked the same title, the new account's entry wins.
export const mergeUsers = internalMutation({
  args: { oldUserId: v.id("users"), newUserId: v.id("users") },
  handler: async (ctx, { oldUserId, newUserId }) => {
    if (oldUserId === newUserId) throw new Error("oldUserId and newUserId are the same.");

    const oldUser = await ctx.db.get(oldUserId);
    const newUser = await ctx.db.get(newUserId);
    if (!oldUser || !newUser) throw new Error("User not found.");
    if (oldUser.clerkId) throw new Error(`"${oldUser.name}" already has a Clerk account; refusing to merge it away.`);
    if (!newUser.clerkId) throw new Error(`"${newUser.name}" has no Clerk account; it must be the signed-up user.`);

    let moved = 0;
    let skipped = 0;

    const oldRatings = await ctx.db
      .query("ratings")
      .withIndex("by_user_and_title", (q) => q.eq("userId", oldUserId))
      .collect();
    for (const r of oldRatings) {
      const clash = await ctx.db
        .query("ratings")
        .withIndex("by_user_and_title", (q) => q.eq("userId", newUserId).eq("titleId", r.titleId))
        .unique();
      if (clash) {
        await ctx.db.delete(r._id);
        skipped++;
      } else {
        await ctx.db.patch(r._id, { userId: newUserId });
        moved++;
      }
    }

    const oldStatuses = await ctx.db
      .query("readStatus")
      .withIndex("by_user", (q) => q.eq("userId", oldUserId))
      .collect();
    for (const s of oldStatuses) {
      const clash = await ctx.db
        .query("readStatus")
        .withIndex("by_user_and_title", (q) => q.eq("userId", newUserId).eq("titleId", s.titleId))
        .unique();
      if (clash) {
        await ctx.db.delete(s._id);
        skipped++;
      } else {
        await ctx.db.patch(s._id, { userId: newUserId });
        moved++;
      }
    }

    const addedTitles = await ctx.db
      .query("titles")
      .withIndex("by_addedBy", (q) => q.eq("addedBy", oldUserId))
      .collect();
    for (const t of addedTitles) await ctx.db.patch(t._id, { addedBy: newUserId });

    await ctx.db.delete(oldUserId);

    return {
      merged: `${oldUser.name} -> ${newUser.name}`,
      ratingsAndStatusesMoved: moved,
      duplicatesDropped: skipped,
      titlesReassigned: addedTitles.length,
    };
  },
});

// Copy covers for titles that don't have a stored copy yet. Safe to re-run.
//   npx convex run --prod admin:backfillCovers
export const backfillCovers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const titles = await ctx.db.query("titles").collect();
    const missing = titles.filter((t) => t.coverUrl && !t.coverStorageId);

    // Spread requests out (one every 500ms) to go easy on MangaDex.
    for (const [i, t] of missing.entries()) {
      await ctx.scheduler.runAfter(i * 500, internal.covers.download, {
        titleId: t._id,
        coverUrl: t.coverUrl!,
      });
    }
    return { scheduled: missing.length };
  },
});
