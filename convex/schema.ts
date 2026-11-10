import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const readStatusValidator = v.union(
  v.literal("reading"),
  v.literal("completed"),
  v.literal("plan_to_read"),
  v.literal("dropped")
);

export default defineSchema({
  users: defineTable({
    name: v.string(),
    clerkId: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  titles: defineTable({
    name: v.string(),
    coverUrl: v.optional(v.string()), // original MangaDex URL (can't be embedded directly)
    coverStorageId: v.optional(v.id("_storage")), // our stored copy, shown in the app
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    addedBy: v.optional(v.id("users")),
    slop: v.optional(v.boolean()),
    mangaDexId: v.optional(v.string()),
  })
    .index("by_mangaDexId", ["mangaDexId"])
    .index("by_addedBy", ["addedBy"]),

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
    status: readStatusValidator,
  })
    .index("by_title", ["titleId"])
    .index("by_user", ["userId"])
    .index("by_user_and_title", ["userId", "titleId"]),
});
