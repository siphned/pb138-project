import { beforeEach, describe, expect, it, vi } from "vitest";
import { cartsService } from "../carts/carts.service";
import * as productsRepo from "../products/products.repository";
import * as shopsRepo from "../shops/shops.repository";
import * as ordersRepo from "./orders.repository";
import { ordersService } from "./orders.service";

vi.mock("../shops/shops.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../shops/shops.repository")>();
  return { ...actual, findAllByOwnerUserId: vi.fn(), findById: vi.fn() };
});

vi.mock("./orders.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./orders.repository")>();
  return {
    ...actual,
    createOrder: vi.fn(),
    createOrderItems: vi.fn(),
    findById: vi.fn(),
    listForShop: vi.fn(),
    listForUser: vi.fn(),
    updateStatus: vi.fn(),
  };
});

vi.mock("../products/products.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../products/products.repository")>();
  return {
    ...actual,
    decrementStock: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    updateWineQuantity: vi.fn(),
  };
});

vi.mock("../users/users.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../users/users.repository")>();
  return { ...actual, findById: vi.fn() };
});

vi.mock("../carts/carts.service", () => ({
  cartsService: {
    clearCart: vi.fn(),
    clearCartBySession: vi.fn(),
    getCartForSession: vi.fn(),
    getCartForUser: vi.fn(),
  },
}));

vi.mock("../email/email.service", () => ({
  emailService: {
    sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
    sendOrderStatusUpdate: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("../../db", () => {
  const m = {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "a1" }]),
      }),
    }),
    transaction: vi.fn((cb) => cb(m)),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "u1" }]),
        }),
      }),
    }),
  };
  return { db: m };
});

describe("ordersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCheckoutData = {
    deliveryType: "shipping" as const,
    paymentMethod: "card" as const,
    shippingAddress: {
      city: "Brno",
      country: "CZ",
      houseNumber: "68a",
      postalCode: "60200",
      street: "Botanicka",
    },
  };

  describe("createOrder", () => {
    it("creates an order from a user cart", async () => {
      const mockCart = {
        items: [
          {
            product: {
              deletedAt: null,
              id: "p1",
              name: "Wine",
              price: "100",
              productWines: [],
              quantity: 10,
              shopId: "s1",
            },
            productId: "p1",
            quantity: 2,
          },
        ],
      };

      vi.mocked(cartsService.getCartForUser).mockResolvedValue(mockCart as any);
      vi.mocked(ordersRepo.createOrder).mockResolvedValue({ id: "order-1" } as any);
      vi.mocked(productsRepo.findById).mockResolvedValue({
        id: "p1",
        productWines: [],
        quantity: 10,
      } as any);

      const result = await ordersService.createOrder({ userId: "u1" }, mockCheckoutData);

      expect(result.id).toBe("order-1");
      expect(ordersRepo.createOrder).toHaveBeenCalled();
    });
  });

  describe("getOrder", () => {
    it("returns order if user owns it", async () => {
      const mockOrder = { id: "o1", userId: "u1" };
      vi.mocked(ordersRepo.findById).mockResolvedValue(mockOrder as any);

      const result = await ordersService.getOrder("o1", "u1");

      expect(result).toBe(mockOrder);
    });
  });

  describe("listForUser", () => {
    it("returns orders for the authenticated user", async () => {
      const mockOrders = [{ id: "o1" }, { id: "o2" }];
      vi.mocked(ordersRepo.listForUser).mockResolvedValue(mockOrders as any);

      const result = await ordersService.listForUser("u1");

      expect(result).toBe(mockOrders);
      expect(ordersRepo.listForUser).toHaveBeenCalledWith(expect.anything(), "u1");
    });
  });

  describe("listForShop", () => {
    it("returns orders for the shop when requester is admin (bypasses ownership)", async () => {
      vi.mocked(ordersRepo.listForShop).mockResolvedValue([{ order: { id: "o1" } }] as any);

      const result = await ordersService.listForShop("shop1", "admin1", true);

      expect(result).toEqual([{ id: "o1" }]);
    });

    it("returns orders when shop owner owns the shop", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({ id: "shop1", ownerUserId: "u1" } as any);
      vi.mocked(ordersRepo.listForShop).mockResolvedValue([{ order: { id: "o1" } }] as any);

      const result = await ordersService.listForShop("shop1", "u1", false);

      expect(result).toEqual([{ id: "o1" }]);
    });

    it("throws FORBIDDEN when requester does not own the shop", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({
        id: "shop1",
        ownerUserId: "other-user",
      } as any);

      await expect(ordersService.listForShop("shop1", "u1", false)).rejects.toThrow("FORBIDDEN");
    });

    it("throws NOT_FOUND when the shop does not exist", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue(undefined);

      await expect(ordersService.listForShop("nonexistent", "u1", false)).rejects.toThrow(
        "NOT_FOUND"
      );
    });
  });

  describe("updateStatus", () => {
    it("updates status of an existing order as admin (bypasses ownership)", async () => {
      vi.mocked(ordersRepo.findById).mockResolvedValue({
        id: "o1",
        items: [{ shopId: "shop-other" }],
        status: "confirmed",
      } as any);
      vi.mocked(ordersRepo.updateStatus).mockResolvedValue({
        id: "o1",
        status: "shipped",
      } as any);

      const result = await ordersService.updateStatus("o1", "admin1", "shipped", true);

      expect(result.status).toBe("shipped");
      expect(ordersRepo.updateStatus).toHaveBeenCalledWith(expect.anything(), "o1", "shipped");
    });

    it("throws INVALID_TRANSITION when transition is not in the allowed set", async () => {
      vi.mocked(ordersRepo.findById).mockResolvedValue({
        id: "o1",
        items: [{ shopId: "shop-mine" }],
        status: "pending",
      } as any);

      await expect(ordersService.updateStatus("o1", "u1", "delivered", true)).rejects.toThrow(
        "INVALID_TRANSITION"
      );
    });

    it("throws FORBIDDEN when shop owner has no shop matching the order items", async () => {
      vi.mocked(ordersRepo.findById).mockResolvedValue({
        id: "o1",
        items: [{ shopId: "shop-other" }],
        status: "pending",
      } as any);
      vi.mocked(shopsRepo.findAllByOwnerUserId).mockResolvedValue([{ id: "shop-mine" }] as any);

      await expect(ordersService.updateStatus("o1", "u1", "confirmed", false)).rejects.toThrow(
        "FORBIDDEN"
      );
    });

    it("updates status when shop owner owns a shop matching an order item", async () => {
      vi.mocked(ordersRepo.findById).mockResolvedValue({
        id: "o1",
        items: [{ shopId: "shop-mine" }],
        status: "pending",
      } as any);
      vi.mocked(shopsRepo.findAllByOwnerUserId).mockResolvedValue([{ id: "shop-mine" }] as any);
      vi.mocked(ordersRepo.updateStatus).mockResolvedValue({
        id: "o1",
        status: "confirmed",
      } as any);

      const result = await ordersService.updateStatus("o1", "u1", "confirmed", false);

      expect(result.status).toBe("confirmed");
    });
  });
});
