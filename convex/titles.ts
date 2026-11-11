import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireUser } from "./lib/auth";
import { readStatusValidator, validateScore, MANGADEX_COVER_PREFIX } from "./lib/validators";

// All titles, newest first, with their average rating. Sorting by rating is done client-side.
export const list = query({
  args: {},
  handler: async (ctx) => {
    const titles = await ctx.db.query("titles").order("desc").collect();
    const ratings = await ctx.db.query("ratings").collect();

    const scoresByTitle = new Map<string, number[]>();
    for (const r of ratings) {
      const scores = scoresByTitle.get(r.titleId) ?? [];
      scores.push(r.score);
      scoresByTitle.set(r.titleId, scores);
    }

    return Promise.all(
      titles.map(async (t) => {
        const scores = scoresByTitle.get(t._id) ?? [];
        const avgRating = scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : null;
        // Serve our stored copy; the MangaDex URL itself won't load in browsers.
        const coverUrl = t.coverStorageId
          ? (await ctx.storage.getUrl(t.coverStorageId)) ?? undefined
          : undefined;
        return { ...t, coverUrl, avgRating, ratingCount: scores.length };
      })
    );
  },
});

export const addWithMetadata = mutation({
  args: {
    name: v.string(),
    coverUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    mangaDexId: v.string(),
    score: v.optional(v.number()),
    status: v.optional(readStatusValidator),
    slop: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { score, status, ...titleArgs } = args;
    const user = await requireUser(ctx);

    if (score !== undefined) validateScore(score);
    if (titleArgs.coverUrl && !titleArgs.coverUrl.startsWith(MANGADEX_COVER_PREFIX)) {
      throw new Error("Cover must come from MangaDex.");
    }

    const duplicate = await ctx.db
      .query("titles")
      .withIndex("by_mangaDexId", (q) => q.eq("mangaDexId", titleArgs.mangaDexId))
      .first();
    if (duplicate) {
      throw new Error(`"${duplicate.name}" already exists in the list.`);
    }

    const titleId = await ctx.db.insert("titles", { ...titleArgs, addedBy: user._id });

    if (titleArgs.coverUrl) {
      await ctx.scheduler.runAfter(0, internal.covers.download, {
        titleId,
        coverUrl: titleArgs.coverUrl,
      });
    }

    if (score !== undefined) {
      await ctx.db.insert("ratings", { userId: user._id, titleId, score });
    }
    if (status !== undefined) {
      await ctx.db.insert("readStatus", { userId: user._id, titleId, status });
    }

    return titleId;
  },
});
