import { beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD
import { db } from "../../db";
import * as productsRepo from "../products/products.repository";
import * as cartsRepo from "./carts.repository";
import { cartsService } from "./carts.service";

vi.mock("./carts.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./carts.repository")>();
  return {
    ...actual,
    addItem: vi.fn(),
    clearCart: vi.fn(),
    create: vi.fn(),
    deleteCart: vi.fn(),
    findBySessionId: vi.fn(),
    findByUserId: vi.fn(),
    getCartItems: vi.fn(),
    removeItem: vi.fn(),
    updateItemQuantity: vi.fn(),
  };
});

vi.mock("../products/products.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../products/products.repository")>();
  return { ...actual, findById: vi.fn() };
});

vi.mock("../../db", () => {
  const m = {
    query: {
      carts: { findFirst: vi.fn() },
    },
    transaction: vi.fn((cb) => cb(m)),
  };
  return { db: m };
});
=======

vi.mock("./carts.repository", () => ({
  cartsRepository: {
    addItem: vi.fn(),
    create: vi.fn(),
    findByIdWithItems: vi.fn(),
    findBySessionId: vi.fn(),
    findByUserId: vi.fn(),
    mergeCarts: vi.fn(),
    removeItem: vi.fn(),
    updateItemQuantity: vi.fn(),
  },
}));

vi.mock("../products/products.repository", () => ({
  productsRepository: {
    isDeleted: vi.fn().mockResolvedValue(false),
  },
}));

import { cartsRepository } from "./carts.repository";
import { cartsService } from "./carts.service";
>>>>>>> origin/main

describe("cartsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

<<<<<<< HEAD
  const userId = "u1";
  const sessionId = "s1";
  const productId = "p1";
  const cartId = "c1";

  describe("getCartForUser", () => {
    it("returns existing cart if found", async () => {
      const mockCart = { id: cartId, items: [] };
      vi.mocked(cartsRepo.findByUserId).mockResolvedValue(mockCart as any);
      vi.mocked(db.query.carts.findFirst).mockResolvedValue(mockCart as any);

      const result = await cartsService.getCartForUser(userId);

      expect(result?.id).toBe(cartId);
    });

    it("creates and returns new cart if none found", async () => {
      vi.mocked(cartsRepo.findByUserId).mockResolvedValue(undefined);
      vi.mocked(cartsRepo.create).mockResolvedValue({ id: "new-c" } as any);
      vi.mocked(cartsRepo.getCartItems).mockResolvedValue([]);
      vi.mocked(db.query.carts.findFirst).mockResolvedValue({ id: "new-c" } as any);

      const result = await cartsService.getCartForUser(userId);

      expect(result?.id).toBe("new-c");
=======
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
>>>>>>> origin/main
    });
  });

  describe("addItem", () => {
<<<<<<< HEAD
    it("adds item to user cart and returns updated cart", async () => {
      vi.mocked(cartsRepo.findByUserId).mockResolvedValue({ id: cartId } as any);
      vi.mocked(productsRepo.findById).mockResolvedValue({ id: productId, quantity: 10 } as any);
      vi.mocked(cartsRepo.getCartItems).mockResolvedValue([]);

      await cartsService.addItem({ userId }, productId, 2);

      expect(cartsRepo.addItem).toHaveBeenCalledWith(db, cartId, productId, 2);
=======
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
>>>>>>> origin/main
    });
  });

  describe("mergeOnLogin", () => {
    it("merges guest cart into user cart if guest cart exists", async () => {
<<<<<<< HEAD
      const guestCartId = "guest-c";
      const userCartId = "user-c";
      const guestItems = [{ productId: "p1", quantity: 1 }];

      vi.mocked(cartsRepo.findBySessionId).mockResolvedValue({ id: guestCartId } as any);
      vi.mocked(cartsRepo.findByUserId).mockResolvedValue({ id: userCartId } as any);
      vi.mocked(cartsRepo.getCartItems).mockResolvedValue(guestItems as any);

      await cartsService.mergeOnLogin(userId, sessionId);

      expect(cartsRepo.addItem).toHaveBeenCalledWith(expect.anything(), userCartId, "p1", 1);
      expect(cartsRepo.deleteCart).toHaveBeenCalledWith(expect.anything(), guestCartId);
=======
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
>>>>>>> origin/main
    });
  });
});
