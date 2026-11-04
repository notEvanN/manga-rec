import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

interface ClerkWebhookEvent {
  type: string;
  data: { id: string; [key: string]: unknown };
}

const http = httpRouter();

http.route({
  path: "/clerk-webhook-deletion",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("Server misconfigured", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing signature headers", { status: 400 });
    }

    let event: ClerkWebhookEvent;
    try {
      event = new Webhook(secret).verify(await request.text(), {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Unauthorized", { status: 401 });
    }

    if (event.type === "user.deleted") {
      await ctx.runMutation(internal.users.deleteByClerkId, { clerkId: event.data.id });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
