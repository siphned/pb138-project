import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./carts.repository", () => ({
  cartsRepository: {
    findByUserId: vi.fn(),
    upsertCart: vi.fn(),
    findItem: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
    mergeGuestItems: vi.fn(),
  },
}));

vi.mock("../products/products.repository", () => ({
  productsRepository: {
    findById: vi.fn(),
  },
}));

import { cartsRepository } from "./carts.repository";
import { cartsService } from "./carts.service";
import { productsRepository } from "../products/products.repository";

const mockCartBase = {
  id: "cart-1",
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockCartEmpty = { ...mockCartBase, items: [] };
const mockProduct = {
  id: "prod-1",
  shopId: "shop-1",
  name: "Red Wine",
  price: "25.00",
  isBundle: false,
  quantity: 10,
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  productWines: [],
};
const mockCartItem = {
  id: "item-1",
  cartId: "cart-1",
  productId: "prod-1",
  quantity: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("cartsService.getMyCart", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upserts the cart and returns it with items", async () => {
    vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartEmpty);

    const result = await cartsService.getMyCart("user-1");

    expect(cartsRepository.upsertCart).toHaveBeenCalledWith("user-1");
    expect(cartsRepository.findByUserId).toHaveBeenCalledWith("user-1");
    expect(result.items).toHaveLength(0);
  });
});

describe("cartsService.addItem", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws NOT_FOUND when product does not exist", async () => {
    vi.mocked(productsRepository.findById).mockResolvedValue(undefined);

    await expect(cartsService.addItem("user-1", "bad-id", 1)).rejects.toThrow("NOT_FOUND");
    expect(cartsRepository.addItem).not.toHaveBeenCalled();
  });

  it("adds item and returns updated cart when product exists", async () => {
    vi.mocked(productsRepository.findById).mockResolvedValue(mockProduct as never);
    vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
    vi.mocked(cartsRepository.addItem).mockResolvedValue(mockCartItem);
    const cartWithItem = {
      ...mockCartEmpty,
      items: [{ ...mockCartItem, product: mockProduct }],
    };
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue(cartWithItem as never);

    const result = await cartsService.addItem("user-1", "prod-1", 2);

    expect(cartsRepository.addItem).toHaveBeenCalledWith("cart-1", "prod-1", 2);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.quantity).toBe(2);
  });
});

describe("cartsService.updateItem", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws NOT_FOUND when item belongs to a different cart", async () => {
    vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
    vi.mocked(cartsRepository.findItem).mockResolvedValue({
      ...mockCartItem,
      cartId: "cart-other",
    });

    await expect(cartsService.updateItem("user-1", "item-1", 3)).rejects.toThrow("NOT_FOUND");
    expect(cartsRepository.updateItem).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND when item does not exist", async () => {
    vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
    vi.mocked(cartsRepository.findItem).mockResolvedValue(undefined);

    await expect(cartsService.updateItem("user-1", "item-1", 3)).rejects.toThrow("NOT_FOUND");
  });

  it("updates quantity when item belongs to user cart", async () => {
    vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
    vi.mocked(cartsRepository.findItem).mockResolvedValue(mockCartItem);
    vi.mocked(cartsRepository.updateItem).mockResolvedValue({ ...mockCartItem, quantity: 3 });
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartEmpty);

    await cartsService.updateItem("user-1", "item-1", 3);

    expect(cartsRepository.updateItem).toHaveBeenCalledWith("item-1", 3);
  });
});

describe("cartsService.removeItem", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws NOT_FOUND when item belongs to a different cart", async () => {
    vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
    vi.mocked(cartsRepository.findItem).mockResolvedValue({
      ...mockCartItem,
      cartId: "cart-other",
    });

    await expect(cartsService.removeItem("user-1", "item-1")).rejects.toThrow("NOT_FOUND");
    expect(cartsRepository.removeItem).not.toHaveBeenCalled();
  });

  it("removes item when it belongs to user cart", async () => {
    vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
    vi.mocked(cartsRepository.findItem).mockResolvedValue(mockCartItem);
    vi.mocked(cartsRepository.removeItem).mockResolvedValue(undefined);

    await cartsService.removeItem("user-1", "item-1");

    expect(cartsRepository.removeItem).toHaveBeenCalledWith("item-1");
  });
});

describe("cartsService.mergeGuestItems", () => {
  beforeEach(() => vi.clearAllMocks());

  it("delegates to repository with correct cartId and guest items", async () => {
    vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
    vi.mocked(cartsRepository.mergeGuestItems).mockResolvedValue(undefined);
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartEmpty);

    const guestItems = [{ productId: "prod-2", quantity: 1 }];
    await cartsService.mergeGuestItems("user-1", guestItems);

    expect(cartsRepository.mergeGuestItems).toHaveBeenCalledWith("cart-1", guestItems);
  });

  it("returns the cart after merge", async () => {
    vi.mocked(cartsRepository.upsertCart).mockResolvedValue(mockCartBase);
    vi.mocked(cartsRepository.mergeGuestItems).mockResolvedValue(undefined);
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartEmpty);

    const result = await cartsService.mergeGuestItems("user-1", []);

    expect(result.id).toBe("cart-1");
  });
});
