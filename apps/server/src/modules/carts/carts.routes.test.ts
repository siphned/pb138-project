import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";

const { mockCart } = vi.hoisted(() => ({
  mockCart: {
    id: "gc1",
    userId: null,
    sessionId: "s1",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    items: [],
  },
}));

vi.mock("./carts.service", () => ({
  cartsService: {
    getCartForUser: vi
      .fn()
      .mockResolvedValue({ ...mockCart, id: "c1", userId: "u1", sessionId: null }),
    getCartForSession: vi.fn().mockResolvedValue(mockCart),
    addItem: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

describe("carts routes", () => {
  it("GET /carts returns guest cart if no auth but session cookie", async () => {
    const response = await app.handle(
      new Request("http://localhost/carts", {
        method: "GET",
        headers: {
          cookie: "guest_session_id=s1",
        },
      })
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown as { id: string };
    expect(data.id).toBe("gc1");
  });

  it("POST /carts/items adds an item", async () => {
    const response = await app.handle(
      new Request("http://localhost/carts/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "guest_session_id=s1",
        },
        body: JSON.stringify({ productId: "p1", quantity: 1 }),
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
