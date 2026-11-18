import { MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

type ActivityFields = Omit<Doc<"activity">, "_id" | "_creationTime">;

// Changes to the same title within this window count as one action in the feed, so tapping 7 and
// then correcting to 9 shows up once ("rated 9"), not twice.
const MERGE_WINDOW_MS = 60_000;

// The user's newest feed row, if it's about this title and recent enough to merge into.
async function mergeableRow(ctx: MutationCtx, userId: Id<"users">, titleId: Id<"titles">) {
  const latest = await ctx.db
    .query("activity")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .first();
  if (!latest || latest.titleId !== titleId) return null;
  if (Date.now() - latest._creationTime > MERGE_WINDOW_MS) return null;
  return latest;
}

// Record an add / rating / status change for the "Recent activity" feed.
export async function logActivity(ctx: MutationCtx, fields: ActivityFields) {
  if (fields.kind !== "added") {
    const recent = await mergeableRow(ctx, fields.userId, fields.titleId);
    if (recent?.kind === "added") {
      // Rated or tracked right after adding: fold it into the "added" row.
      const update = fields.kind === "rated" ? { score: fields.score } : { status: fields.status };
      await ctx.db.patch(recent._id, update);
      return;
    }
    if (recent?.kind === fields.kind) {
      // Replace rather than patch, so the row moves to the top of the feed.
      await ctx.db.delete(recent._id);
    }
  }
  await ctx.db.insert("activity", fields);
}

// Undo the feed entry for a rating or status that was just cleared. Only reaches back as far as the
// merge window; older entries stay, because the feed records what happened at the time.
export async function retractActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
  titleId: Id<"titles">,
  kind: "rated" | "status",
) {
  // Not just the newest row: "rate, set status, clear rating" must still find the rating row.
  const rows = await ctx.db
    .query("activity")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .take(5);
  const recent = rows.find(
    (r) =>
      r.titleId === titleId &&
      (r.kind === kind || r.kind === "added") &&
      Date.now() - r._creationTime <= MERGE_WINDOW_MS,
  );
  if (!recent) return;
  if (recent.kind === kind) {
    await ctx.db.delete(recent._id);
  } else if (recent.kind === "added") {
    await ctx.db.patch(recent._id, kind === "rated" ? { score: undefined } : { status: undefined });
  }
}
