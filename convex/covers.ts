import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// MangaDex blocks its covers from being embedded in other sites, so we keep our own copy.
// Covers are downloaded once per title on the server and served from Convex file storage.

export const MANGADEX_COVER_PREFIX = "https://uploads.mangadex.org/covers/";

export const download = internalAction({
  args: { titleId: v.id("titles"), coverUrl: v.string() },
  handler: async (ctx, { titleId, coverUrl }) => {
    if (!coverUrl.startsWith(MANGADEX_COVER_PREFIX)) {
      throw new Error(`Refusing to download non-MangaDex cover: ${coverUrl}`);
    }

    const res = await fetch(coverUrl, { signal: AbortSignal.timeout(10000) });
    const contentType = res.headers.get("content-type") ?? "";
    if (!res.ok || !contentType.startsWith("image/")) {
      throw new Error(`Cover download failed for ${titleId}: ${res.status} ${contentType}`);
    }

    const storageId = await ctx.storage.store(await res.blob());
    await ctx.runMutation(internal.covers.attach, { titleId, storageId });
  },
});

export const attach = internalMutation({
  args: { titleId: v.id("titles"), storageId: v.id("_storage") },
  handler: async (ctx, { titleId, storageId }) => {
    const title = await ctx.db.get(titleId);
    if (!title) {
      await ctx.storage.delete(storageId); // title was removed meanwhile
      return;
    }
    if (title.coverStorageId) await ctx.storage.delete(title.coverStorageId);
    await ctx.db.patch(titleId, { coverStorageId: storageId });
  },
});

// One-off: copy covers for titles that don't have a stored copy yet. Safe to re-run.
//   npx convex run --prod covers:backfill
export const backfill = internalMutation({
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
