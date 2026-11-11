import { v } from "convex/values";

export const readStatusValidator = v.union(
  v.literal("reading"),
  v.literal("completed"),
  v.literal("plan_to_read"),
  v.literal("dropped"),
);

export function validateScore(score: number) {
  if (!Number.isInteger(score) || score < 1 || score > 10) {
    throw new Error("Score must be a whole number between 1 and 10.");
  }
}

// Covers are only ever downloaded from MangaDex (see covers.ts).
export const MANGADEX_COVER_PREFIX = "https://uploads.mangadex.org/covers/";
