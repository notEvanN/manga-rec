/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

// A signed-in user and one title. Changes below all happen well inside the 60s merge window.
async function setup() {
  const t = convexTest(schema, modules);
  const me = t.withIdentity({ subject: "clerk_1", name: "Evan" });
  await me.mutation(api.users.ensure, { name: "Evan" });
  const titleId = await t.run((ctx) =>
    ctx.db.insert("titles", { name: "Golden Kamuy", tags: [], mangaDexId: "md1" }),
  );
  const feed = () => t.run((ctx) => ctx.db.query("activity").collect());
  return { me, titleId, feed };
}

test("a quick correction is one feed row with the final score", async () => {
  const { me, titleId, feed } = await setup();
  await me.mutation(api.ratings.rate, { titleId, score: 7 });
  await me.mutation(api.ratings.rate, { titleId, score: 9 });
  const rows = await feed();
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ kind: "rated", score: 9 });
});

test("clearing a rating removes its row, even after a status change", async () => {
  const { me, titleId, feed } = await setup();
  await me.mutation(api.ratings.rate, { titleId, score: 7 });
  await me.mutation(api.readStatus.setStatus, { titleId, status: "reading" });
  await me.mutation(api.ratings.clear, { titleId });
  const rows = await feed();
  expect(rows.map((r) => r.kind)).toEqual(["status"]);
});

test("rating right after adding folds into the added row", async () => {
  const { me, feed } = await setup();
  const added = await me.mutation(api.titles.addWithMetadata, {
    name: "Dead Tube",
    tags: [],
    mangaDexId: "md2",
    score: 6,
  });
  await me.mutation(api.ratings.rate, { titleId: added, score: 8 });
  const rows = await feed();
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ kind: "added", score: 8 });
});

test("changing the score keeps a saved review", async () => {
  const { me, titleId } = await setup();
  await me.mutation(api.ratings.rate, { titleId, score: 7, comment: "Great bears" });
  await me.mutation(api.ratings.rate, { titleId, score: 9 });
  const [rating] = await me.query(api.ratings.forTitle, { titleId });
  expect(rating).toMatchObject({ score: 9, comment: "Great bears" });
});
