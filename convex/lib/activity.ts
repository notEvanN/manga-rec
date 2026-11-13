import { MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

type ActivityFields = Omit<Doc<"activity">, "_id" | "_creationTime">;

// Record an add / rating / status change for the "Recent activity" feed.
export async function logActivity(ctx: MutationCtx, fields: ActivityFields) {
  await ctx.db.insert("activity", fields);
}
