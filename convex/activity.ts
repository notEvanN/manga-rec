import { query } from "./_generated/server";

const FEED_LENGTH = 20;

// Latest adds, ratings and status changes, newest first, with user and title names.
export const recent = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("activity").order("desc").take(FEED_LENGTH);

    const items = await Promise.all(
      rows.map(async (row) => {
        const [user, title] = await Promise.all([ctx.db.get(row.userId), ctx.db.get(row.titleId)]);
        if (!user || !title) return null;
        return {
          _id: row._id,
          kind: row.kind,
          score: row.score,
          status: row.status,
          at: row._creationTime,
          userName: user.name,
          titleId: row.titleId,
          titleName: title.name,
        };
      }),
    );
    return items.filter((item) => item !== null);
  },
});
