import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./orders.repository", () => ({
  ordersRepository: {
    findById: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    listForUser: vi.fn(),
  },
}));

vi.mock("../carts/carts.service", () => ({
  cartsService: {
    getCartForUser: vi.fn(),
    getCartForSession: vi.fn(),
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

  describe("createOrder", () => {
    const mockCheckoutData: CheckoutData = {
      paymentMethod: "card",
      deliveryType: "shipping",
      shippingAddress: {
        country: "CZ",
        city: "Brno",
        postalCode: "60200",
        street: "Botanicka",
        houseNumber: "68a",
      },
    };

    it("creates an order from a user cart", async () => {
      const mockCart = {
        items: [
          {
            productId: "p1",
            quantity: 2,
            product: { id: "p1", shopId: "s1", price: "100", quantity: 10, name: "Wine" },
          },
        ],
      };

      vi.mocked(cartsService.getCartForUser).mockResolvedValue(mockCart as never);
      vi.mocked(ordersRepository.create).mockResolvedValue({ id: "order-1" } as never);

      const result = await ordersService.createOrder({ userId: "u1" }, mockCheckoutData);

      expect(result.id).toBe("order-1");
      expect(ordersRepository.create).toHaveBeenCalled();
    });

    it("throws INSUFFICIENT_STOCK if product quantity is low", async () => {
      const mockCart = {
        items: [
          {
            productId: "p1",
            quantity: 20,
            product: { id: "p1", shopId: "s1", price: "100", quantity: 10, name: "Wine" },
          },
        ],
      };

      vi.mocked(cartsService.getCartForUser).mockResolvedValue(mockCart as never);

      await expect(ordersService.createOrder({ userId: "u1" }, mockCheckoutData)).rejects.toThrow(
        "INSUFFICIENT_STOCK:Wine"
      );
    });
  });
});
