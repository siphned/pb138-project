import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./carts.repository", () => ({
  cartsRepository: {
    findByUserId: vi.fn(),
    findBySessionId: vi.fn(),
    findByIdWithItems: vi.fn(),
    create: vi.fn(),
    addItem: vi.fn(),
    updateItemQuantity: vi.fn(),
    removeItem: vi.fn(),
    mergeCarts: vi.fn(),
  },
}));

vi.mock("../products/products.repository", () => ({
  productsRepository: {
    isDeleted: vi.fn().mockResolvedValue(false),
  },
}));

import { cartsRepository } from "./carts.repository";
import { cartsService } from "./carts.service";

describe("cartsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCartForUser", () => {
    it("creates a new cart if one doesn't exist for the user", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(undefined);
      vi.mocked(cartsRepository.create).mockResolvedValue({ id: "new-cart-id" } as never);
      vi.mocked(cartsRepository.findByIdWithItems).mockResolvedValue({
        id: "new-cart-id",
        items: [],
      } as never);

      const result = await cartsService.getCartForUser("user-1");

      expect(result?.id).toBe("new-cart-id");
      expect(cartsRepository.create).toHaveBeenCalledWith({ userId: "user-1" });
    });

    it("returns existing cart with items", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue({ id: "c1" } as never);
      const mockCartWithItems = { id: "c1", items: [{ productId: "p1" }] };
      vi.mocked(cartsRepository.findByIdWithItems).mockResolvedValue(mockCartWithItems as never);

      const result = await cartsService.getCartForUser("u1");

      expect(result).toBe(mockCartWithItems);
      expect(cartsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getCartForSession", () => {
    it("creates a new cart if one doesn't exist for the session", async () => {
      vi.mocked(cartsRepository.findBySessionId).mockResolvedValue(undefined);
      vi.mocked(cartsRepository.create).mockResolvedValue({ id: "new-s-cart" } as never);
      vi.mocked(cartsRepository.findByIdWithItems).mockResolvedValue({ id: "new-s-cart" } as never);

      const result = await cartsService.getCartForSession("s1");

      expect(result?.id).toBe("new-s-cart");
      expect(cartsRepository.create).toHaveBeenCalledWith({ sessionId: "s1" });
    });
  });

  describe("addItem", () => {
    it("adds item to existing user cart", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue({ id: "c1" } as never);

      await cartsService.addItem({ userId: "u1" }, "p1", 2);

      expect(cartsRepository.addItem).toHaveBeenCalledWith("c1", "p1", 2);
    });

    it("adds item to existing session cart", async () => {
      vi.mocked(cartsRepository.findBySessionId).mockResolvedValue({ id: "c1" } as never);

      await cartsService.addItem({ sessionId: "s1" }, "p1", 5);

      expect(cartsRepository.addItem).toHaveBeenCalledWith("c1", "p1", 5);
    });

    it("throws error if neither userId nor sessionId is provided", async () => {
      await expect(cartsService.addItem({}, "p1", 1)).rejects.toThrow(
        "Could not find or create cart"
      );
    });
  });

  describe("updateItemQuantity", () => {
    it("updates quantity for user cart", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue({ id: "c1" } as never);

      await cartsService.updateItemQuantity({ userId: "u1" }, "p1", 10);

      expect(cartsRepository.updateItemQuantity).toHaveBeenCalledWith("c1", "p1", 10);
    });

    it("throws error if cart not found", async () => {
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(undefined);
      await expect(cartsService.updateItemQuantity({ userId: "u1" }, "p1", 5)).rejects.toThrow(
        "Cart not found"
      );
    });
  });

  describe("removeItem", () => {
    it("removes item from session cart", async () => {
      vi.mocked(cartsRepository.findBySessionId).mockResolvedValue({ id: "c1" } as never);

      await cartsService.removeItem({ sessionId: "s1" }, "p1");

      expect(cartsRepository.removeItem).toHaveBeenCalledWith("c1", "p1");
    });
  });

  describe("mergeOnLogin", () => {
    it("merges guest cart into user cart if guest cart exists", async () => {
      const guestCart = { id: "guest-cart-1" };
      const userCart = { id: "user-cart-1" };

      vi.mocked(cartsRepository.findBySessionId).mockResolvedValue(guestCart as never);
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(userCart as never);

      await cartsService.mergeOnLogin("user-1", "session-1");

      expect(cartsRepository.mergeCarts).toHaveBeenCalledWith("guest-cart-1", "user-cart-1");
    });

    it("creates user cart if it doesn't exist during merge", async () => {
      vi.mocked(cartsRepository.findBySessionId).mockResolvedValue({ id: "gc1" } as never);
      vi.mocked(cartsRepository.findByUserId).mockResolvedValue(undefined);
      vi.mocked(cartsRepository.create).mockResolvedValue({ id: "new-uc1" } as never);

      await cartsService.mergeOnLogin("u1", "s1");

      expect(cartsRepository.create).toHaveBeenCalledWith({ userId: "u1" });
      expect(cartsRepository.mergeCarts).toHaveBeenCalledWith("gc1", "new-uc1");
    });

    it("does nothing if guest cart doesn't exist", async () => {
      vi.mocked(cartsRepository.findBySessionId).mockResolvedValue(undefined);

      await cartsService.mergeOnLogin("user-1", "session-1");

      expect(cartsRepository.mergeCarts).not.toHaveBeenCalled();
    });
  });
});
