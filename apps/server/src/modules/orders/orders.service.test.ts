import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./orders.repository", () => ({
  ordersRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    listForUser: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

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

vi.mock("../users/users.repository", () => ({
  usersRepository: {
    findById: vi.fn(),
  },
}));

import { cartsService } from "../carts/carts.service";
import { ordersRepository } from "./orders.repository";
import type { CheckoutData } from "./orders.service";
import { ordersService } from "./orders.service";

describe("ordersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCheckoutData: CheckoutData = {
    deliveryType: "shipping",
    paymentMethod: "card",
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
              quantity: 10,
              shopId: "s1",
            },
            productId: "p1",
            quantity: 2,
          },
        ],
      };

      vi.mocked(cartsService.getCartForUser).mockResolvedValue(mockCart as never);
      vi.mocked(ordersRepository.create).mockResolvedValue({ id: "order-1" } as never);

      const result = await ordersService.createOrder({ userId: "u1" }, mockCheckoutData);

      expect(result.id).toBe("order-1");
      expect(ordersRepository.create).toHaveBeenCalled();
    });

    it("creates an order from a session cart", async () => {
      const mockCart = {
        items: [
          {
            product: {
              deletedAt: null,
              id: "p1",
              name: "Wine",
              price: "50",
              quantity: 5,
              shopId: "s1",
            },
            productId: "p1",
            quantity: 1,
          },
        ],
      };

      vi.mocked(cartsService.getCartForSession).mockResolvedValue(mockCart as never);
      vi.mocked(ordersRepository.create).mockResolvedValue({ id: "order-guest" } as never);

      const result = await ordersService.createOrder({ sessionId: "s1" }, mockCheckoutData);

      expect(result.id).toBe("order-guest");
      expect(cartsService.getCartForSession).toHaveBeenCalledWith("s1");
    });

    it("throws CART_EMPTY if cart has no items", async () => {
      vi.mocked(cartsService.getCartForUser).mockResolvedValue({ items: [] } as never);

      await expect(ordersService.createOrder({ userId: "u1" }, mockCheckoutData)).rejects.toThrow(
        "CART_EMPTY"
      );
    });

    it("throws INSUFFICIENT_STOCK if product quantity is low", async () => {
      const mockCart = {
        items: [
          {
            product: {
              deletedAt: null,
              id: "p1",
              name: "Wine",
              price: "100",
              quantity: 10,
              shopId: "s1",
            },
            productId: "p1",
            quantity: 20,
          },
        ],
      };

      vi.mocked(cartsService.getCartForUser).mockResolvedValue(mockCart as never);

      await expect(ordersService.createOrder({ userId: "u1" }, mockCheckoutData)).rejects.toThrow(
        "INSUFFICIENT_STOCK:Wine"
      );
    });
  });

  describe("getOrder", () => {
    it("returns order if user owns it", async () => {
      const mockOrder = { id: "o1", userId: "u1" };
      vi.mocked(ordersRepository.findById).mockResolvedValue(mockOrder as never);

      const result = await ordersService.getOrder("o1", "u1");

      expect(result).toBe(mockOrder);
    });

    it("throws NOT_FOUND if order doesn't exist", async () => {
      vi.mocked(ordersRepository.findById).mockResolvedValue(undefined);

      await expect(ordersService.getOrder("o1", "u1")).rejects.toThrow("NOT_FOUND");
    });

    it("throws FORBIDDEN if user does not own the order", async () => {
      vi.mocked(ordersRepository.findById).mockResolvedValue({
        id: "o1",
        userId: "other",
      } as never);

      await expect(ordersService.getOrder("o1", "u1")).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("updateStatus", () => {
    it("updates status of an existing order", async () => {
      vi.mocked(ordersRepository.findById).mockResolvedValue({ id: "o1" } as never);
      vi.mocked(ordersRepository.updateStatus).mockResolvedValue({
        id: "o1",
        status: "shipped",
      } as never);

      const result = await ordersService.updateStatus("o1", "u1", "shipped" as never);

      expect(result.status).toBe("shipped");
      expect(ordersRepository.updateStatus).toHaveBeenCalledWith("o1", "shipped");
    });

    it("throws NOT_FOUND when updating non-existent order", async () => {
      vi.mocked(ordersRepository.findById).mockResolvedValue(undefined);

      await expect(ordersService.updateStatus("o1", "u1", "shipped" as never)).rejects.toThrow(
        "NOT_FOUND"
      );
    });
  });
});
