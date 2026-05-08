import { beforeEach, describe, expect, it, vi } from "vitest";
import { cartsService } from "../carts/carts.service";
import * as productsRepo from "../products/products.repository";
import * as ordersRepo from "./orders.repository";
import { ordersService } from "./orders.service";

vi.mock("./orders.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./orders.repository")>();
  return {
    ...actual,
    createOrder: vi.fn(),
    createOrderItems: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };
});

vi.mock("../products/products.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../products/products.repository")>();
  return {
    ...actual,
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

vi.mock("../../db", () => {
  const m = {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "a1" }]),
      }),
    }),
    transaction: vi.fn((cb) => cb(m)),
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

  describe("updateStatus", () => {
    it("updates status of an existing order", async () => {
      vi.mocked(ordersRepo.findById).mockResolvedValue({ id: "o1" } as any);
      vi.mocked(ordersRepo.updateStatus).mockResolvedValue({
        id: "o1",
        status: "shipped",
      } as any);

      const result = await ordersService.updateStatus("o1", "u1", "shipped");

      expect(result.status).toBe("shipped");
      expect(ordersRepo.updateStatus).toHaveBeenCalledWith(expect.anything(), "o1", "shipped");
    });
  });
});
