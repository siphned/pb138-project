import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";

vi.mock("./carts.service", () => ({
  cartsService: {
    getCartForUser: vi.fn().mockResolvedValue({ id: "c1", items: [] }),
    getCartForSession: vi.fn().mockResolvedValue({ id: "gc1", items: [] }),
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
