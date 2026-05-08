import { beforeEach, describe, expect, it, vi } from "vitest";
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

describe("cartsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    });
  });

  describe("addItem", () => {
    it("adds item to user cart and returns updated cart", async () => {
      vi.mocked(cartsRepo.findByUserId).mockResolvedValue({ id: cartId } as any);
      vi.mocked(productsRepo.findById).mockResolvedValue({ id: productId, quantity: 10 } as any);
      vi.mocked(cartsRepo.getCartItems).mockResolvedValue([]);

      await cartsService.addItem({ userId }, productId, 2);

      expect(cartsRepo.addItem).toHaveBeenCalledWith(db, cartId, productId, 2);
    });
  });

  describe("mergeOnLogin", () => {
    it("merges guest cart into user cart if guest cart exists", async () => {
      const guestCartId = "guest-c";
      const userCartId = "user-c";
      const guestItems = [{ productId: "p1", quantity: 1 }];

      vi.mocked(cartsRepo.findBySessionId).mockResolvedValue({ id: guestCartId } as any);
      vi.mocked(cartsRepo.findByUserId).mockResolvedValue({ id: userCartId } as any);
      vi.mocked(cartsRepo.getCartItems).mockResolvedValue(guestItems as any);

      await cartsService.mergeOnLogin(userId, sessionId);

      expect(cartsRepo.addItem).toHaveBeenCalledWith(expect.anything(), userCartId, "p1", 1);
      expect(cartsRepo.deleteCart).toHaveBeenCalledWith(expect.anything(), guestCartId);
    });
  });
});
