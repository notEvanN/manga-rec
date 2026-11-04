import { AuthConfig } from "convex/server";

// Set CLERK_JWT_ISSUER_DOMAIN on the Convex dashboard (dev and prod use different Clerk instances).
// See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
