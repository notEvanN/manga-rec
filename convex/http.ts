import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import { v } from "convex/values";

// Define the shape of a Clerk webhook event
interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    [key: string]: any;
  };
}

const http = httpRouter();

http.route({
  path: "/clerk-webhook-deletion",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const svixHeaders = {
      "svix-id": request.headers.get("svix-id")!,
      "svix-timestamp": request.headers.get("svix-timestamp")!,
      "svix-signature": request.headers.get("svix-signature")!,
    };

    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("Server misconfigured", { status: 500 });
    }

    const wh = new Webhook(secret);
    let event: ClerkWebhookEvent;

    try {
      event = wh.verify(payloadString, svixHeaders) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Unauthorized", { status: 401 });
    }

    if (event.type === "user.deleted") {
      await ctx.runMutation(internal.users.deleteByClerkId, {
        clerkId: event.data.id,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;