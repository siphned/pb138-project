import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./orders.repository", () => ({
  ordersRepository: {
    createOrderWithItems: vi.fn(),
    findOrdersByUserId: vi.fn(),
    findOrderById: vi.fn(),
    findOrderItem: vi.fn(),
    updateOrderItemStatus: vi.fn(),
  },
}));

vi.mock("../carts/carts.repository", () => ({
  cartsRepository: {
    findByUserId: vi.fn(),
  },
}));

vi.mock("../shops/shops.repository", () => ({
  shopsRepository: {
    findByOwnerUserId: vi.fn(),
  },
}));

import { cartsRepository } from "../carts/carts.repository";
import { ordersRepository } from "./orders.repository";
import { ordersService } from "./orders.service";
import { shopsRepository } from "../shops/shops.repository";

const mockProduct = { id: "prod-1", name: "Wine", price: "25.00", shopId: "shop-1" };

const mockCartItem = {
  id: "ci-1",
  cartId: "cart-1",
  productId: "prod-1",
  quantity: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  product: mockProduct,
};

const mockCartWithItems = {
  id: "cart-1",
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [mockCartItem],
};

const mockOrder = {
  id: "order-1",
  userId: "user-1",
  status: "pending" as const,
  paymentStatus: "pending" as const,
  paymentMethod: "card" as const,
  deliveryType: "shipping" as const,
  totalPrice: "50.00",
  shippingFee: "0",
  discount: "0",
  shippingAddressId: "addr-1",
  billingAddressId: "addr-1",
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
};

const mockOrderItem = {
  id: "oi-1",
  orderId: "order-1",
  shopId: "shop-1",
  productId: "prod-1",
  quantity: 2,
  unitPriceAtPurchase: "25.00",
  status: "pending" as const,
};

const mockOrderWithItems = { ...mockOrder, items: [{ ...mockOrderItem, product: mockProduct }] };

const mockShop = {
  id: "shop-1",
  ownerUserId: "shop-owner-1",
  name: "Test Shop",
  description: "A shop",
  addressId: "addr-1",
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
};

const checkoutBody = {
  paymentMethod: "card" as const,
  deliveryType: "shipping" as const,
  shippingAddressId: "addr-1",
  billingAddressId: "addr-1",
};

describe("ordersService.checkout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws CART_EMPTY when cart is empty", async () => {
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue({
      ...mockCartWithItems,
      items: [],
    } as never);

    await expect(ordersService.checkout("user-1", checkoutBody)).rejects.toThrow("CART_EMPTY");
  });

  it("throws CART_EMPTY when cart does not exist", async () => {
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue(undefined);

    await expect(ordersService.checkout("user-1", checkoutBody)).rejects.toThrow("CART_EMPTY");
  });

  it("throws MISSING_SHIPPING_ADDRESS when neither address field is provided", async () => {
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartWithItems as never);

    await expect(
      ordersService.checkout("user-1", {
        paymentMethod: "card",
        deliveryType: "shipping",
        billingAddressId: "addr-1",
      })
    ).rejects.toThrow("MISSING_SHIPPING_ADDRESS");
  });

  it("throws MISSING_BILLING_ADDRESS when neither billing field is provided", async () => {
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartWithItems as never);

    await expect(
      ordersService.checkout("user-1", {
        paymentMethod: "card",
        deliveryType: "shipping",
        shippingAddressId: "addr-1",
      })
    ).rejects.toThrow("MISSING_BILLING_ADDRESS");
  });

  it("passes new address object to createOrderWithItems when newShippingAddress is provided", async () => {
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartWithItems as never);
    vi.mocked(ordersRepository.createOrderWithItems).mockResolvedValue(mockOrder);
    vi.mocked(ordersRepository.findOrderById).mockResolvedValue(mockOrderWithItems as never);

    const newShippingAddress = {
      country: "CZ",
      city: "Brno",
      street: "Náměstí Svobody",
      postalCode: "60200",
      houseNumber: "1",
    };

    await ordersService.checkout("user-1", {
      paymentMethod: "card",
      deliveryType: "shipping",
      newShippingAddress,
      billingAddressId: "addr-1",
    });

    expect(ordersRepository.createOrderWithItems).toHaveBeenCalledWith(
      expect.objectContaining({ shippingAddress: newShippingAddress, billingAddress: "addr-1" }),
      expect.any(Array),
      "cart-1"
    );
  });

  it("creates order with correct totalPrice and item data", async () => {
    vi.mocked(cartsRepository.findByUserId).mockResolvedValue(mockCartWithItems as never);
    vi.mocked(ordersRepository.createOrderWithItems).mockResolvedValue(mockOrder);
    vi.mocked(ordersRepository.findOrderById).mockResolvedValue(mockOrderWithItems as never);

    await ordersService.checkout("user-1", checkoutBody);

    expect(ordersRepository.createOrderWithItems).toHaveBeenCalledWith(
      expect.objectContaining({ totalPrice: "50.00", userId: "user-1" }),
      [
        {
          shopId: "shop-1",
          productId: "prod-1",
          quantity: 2,
          unitPriceAtPurchase: "25.00",
        },
      ],
      "cart-1"
    );
  });
});

describe("ordersService.getMyOrders", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns orders for the user", async () => {
    vi.mocked(ordersRepository.findOrdersByUserId).mockResolvedValue([mockOrderWithItems] as never);

    const result = await ordersService.getMyOrders("user-1");

    expect(ordersRepository.findOrdersByUserId).toHaveBeenCalledWith("user-1");
    expect(result).toHaveLength(1);
  });
});

describe("ordersService.getOrderById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns order when it belongs to the user", async () => {
    vi.mocked(ordersRepository.findOrderById).mockResolvedValue(mockOrderWithItems as never);

    const result = await ordersService.getOrderById("user-1", "order-1");

    expect(result.id).toBe("order-1");
  });

  it("throws NOT_FOUND when order belongs to another user", async () => {
    vi.mocked(ordersRepository.findOrderById).mockResolvedValue({
      ...mockOrderWithItems,
      userId: "user-other",
    } as never);

    await expect(ordersService.getOrderById("user-1", "order-1")).rejects.toThrow("NOT_FOUND");
  });

  it("throws NOT_FOUND when order does not exist", async () => {
    vi.mocked(ordersRepository.findOrderById).mockResolvedValue(undefined);

    await expect(ordersService.getOrderById("user-1", "order-1")).rejects.toThrow("NOT_FOUND");
  });
});

describe("ordersService.updateOrderItemStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws FORBIDDEN when caller has no shop", async () => {
    vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(undefined);

    await expect(
      ordersService.updateOrderItemStatus("user-1", "order-1", "oi-1", "confirmed")
    ).rejects.toThrow("FORBIDDEN");
  });

  it("throws NOT_FOUND when item does not exist", async () => {
    vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(mockShop as never);
    vi.mocked(ordersRepository.findOrderItem).mockResolvedValue(undefined);

    await expect(
      ordersService.updateOrderItemStatus("shop-owner-1", "order-1", "oi-1", "confirmed")
    ).rejects.toThrow("NOT_FOUND");
  });

  it("throws NOT_FOUND when item belongs to a different order", async () => {
    vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(mockShop as never);
    vi.mocked(ordersRepository.findOrderItem).mockResolvedValue({
      ...mockOrderItem,
      orderId: "order-other",
    } as never);

    await expect(
      ordersService.updateOrderItemStatus("shop-owner-1", "order-1", "oi-1", "confirmed")
    ).rejects.toThrow("NOT_FOUND");
  });

  it("throws FORBIDDEN when item's shopId does not match caller's shop", async () => {
    vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue({
      ...mockShop,
      id: "shop-other",
    } as never);
    vi.mocked(ordersRepository.findOrderItem).mockResolvedValue(mockOrderItem as never);

    await expect(
      ordersService.updateOrderItemStatus("shop-owner-1", "order-1", "oi-1", "confirmed")
    ).rejects.toThrow("FORBIDDEN");
  });

  it("updates status and returns the full order when ownership is valid", async () => {
    vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(mockShop as never);
    vi.mocked(ordersRepository.findOrderItem).mockResolvedValue(mockOrderItem as never);
    vi.mocked(ordersRepository.updateOrderItemStatus).mockResolvedValue({
      ...mockOrderItem,
      status: "confirmed",
    } as never);
    vi.mocked(ordersRepository.findOrderById).mockResolvedValue(mockOrderWithItems as never);

    await ordersService.updateOrderItemStatus("shop-owner-1", "order-1", "oi-1", "confirmed");

    expect(ordersRepository.updateOrderItemStatus).toHaveBeenCalledWith("oi-1", "confirmed");
  });
});
