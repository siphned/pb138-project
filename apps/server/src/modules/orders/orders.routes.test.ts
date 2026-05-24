<<<<<<< HEAD
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../app";
import { verifyClerkToken } from "../auth/auth.utils";
import { usersService } from "../users/users.service";
=======
import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";
>>>>>>> origin/main

const { mockOrder } = vi.hoisted(() => ({
  mockOrder: {
    billingAddressId: "addr-1",
    createdAt: new Date(),
    deletedAt: null,
    deliveryType: "shipping",
    discount: "0.00",
    guestEmail: "test@example.com",
    guestName: null,
    guestSessionId: "s1",
    id: "o1",
    paymentMethod: "card",
    paymentStatus: "pending",
    shippingAddressId: "addr-1",
    shippingFee: "10.00",
    status: "pending",
    totalPrice: "60.00",
    updatedAt: null,
    userId: null,
  },
}));

vi.mock("./orders.service", () => ({
  ordersService: {
    createOrder: vi.fn().mockResolvedValue(mockOrder),
    getOrder: vi.fn().mockResolvedValue(mockOrder),
<<<<<<< HEAD
    listForShop: vi.fn().mockResolvedValue([mockOrder]),
    listForUser: vi.fn().mockResolvedValue([mockOrder]),
    updateStatus: vi.fn().mockResolvedValue({ ...mockOrder, status: "confirmed" }),
  },
}));

vi.mock("../users/users.service", () => ({
  usersService: {
    lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "u1" }),
=======
>>>>>>> origin/main
  },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

<<<<<<< HEAD
vi.mock("../../utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

=======
>>>>>>> origin/main
describe("orders routes", () => {
  it("POST /orders/checkout performs guest checkout", async () => {
    const response = await app.handle(
      new Request("http://localhost/orders/checkout", {
        body: JSON.stringify({
          deliveryType: "shipping",
          guestEmail: "test@example.com",
          paymentMethod: "card",
          shippingAddress: {
            city: "B",
            country: "CZ",
            houseNumber: "1",
            postalCode: "1",
            street: "S",
          },
        }),
        headers: {
          "Content-Type": "application/json",
          cookie: "guest_session_id=s1",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as unknown as { id: string };
    expect(data.id).toBe("o1");
  });

<<<<<<< HEAD
  describe("GET /orders", () => {
    it("returns 401 when no auth token provided", async () => {
      const response = await app.handle(new Request("http://localhost/orders", { method: "GET" }));
      expect(response.status).toBe(401);
    });

    it("returns customer order list when authenticated", async () => {
      vi.mocked(verifyClerkToken).mockResolvedValue({ roles: ["customer"], sub: "u1" } as any);
      vi.mocked(usersService.lazyGetOrCreate).mockResolvedValue({ id: "u1" } as any);

      const response = await app.handle(
        new Request("http://localhost/orders", {
          headers: { Authorization: "Bearer test" },
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as unknown[];
      expect(Array.isArray(data)).toBe(true);

      vi.mocked(verifyClerkToken).mockResolvedValue(null);
    });

    it("returns 403 when shopId provided but user lacks shop_owner/admin role", async () => {
      vi.mocked(verifyClerkToken).mockResolvedValue({ roles: ["customer"], sub: "u1" } as any);
      vi.mocked(usersService.lazyGetOrCreate).mockResolvedValue({ id: "u1" } as any);

      const response = await app.handle(
        new Request("http://localhost/orders?shopId=shop1", {
          headers: { Authorization: "Bearer test" },
          method: "GET",
        })
      );

      expect(response.status).toBe(403);

      vi.mocked(verifyClerkToken).mockResolvedValue(null);
    });

    it("returns shop order list when shop owner requests with shopId", async () => {
      vi.mocked(verifyClerkToken).mockResolvedValue({
        roles: ["shop_owner"],
        sub: "u1",
      } as any);
      vi.mocked(usersService.lazyGetOrCreate).mockResolvedValue({ id: "u1" } as any);

      const response = await app.handle(
        new Request("http://localhost/orders?shopId=shop1", {
          headers: { Authorization: "Bearer test" },
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as unknown[];
      expect(Array.isArray(data)).toBe(true);

      vi.mocked(verifyClerkToken).mockResolvedValue(null);
    });

    it("returns 403 when service throws FORBIDDEN for shopId query", async () => {
      vi.mocked(verifyClerkToken).mockResolvedValue({
        roles: ["shop_owner"],
        sub: "u1",
      } as any);
      vi.mocked(usersService.lazyGetOrCreate).mockResolvedValue({ id: "u1" } as any);
      const { ordersService } = await import("./orders.service");
      vi.mocked(ordersService.listForShop).mockRejectedValueOnce(new Error("FORBIDDEN"));

      const response = await app.handle(
        new Request("http://localhost/orders?shopId=shop1", {
          headers: { Authorization: "Bearer test" },
          method: "GET",
        })
      );

      expect(response.status).toBe(403);

      vi.mocked(verifyClerkToken).mockResolvedValue(null);
    });
  });

  describe("PATCH /orders/:id/status", () => {
    beforeEach(() => {
      vi.mocked(verifyClerkToken).mockResolvedValue({
        roles: ["shop_owner"],
        sub: "u1",
      } as any);
      vi.mocked(usersService.lazyGetOrCreate).mockResolvedValue({ id: "u1" } as any);
    });

    afterEach(() => {
      vi.mocked(verifyClerkToken).mockResolvedValue(null);
    });

    it("returns 200 when shop owner updates order to valid next status", async () => {
      const response = await app.handle(
        new Request("http://localhost/orders/o1/status", {
          body: JSON.stringify({ status: "confirmed" }),
          headers: { Authorization: "Bearer test", "Content-Type": "application/json" },
          method: "PATCH",
        })
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as { status: string };
      expect(data.status).toBe("confirmed");
    });

    it("returns 401 when no auth token provided", async () => {
      vi.mocked(verifyClerkToken).mockResolvedValue(null);

      const response = await app.handle(
        new Request("http://localhost/orders/o1/status", {
          body: JSON.stringify({ status: "confirmed" }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        })
      );

      expect(response.status).toBe(401);
    });

    it("returns 403 when service throws FORBIDDEN", async () => {
      const { ordersService } = await import("./orders.service");
      vi.mocked(ordersService.updateStatus).mockRejectedValueOnce(new Error("FORBIDDEN"));

      const response = await app.handle(
        new Request("http://localhost/orders/o1/status", {
          body: JSON.stringify({ status: "confirmed" }),
          headers: { Authorization: "Bearer test", "Content-Type": "application/json" },
          method: "PATCH",
        })
      );

      expect(response.status).toBe(403);
    });

    it("returns 404 when service throws NOT_FOUND", async () => {
      const { ordersService } = await import("./orders.service");
      vi.mocked(ordersService.updateStatus).mockRejectedValueOnce(new Error("NOT_FOUND"));

      const response = await app.handle(
        new Request("http://localhost/orders/o1/status", {
          body: JSON.stringify({ status: "confirmed" }),
          headers: { Authorization: "Bearer test", "Content-Type": "application/json" },
          method: "PATCH",
        })
      );

      expect(response.status).toBe(404);
    });

    it("returns 422 when service throws INVALID_TRANSITION", async () => {
      const { ordersService } = await import("./orders.service");
      vi.mocked(ordersService.updateStatus).mockRejectedValueOnce(new Error("INVALID_TRANSITION"));

      const response = await app.handle(
        new Request("http://localhost/orders/o1/status", {
          body: JSON.stringify({ status: "delivered" }),
          headers: { Authorization: "Bearer test", "Content-Type": "application/json" },
          method: "PATCH",
        })
      );

      expect(response.status).toBe(422);
    });
  });

=======
>>>>>>> origin/main
  it("POST /orders/checkout returns 400 if guest email missing", async () => {
    const response = await app.handle(
      new Request("http://localhost/orders/checkout", {
        body: JSON.stringify({
          deliveryType: "shipping",
          paymentMethod: "card",
          shippingAddress: {
            city: "B",
            country: "CZ",
            houseNumber: "1",
            postalCode: "1",
            street: "S",
          },
        }),
        headers: {
          "Content-Type": "application/json",
          cookie: "guest_session_id=s1",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
  });
<<<<<<< HEAD

  describe("GET /orders/:id", () => {
    beforeEach(() => {
      vi.mocked(verifyClerkToken).mockResolvedValue({ roles: ["customer"], sub: "u1" } as any);
      vi.mocked(usersService.lazyGetOrCreate).mockResolvedValue({ id: "u1" } as any);
    });

    afterEach(() => {
      vi.mocked(verifyClerkToken).mockResolvedValue(null);
    });

    it("returns order confirmation with items and addresses on success", async () => {
      const mockOrderWithDetails = {
        ...mockOrder,
        billingAddress: {
          city: "Brno",
          country: "CZ",
          houseNumber: "1",
          id: "addr-1",
          postalCode: "61200",
          street: "Main St",
        },
        items: [
          {
            id: "item1",
            orderId: "o1",
            product: { id: "p1", name: "Cabernet Sauvignon" },
            productId: "p1",
            quantity: 2,
            shopId: "shop1",
            unitPriceAtPurchase: "30.00",
          },
        ],
        shippingAddress: {
          city: "Brno",
          country: "CZ",
          houseNumber: "1",
          id: "addr-1",
          postalCode: "61200",
          street: "Main St",
        },
      };

      const { ordersService } = await import("./orders.service");
      vi.mocked(ordersService.getOrder).mockResolvedValueOnce(mockOrderWithDetails);

      const response = await app.handle(
        new Request("http://localhost/orders/o1", {
          headers: { Authorization: "Bearer test" },
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as any;
      expect(data.id).toBe("o1");
      expect(data.items).toHaveLength(1);
      expect(data.items[0].product.name).toBe("Cabernet Sauvignon");
      expect(data.billingAddress.city).toBe("Brno");
      expect(data.shippingAddress.country).toBe("CZ");
    });

    it("returns 401 when no auth token provided", async () => {
      vi.mocked(verifyClerkToken).mockResolvedValue(null);

      const response = await app.handle(
        new Request("http://localhost/orders/o1", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
    });

    it("returns 403 when service throws FORBIDDEN", async () => {
      const { ordersService } = await import("./orders.service");
      vi.mocked(ordersService.getOrder).mockRejectedValueOnce(new Error("FORBIDDEN"));

      const response = await app.handle(
        new Request("http://localhost/orders/o1", {
          headers: { Authorization: "Bearer test" },
          method: "GET",
        })
      );

      expect(response.status).toBe(403);
    });

    it("returns 404 when order not found", async () => {
      const { ordersService } = await import("./orders.service");
      vi.mocked(ordersService.getOrder).mockRejectedValueOnce(new Error("NOT_FOUND"));

      const response = await app.handle(
        new Request("http://localhost/orders/o999", {
          headers: { Authorization: "Bearer test" },
          method: "GET",
        })
      );

      expect(response.status).toBe(404);
    });
  });
=======
>>>>>>> origin/main
});
