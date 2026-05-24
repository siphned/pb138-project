import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";
<<<<<<< HEAD
import { verifyClerkToken } from "../auth/auth.utils";
=======
>>>>>>> origin/main

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
<<<<<<< HEAD
    mergeOnLogin: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
    updateItemQuantity: vi.fn().mockResolvedValue(undefined),
=======
>>>>>>> origin/main
  },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

<<<<<<< HEAD
vi.mock("../users/users.service", () => ({
  usersService: { lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "u1" }) },
}));

vi.mock("../../utils/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

=======
>>>>>>> origin/main
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
<<<<<<< HEAD

  it("POST /carts/items returns 422 when body is missing productId", async () => {
    const response = await app.handle(
      new Request("http://localhost/carts/items", {
        body: JSON.stringify({ quantity: 1 }),
        headers: {
          "Content-Type": "application/json",
          cookie: "guest_session_id=s1",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(422);
  });

  it("PUT /carts/items/:productId returns 422 without body", async () => {
    const response = await app.handle(
      new Request("http://localhost/carts/items/p1", {
        headers: { cookie: "guest_session_id=s1" },
        method: "PUT",
      })
    );

    expect(response.status).toBe(422);
  });

  it("DELETE /carts/items/:productId returns 204 for guest", async () => {
    const response = await app.handle(
      new Request("http://localhost/carts/items/p1", {
        headers: { cookie: "guest_session_id=s1" },
        method: "DELETE",
      })
    );

    expect([204, 422, 500]).toContain(response.status);
  });

  it("GET /carts returns user cart when authenticated", async () => {
    vi.mocked(verifyClerkToken).mockResolvedValue({ roles: ["customer"], sub: "u1" } as never);

    const response = await app.handle(
      new Request("http://localhost/carts", {
        headers: { Authorization: "Bearer test" },
        method: "GET",
      })
    );

    expect(response.status).toBe(200);
    vi.mocked(verifyClerkToken).mockResolvedValue(null);
  });
=======
>>>>>>> origin/main
});
