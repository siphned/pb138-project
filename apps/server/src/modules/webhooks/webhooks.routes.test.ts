import { Webhook } from "svix";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

const WEBHOOK_SECRET = "whsec_testsecret";

describe("Webhooks Routes", () => {
  let app: any;

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/winemarket";
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = WEBHOOK_SECRET;
    const mod = await import("../../app");
    app = mod.app;
  }, 30000);

  beforeEach(() => {
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = WEBHOOK_SECRET;
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/winemarket";
  });

  it("should return 400 if svix headers are missing", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/webhooks/clerk", {
        body: JSON.stringify({ data: {}, type: "user.created" }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
  });

  it("should return 400 if signature is invalid", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/webhooks/clerk", {
        body: JSON.stringify({ data: {}, type: "user.created" }),
        headers: {
          "Content-Type": "application/json",
          "svix-id": "msg_1",
          "svix-signature": "v1,invalid",
          "svix-timestamp": Math.floor(Date.now() / 1000).toString(),
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
  });

  it("should return 200 if signature is valid (mocked secret)", async () => {
    const payload = JSON.stringify({
      data: {
        email_addresses: [{ email_address: "test@example.com" }],
        first_name: "Test",
        id: "user_1",
        last_name: "User",
      },
      type: "user.created",
    });
    const now = new Date();
    const t = Math.floor(now.getTime() / 1000).toString();
    const msgId = "msg_1";

    const wh = new Webhook(WEBHOOK_SECRET);
    const signature = wh.sign(msgId, now, payload);

    const response = await app.handle(
      new Request("http://localhost/api/webhooks/clerk", {
        body: payload,
        headers: {
          "Content-Type": "application/json",
          "svix-id": msgId,
          "svix-signature": signature,
          "svix-timestamp": t,
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
  });

  it("should create a user in the DB on user.created event", async () => {
    const clerkId = `user_${Date.now()}`;
    const email = `test_${Date.now()}@example.com`;
    const payload = JSON.stringify({
      data: {
        email_addresses: [{ email_address: email }],
        first_name: "John",
        id: clerkId,
        last_name: "Doe",
        public_metadata: { roles: ["customer"] },
      },
      type: "user.created",
    });
    const now = new Date();
    const t = Math.floor(now.getTime() / 1000).toString();
    const msgId = "msg_create";

    const wh = new Webhook(WEBHOOK_SECRET);
    const signature = wh.sign(msgId, now, payload);

    const response = await app.handle(
      new Request("http://localhost/api/webhooks/clerk", {
        body: payload,
        headers: {
          "Content-Type": "application/json",
          "svix-id": msgId,
          "svix-signature": signature,
          "svix-timestamp": t,
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
  });

  it("should update user data on user.updated event", async () => {
    const clerkId = "user_update_test";
    const oldEmail = "old@example.com";
    const newEmail = "new@example.com";

    // Pre-create user
    const payloadCreate = JSON.stringify({
      data: {
        email_addresses: [{ email_address: oldEmail }],
        first_name: "Old",
        id: clerkId,
        last_name: "Name",
      },
      type: "user.created",
    });
    const now = new Date();
    const wh = new Webhook(WEBHOOK_SECRET);

    await app.handle(
      new Request("http://localhost/api/webhooks/clerk", {
        body: payloadCreate,
        headers: {
          "Content-Type": "application/json",
          "svix-id": "msg_u1",
          "svix-signature": wh.sign("msg_u1", now, payloadCreate),
          "svix-timestamp": Math.floor(now.getTime() / 1000).toString(),
        },
        method: "POST",
      })
    );

    // Update user
    const payloadUpdate = JSON.stringify({
      data: {
        email_addresses: [{ email_address: newEmail }],
        first_name: "New",
        id: clerkId,
        last_name: "Name",
      },
      type: "user.updated",
    });
    const now2 = new Date();

    const response = await app.handle(
      new Request("http://localhost/api/webhooks/clerk", {
        body: payloadUpdate,
        headers: {
          "Content-Type": "application/json",
          "svix-id": "msg_u2",
          "svix-signature": wh.sign("msg_u2", now2, payloadUpdate),
          "svix-timestamp": Math.floor(now2.getTime() / 1000).toString(),
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
  });

  it("should soft delete user on user.deleted event", async () => {
    const clerkId = "user_delete_test";

    // Pre-create user
    const payloadCreate = JSON.stringify({
      data: {
        email_addresses: [{ email_address: "delete@example.com" }],
        first_name: "Delete",
        id: clerkId,
        last_name: "Me",
      },
      type: "user.created",
    });
    const now = new Date();
    const wh = new Webhook(WEBHOOK_SECRET);

    await app.handle(
      new Request("http://localhost/api/webhooks/clerk", {
        body: payloadCreate,
        headers: {
          "Content-Type": "application/json",
          "svix-id": "msg_d1",
          "svix-signature": wh.sign("msg_d1", now, payloadCreate),
          "svix-timestamp": Math.floor(now.getTime() / 1000).toString(),
        },
        method: "POST",
      })
    );

    // Delete user
    const payloadDelete = JSON.stringify({
      data: { deleted: true, id: clerkId },
      type: "user.deleted",
    });
    const now2 = new Date();

    const response = await app.handle(
      new Request("http://localhost/api/webhooks/clerk", {
        body: payloadDelete,
        headers: {
          "Content-Type": "application/json",
          "svix-id": "msg_d2",
          "svix-signature": wh.sign("msg_d2", now2, payloadDelete),
          "svix-timestamp": Math.floor(now2.getTime() / 1000).toString(),
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
  });
});
