import { ConvexError } from "convex/values";

// A message people can act on. ConvexError carries a message written for users; anything else is
// unexpected, so log it and say what to try instead of showing the raw server text.
export function friendlyError(
  err,
  fallback = "Couldn't save that. Check your connection and try again.",
) {
  if (err instanceof ConvexError) return err.data?.message ?? fallback;
  console.error(err);
  return fallback;
}
