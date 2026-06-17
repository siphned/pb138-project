import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as shopsRepo from "./shops.repository";
import { shopsService } from "./shops.service";

vi.mock("./shops.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./shops.repository")>();
  return {
    ...actual,
    createShop: vi.fn(),
    findAll: vi.fn(),
    findAllByOwnerUserId: vi.fn(),
    findById: vi.fn(),
    insertAddress: vi.fn(),
    updateById: vi.fn(),
  };
});

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

const ownerId = "11111111-1111-1111-1111-111111111111";
const shopId = "33333333-3333-3333-3333-333333333333";

const mockShop = {
  address: { city: "B", country: "CZ", houseNumber: "1", postalCode: "1", street: "S" },
  id: shopId,
  name: "Test Shop",
  ownerUserId: ownerId,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createShop", () => {
  it("creates a shop", async () => {
    vi.mocked(shopsRepo.insertAddress).mockResolvedValue({ id: "a1" } as any);
    vi.mocked(shopsRepo.createShop).mockResolvedValue({ id: shopId } as any);
    vi.mocked(shopsRepo.findById).mockResolvedValue(mockShop as any);

    const result = await shopsService.createShop(ownerId, {
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

    expect(result.id).toBe(shopId);
    expect(shopsRepo.createShop).toHaveBeenCalled();
  });
});

describe("updateShop", () => {
  it("updates shop fields when caller is the owner", async () => {
    vi.mocked(shopsRepo.findById).mockResolvedValue(mockShop as any);
    vi.mocked(shopsRepo.updateById).mockResolvedValue(mockShop as any);

    await shopsService.updateShop(shopId, ownerId, { name: "New Name" });

    expect(shopsRepo.updateById).toHaveBeenCalledWith(db, shopId, { name: "New Name" });
  });
});
