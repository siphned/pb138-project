import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";

const { mockCart } = vi.hoisted(() => ({
  mockCart: {
    createdAt: new Date(),
    deletedAt: null,
    id: "gc1",
    items: [],
    sessionId: "s1",
    updatedAt: new Date(),
    userId: null,
  },
}));

vi.mock("./carts.service", () => ({
  cartsService: {
    addItem: vi.fn().mockResolvedValue(undefined),
    getCartForSession: vi.fn().mockResolvedValue(mockCart),
    getCartForUser: vi
      .fn()
      .mockResolvedValue({ ...mockCart, id: "c1", sessionId: null, userId: "u1" }),
  },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

describe("carts routes", () => {
  it("GET /carts returns guest cart if no auth but session cookie", async () => {
    const response = await app.handle(
      new Request("http://localhost/carts", {
        headers: {
          cookie: "guest_session_id=s1",
        },
        method: "GET",
      })
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown as { id: string };
    expect(data.id).toBe("gc1");
  });

  it("POST /carts/items adds an item", async () => {
    const response = await app.handle(
      new Request("http://localhost/carts/items", {
        body: JSON.stringify({ productId: "p1", quantity: 1 }),
        headers: {
          "Content-Type": "application/json",
          cookie: "guest_session_id=s1",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(201);
  });

  it("GET /carts returns 400 if no user and no session", async () => {
    const response = await app.handle(
      new Request("http://localhost/carts", {
        method: "GET",
      })
    );

    expect(response.status).toBe(400);
  });
});
