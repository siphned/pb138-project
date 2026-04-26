import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./availability.repository", () => ({
  availabilityRepository: {
    deleteException: vi.fn(),
    deleteRegular: vi.fn(),
    findExceptionById: vi.fn(),
    findExceptionsByShopId: vi.fn(),
    findRegularById: vi.fn(),
    findRegularByShopId: vi.fn(),
    findShopById: vi.fn(),
    insertException: vi.fn(),
    insertRegular: vi.fn(),
  },
}));

import { availabilityRepository } from "./availability.repository";
import { availabilityService } from "./availability.service";

const ownerId = "11111111-1111-1111-1111-111111111111";
const shopId = "33333333-3333-3333-3333-333333333333";
const entryId = "44444444-4444-4444-4444-444444444444";

const mockShop = { deletedAt: null, id: shopId, ownerUserId: ownerId } as never;
const mockRegular = { id: entryId, shopId } as never;
const mockException = { id: entryId, shopId } as never;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("availabilityService", () => {
  describe("addRegular", () => {
    it("adds regular hours successfully for own shop", async () => {
      vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);
      vi.mocked(availabilityRepository.insertRegular).mockResolvedValue(mockRegular);

      await availabilityService.addRegular(shopId, ownerId, {
        dow: 1,
        endTime: "17:00",
        startTime: "09:00",
        type: "open",
        validFrom: "2026-01-01",
      });

      expect(availabilityRepository.insertRegular).toHaveBeenCalled();
    });
  });

  describe("getAvailability", () => {
    it("returns regular and exceptions for a shop", async () => {
      vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);
      vi.mocked(availabilityRepository.findRegularByShopId).mockResolvedValue([mockRegular]);
      vi.mocked(availabilityRepository.findExceptionsByShopId).mockResolvedValue([mockException]);

      const result = await availabilityService.getAvailability(shopId);

      expect(result.regular).toHaveLength(1);
      expect(result.exceptions).toHaveLength(1);
    });
  });

  describe("deleteRegular", () => {
    it("removes regular entry for own shop", async () => {
      vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);
      vi.mocked(availabilityRepository.findRegularById).mockResolvedValue(mockRegular);

      await availabilityService.deleteRegular(shopId, entryId, ownerId);

      expect(availabilityRepository.deleteRegular).toHaveBeenCalledWith(entryId);
    });

    it("throws NOT_FOUND if shop doesn't exist", async () => {
      vi.mocked(availabilityRepository.findShopById).mockResolvedValue(undefined);
      await expect(availabilityService.deleteRegular(shopId, entryId, ownerId)).rejects.toThrow(
        "NOT_FOUND"
      );
    });

    it("throws FORBIDDEN if user doesn't own the shop", async () => {
      vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);
      await expect(
        availabilityService.deleteRegular(shopId, entryId, "wrong-owner")
      ).rejects.toThrow("FORBIDDEN");
    });

    it("throws NOT_FOUND if entry doesn't exist", async () => {
      vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);
      vi.mocked(availabilityRepository.findRegularById).mockResolvedValue(undefined);
      await expect(availabilityService.deleteRegular(shopId, entryId, ownerId)).rejects.toThrow(
        "NOT_FOUND"
      );
    });
  });
});
