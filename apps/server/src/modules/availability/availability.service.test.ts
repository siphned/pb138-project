import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as availabilityRepo from "./availability.repository";
import { availabilityService } from "./availability.service";

vi.mock("./availability.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./availability.repository")>();
  return {
    ...actual,
    deleteException: vi.fn(),
    deleteRegular: vi.fn(),
    findExceptionById: vi.fn(),
    findExceptionsByShopId: vi.fn(),
    findRegularById: vi.fn(),
    findRegularByShopId: vi.fn(),
    findShopById: vi.fn(),
    insertException: vi.fn(),
    insertRegular: vi.fn(),
  };
});

const ownerId = "11111111-1111-1111-1111-111111111111";
const shopId = "33333333-3333-3333-3333-333333333333";
const entryId = "44444444-4444-4444-4444-444444444444";

const mockShop = { deletedAt: null, id: shopId, ownerUserId: ownerId } as any;
const mockRegular = { id: entryId, shopId } as any;
const mockException = { id: entryId, shopId } as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("availabilityService", () => {
  describe("addRegular", () => {
    it("adds regular hours successfully for own shop", async () => {
      vi.mocked(availabilityRepo.findShopById).mockResolvedValue(mockShop);
      vi.mocked(availabilityRepo.insertRegular).mockResolvedValue(mockRegular);

      await availabilityService.addRegular(shopId, ownerId, {
        dow: 1,
        endTime: "17:00",
        startTime: "09:00",
        type: "open",
        validFrom: "2026-01-01",
      });

      expect(availabilityRepo.insertRegular).toHaveBeenCalledWith(db, expect.any(Object));
    });
  });

  describe("getAvailability", () => {
    it("returns regular and exceptions for a shop", async () => {
      vi.mocked(availabilityRepo.findShopById).mockResolvedValue(mockShop);
      vi.mocked(availabilityRepo.findRegularByShopId).mockResolvedValue([mockRegular]);
      vi.mocked(availabilityRepo.findExceptionsByShopId).mockResolvedValue([mockException]);

      const result = await availabilityService.getAvailability(shopId);

      expect(result.regular).toHaveLength(1);
      expect(result.exceptions).toHaveLength(1);
    });
  });

  describe("deleteRegular", () => {
    it("removes regular entry for own shop", async () => {
      vi.mocked(availabilityRepo.findShopById).mockResolvedValue(mockShop);
      vi.mocked(availabilityRepo.findRegularById).mockResolvedValue(mockRegular);

      await availabilityService.deleteRegular(shopId, entryId, ownerId);

      expect(availabilityRepo.deleteRegular).toHaveBeenCalledWith(db, entryId);
    });

    it("throws NOT_FOUND if shop doesn't exist", async () => {
      vi.mocked(availabilityRepo.findShopById).mockResolvedValue(undefined);
      await expect(availabilityService.deleteRegular(shopId, entryId, ownerId)).rejects.toThrow(
        /NOT_FOUND|not found/i
      );
    });

    it("throws FORBIDDEN if user doesn't own the shop", async () => {
      vi.mocked(availabilityRepo.findShopById).mockResolvedValue(mockShop);
      await expect(
        availabilityService.deleteRegular(shopId, entryId, "wrong-owner")
      ).rejects.toThrow(/FORBIDDEN|permission/i);
    });

    it("throws NOT_FOUND if entry doesn't exist", async () => {
      vi.mocked(availabilityRepo.findShopById).mockResolvedValue(mockShop);
      vi.mocked(availabilityRepo.findRegularById).mockResolvedValue(undefined);
      await expect(availabilityService.deleteRegular(shopId, entryId, ownerId)).rejects.toThrow(
        /NOT_FOUND|not found/i
      );
    });
  });
});
