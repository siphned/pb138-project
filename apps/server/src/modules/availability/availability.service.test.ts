import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./availability.repository", () => ({
  availabilityRepository: {
    findShopById: vi.fn(),
    findRegularByShopId: vi.fn(),
    findExceptionsByShopId: vi.fn(),
    findRegularById: vi.fn(),
    findExceptionById: vi.fn(),
    insertRegular: vi.fn(),
    insertException: vi.fn(),
    deleteRegular: vi.fn(),
    deleteException: vi.fn(),
  },
}));

import { availabilityRepository } from "./availability.repository";
import { availabilityService } from "./availability.service";

const ownerId = "11111111-1111-1111-1111-111111111111";
const _otherId = "22222222-2222-2222-2222-222222222222";
const shopId = "33333333-3333-3333-3333-333333333333";
const entryId = "44444444-4444-4444-4444-444444444444";

const mockShop = { id: shopId, ownerUserId: ownerId, deletedAt: null } as never;
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
        startTime: "09:00",
        endTime: "17:00",
        validFrom: "2026-01-01",
        type: "open",
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
  });
});
