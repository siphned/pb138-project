import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./shops.repository", () => ({
  shopsRepository: {
    createShopWithAddress: vi.fn(),
    findAll: vi.fn(),
    findAllByOwnerUserId: vi.fn(),
    findById: vi.fn(),
    findByOwnerUserId: vi.fn(),
    insertAddress: vi.fn(),
    updateById: vi.fn(),
  },
}));

import { shopsRepository } from "./shops.repository";
import { shopsService } from "./shops.service";

const ownerId = "11111111-1111-1111-1111-111111111111";
const otherId = "22222222-2222-2222-2222-222222222222";
const shopId = "33333333-3333-3333-3333-333333333333";
const addressId = "44444444-4444-4444-4444-444444444444";
const newAddressId = "55555555-5555-5555-5555-555555555555";

const mockAddress = {
  city: "Brno",
  country: "CZ",
  createdAt: new Date(),
  deletedAt: null,
  houseNumber: "1",
  id: addressId,
  postalCode: "60200",
  street: "Masarykova",
  updatedAt: null,
};

const mockShop = {
  address: { city: "B", country: "CZ", houseNumber: "1", postalCode: "1", street: "S" },
  addressId,
  createdAt: new Date(),
  deletedAt: null,
  description: "A description",
  id: shopId,
  name: "Test Shop",
  ownerUserId: ownerId,
  updatedAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createShop", () => {
  it("creates a shop when user has no existing shop", async () => {
    vi.mocked(shopsRepository.findByOwnerUserId).mockResolvedValue(undefined);
    vi.mocked(shopsRepository.createShopWithAddress).mockResolvedValue(mockShop as never);
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop as never);

    await shopsService.createShop(ownerId, {
      address: {
        city: "Brno",
        country: "CZ",
        houseNumber: "1",
        postalCode: "60200",
        street: "Masarykova",
      },
      description: "A description",
      name: "Test Shop",
    });

    expect(shopsRepository.createShopWithAddress).toHaveBeenCalledWith(
      { description: "A description", name: "Test Shop", ownerUserId: ownerId },
      { city: "Brno", country: "CZ", houseNumber: "1", postalCode: "60200", street: "Masarykova" }
    );
  });

  it("allows creating multiple shops for the same user", async () => {
    vi.mocked(shopsRepository.findAllByOwnerUserId).mockResolvedValue([mockShop] as never);
    vi.mocked(shopsRepository.createShopWithAddress).mockResolvedValue({
      id: "new-shop-id",
    } as never);
    vi.mocked(shopsRepository.findById).mockResolvedValue({ id: "new-shop-id" } as never);

    const result = await shopsService.createShop(ownerId, {
      address: {
        city: "Brno",
        country: "CZ",
        houseNumber: "1",
        postalCode: "60200",
        street: "Masarykova",
      },
      description: "Another one",
      name: "Second Shop",
    });

    expect(result.id).toBe("new-shop-id");
    expect(shopsRepository.createShopWithAddress).toHaveBeenCalled();
  });
});

describe("updateShop", () => {
  it("updates shop fields when caller is the owner", async () => {
    const updatedShop = { ...mockShop, name: "New Name" };
    vi.mocked(shopsRepository.findById)
      .mockResolvedValueOnce(mockShop as never) // ownership check
      .mockResolvedValueOnce(updatedShop as never); // re-fetch after update
    vi.mocked(shopsRepository.updateById).mockResolvedValue(updatedShop as never);

    await shopsService.updateShop(shopId, ownerId, { name: "New Name" });

    expect(shopsRepository.updateById).toHaveBeenCalledWith(shopId, { name: "New Name" });
  });

  it("throws FORBIDDEN when caller does not own the shop", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop as never);

    await expect(shopsService.updateShop(shopId, otherId, { name: "Hack" })).rejects.toThrow(
      "FORBIDDEN"
    );
    expect(shopsRepository.updateById).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND when shop does not exist", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(undefined);

    await expect(shopsService.updateShop(shopId, ownerId, { name: "X" })).rejects.toThrow(
      "NOT_FOUND"
    );
  });

  it("creates a new address row and relinks shop when address is updated", async () => {
    const updatedShop = { ...mockShop, addressId: newAddressId };
    vi.mocked(shopsRepository.findById)
      .mockResolvedValueOnce(mockShop as never) // ownership check
      .mockResolvedValueOnce(updatedShop as never); // re-fetch after update
    vi.mocked(shopsRepository.insertAddress).mockResolvedValue({
      ...mockAddress,
      id: newAddressId,
    } as never);
    vi.mocked(shopsRepository.updateById).mockResolvedValue(updatedShop as never);

    await shopsService.updateShop(shopId, ownerId, {
      address: { city: "Prague" },
    });

    expect(shopsRepository.insertAddress).toHaveBeenCalledWith({
      city: "Prague",
      country: "CZ",
      houseNumber: "1",
      postalCode: "1",
      street: "S",
    });
    expect(shopsRepository.updateById).toHaveBeenCalledWith(shopId, { addressId: newAddressId });
  });
});

describe("getShop", () => {
  it("returns shop when found", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(mockShop as never);
    const result = await shopsService.getShop(shopId);
    expect(result).toEqual(mockShop);
  });

  it("throws NOT_FOUND when shop not found", async () => {
    vi.mocked(shopsRepository.findById).mockResolvedValue(undefined);
    await expect(shopsService.getShop(shopId)).rejects.toThrow("NOT_FOUND");
  });
});

describe("listShops", () => {
  it("returns all shops", async () => {
    vi.mocked(shopsRepository.findAll).mockResolvedValue([mockShop] as never);
    const result = await shopsService.listShops();
    expect(result).toHaveLength(1);
    expect(shopsRepository.findAll).toHaveBeenCalled();
  });
});

describe("listMyShops", () => {
  it("returns shops for owner", async () => {
    vi.mocked(shopsRepository.findAllByOwnerUserId).mockResolvedValue([mockShop] as never);
    const result = await shopsService.listMyShops(ownerId);
    expect(result).toHaveLength(1);
    expect(shopsRepository.findAllByOwnerUserId).toHaveBeenCalledWith(ownerId);
  });
});
