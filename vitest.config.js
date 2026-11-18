import { defineConfig } from "vitest/config";

// convex-test runs Convex functions in the edge runtime, like the real backend.
export default defineConfig({
  test: { environment: "edge-runtime", server: { deps: { inline: ["convex-test"] } } },
});
