import { Elysia } from "elysia";
import { logger } from "../../utils/logger";
import { usersService } from "../users/users.service";

export const webhooksRoutes = new Elysia({ prefix: "/api/webhooks" }).post(
  "/clerk",
  async ({ headers, request, set }) => {
    const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!secret) {
      set.status = 500;
      return { error: "CLERK_WEBHOOK_SIGNING_SECRET is not set" };
    }

    const svixId = headers["svix-id"];
    const svixTimestamp = headers["svix-timestamp"];
    const svixSignature = headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
      set.status = 400;
      return { error: "Missing svix headers" };
    }

    const payload = await request.text();
    const { Webhook } = await import("svix");
    const wh = new Webhook(secret);

    try {
      const evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-signature": svixSignature,
        "svix-timestamp": svixTimestamp,
      }) as { type: string; data: { id: string } & Record<string, unknown> };

      const eventType = evt.type;

      if (eventType === "user.created" || eventType === "user.updated") {
        // biome-ignore lint/suspicious/noExplicitAny: Clerk webhook data is dynamic
        await usersService.syncUserFromWebhook(evt.data as any);
      } else if (eventType === "user.deleted") {
        await usersService.deleteUserFromWebhook(evt.data.id);
      }

      return { received: true };
    } catch (err) {
      logger.error({ err }, "Webhook verification failed");
      set.status = 400;
      return { error: "Invalid signature" };
    }
  }
);
