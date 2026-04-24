import { describe, it, expect, beforeEach, vi } from "vitest";

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

import { availabilityService } from "./availability.service";
import { availabilityRepository } from "./availability.repository";

const ownerId = "11111111-1111-1111-1111-111111111111";
const otherId = "22222222-2222-2222-2222-222222222222";
const shopId = "33333333-3333-3333-3333-333333333333";
const entryId = "44444444-4444-4444-4444-444444444444";

const mockShop = { id: shopId, ownerUserId: ownerId, deletedAt: null } as never;
const mockRegular = { id: entryId, shopId } as never;
const mockException = { id: entryId, shopId } as never;

beforeEach(() => {
  vi.clearAllMocks();
});

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

    expect(availabilityRepository.insertRegular).toHaveBeenCalledWith(
      expect.objectContaining({ shopId, dow: 1, type: "open" })
    );
  });

  it("throws FORBIDDEN when caller does not own the shop", async () => {
    vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);

    await expect(
      availabilityService.addRegular(shopId, otherId, {
        dow: 1,
        startTime: "09:00",
        endTime: "17:00",
        validFrom: "2026-01-01",
        type: "open",
      })
    ).rejects.toThrow("FORBIDDEN");

    expect(availabilityRepository.insertRegular).not.toHaveBeenCalled();
  });

  it("throws INVALID_TIME_RANGE when endTime <= startTime", async () => {
    vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);

    await expect(
      availabilityService.addRegular(shopId, ownerId, {
        dow: 1,
        startTime: "17:00",
        endTime: "09:00",
        validFrom: "2026-01-01",
        type: "open",
      })
    ).rejects.toThrow("INVALID_TIME_RANGE");
  });

  it("throws INVALID_TIME_RANGE when validTo is not after validFrom", async () => {
    vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);

    await expect(
      availabilityService.addRegular(shopId, ownerId, {
        dow: 1,
        startTime: "09:00",
        endTime: "17:00",
        validFrom: "2026-06-01",
        validTo: "2026-05-01",
        type: "open",
      })
    ).rejects.toThrow("INVALID_TIME_RANGE");
  });
});

describe("addException", () => {
  it("adds exception successfully for own shop", async () => {
    vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);
    vi.mocked(availabilityRepository.insertException).mockResolvedValue(mockException);

    await availabilityService.addException(shopId, ownerId, {
      startsAt: "2026-12-24T08:00:00Z",
      endsAt: "2026-12-24T20:00:00Z",
      action: "closed",
      reason: "Christmas Eve",
    });

    expect(availabilityRepository.insertException).toHaveBeenCalledWith(
      expect.objectContaining({ shopId, action: "closed" })
    );
  });

  it("throws INVALID_TIME_RANGE when endsAt <= startsAt", async () => {
    vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);

    await expect(
      availabilityService.addException(shopId, ownerId, {
        startsAt: "2026-12-25T20:00:00Z",
        endsAt: "2026-12-25T08:00:00Z",
        action: "closed",
      })
    ).rejects.toThrow("INVALID_TIME_RANGE");
  });
});

describe("deleteRegular", () => {
  it("removes regular entry for own shop", async () => {
    vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);
    vi.mocked(availabilityRepository.findRegularById).mockResolvedValue(mockRegular);

    await availabilityService.deleteRegular(shopId, entryId, ownerId);

    expect(availabilityRepository.deleteRegular).toHaveBeenCalledWith(entryId);
  });

  it("throws FORBIDDEN on removal when caller does not own the shop", async () => {
    vi.mocked(availabilityRepository.findShopById).mockResolvedValue(mockShop);

    await expect(availabilityService.deleteRegular(shopId, entryId, otherId)).rejects.toThrow(
      "FORBIDDEN"
    );

    expect(availabilityRepository.deleteRegular).not.toHaveBeenCalled();
  });
});
