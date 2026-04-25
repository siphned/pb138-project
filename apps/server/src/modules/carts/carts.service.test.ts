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

    it("does nothing if guest cart doesn't exist", async () => {
      vi.mocked(cartsRepository.findBySessionId).mockResolvedValue(undefined);

      await cartsService.mergeOnLogin("user-1", "session-1");

      expect(cartsRepository.mergeCarts).not.toHaveBeenCalled();
    });
  });
});
