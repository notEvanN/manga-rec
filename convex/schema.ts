import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
  }),

  titles: defineTable({
    name: v.string(),
    coverUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
  }),

  ratings: defineTable({
    userId: v.id("users"),
    titleId: v.id("titles"),
    score: v.number(),
    comment: v.optional(v.string()),
  })
    .index("by_title", ["titleId"])
    .index("by_user_and_title", ["userId", "titleId"]),

  readStatus: defineTable({
    userId: v.id("users"),
    titleId: v.id("titles"),
    status: v.union(
      v.literal("reading"),
      v.literal("completed"),
      v.literal("plan_to_read"),
      v.literal("dropped")
    ),
  })
    .index("by_title", ["titleId"])
    .index("by_user_and_title", ["userId", "titleId"]),
});