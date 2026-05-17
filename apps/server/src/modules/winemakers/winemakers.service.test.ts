import { beforeEach, describe, expect, it, vi } from "vitest";
import * as winemakersRepo from "./winemakers.repository";

vi.mock("./winemakers.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./winemakers.repository")>();
  return {
    ...actual,
    findAll: vi.fn(),
    findById: vi.fn(),
    findByIdWithAddress: vi.fn(),
    findByUserId: vi.fn(),
    findEventsByWinemakerId: vi.fn(),
    findWinesByWinemakerId: vi.fn(),
    updateById: vi.fn(),
  };
});

import { winemakersService } from "./winemakers.service";

const userId = "11111111-1111-1111-1111-111111111111";
const winemakerId = "22222222-2222-2222-2222-222222222222";
const addressId = "33333333-3333-3333-3333-333333333333";

const mockWinemaker = {
  addressId,
  createdAt: new Date(),
  deletedAt: null,
  description: "A winery",
  email: "wine@test.com",
  id: winemakerId,
  name: "Test Winery",
  phone: "+420123456789",
  updatedAt: null,
  userId,
  websiteUrl: null,
};

const mockWinemakerWithAddress = {
  ...mockWinemaker,
  address: { city: "B", country: "CZ", houseNumber: "1", postalCode: "1", street: "S" },
};

const mockWinemakerWithRelations = {
  ...mockWinemakerWithAddress,
  events: [],
  wines: [],
};

beforeEach(() => vi.clearAllMocks());

describe("listWinemakers", () => {
  it("returns all winemakers from repository", async () => {
    vi.mocked(winemakersRepo.findAll).mockResolvedValue([mockWinemakerWithAddress] as never);

    const result = await winemakersService.listWinemakers();

    expect(result).toEqual([mockWinemakerWithAddress]);
    expect(winemakersRepo.findAll).toHaveBeenCalledWith(expect.anything(), expect.any(Object));
  });
});

describe("getWinemaker", () => {
  it("returns winemaker with wines and events", async () => {
    vi.mocked(winemakersRepo.findById).mockResolvedValue(mockWinemakerWithRelations as never);

    const result = await winemakersService.getWinemaker(winemakerId);

    expect(result).toEqual(mockWinemakerWithRelations);
    expect(winemakersRepo.findById).toHaveBeenCalledWith(expect.anything(), winemakerId);
  });

  it("throws NOT_FOUND when winemaker does not exist", async () => {
    vi.mocked(winemakersRepo.findById).mockResolvedValue(undefined);

    await expect(winemakersService.getWinemaker(winemakerId)).rejects.toThrow(
      "Winemaker profile not found for this user"
    );
  });
});

describe("updateMyProfile", () => {
  it("updates profile fields and re-fetches with address", async () => {
    const updated = { ...mockWinemakerWithAddress, name: "New Name" };
    vi.mocked(winemakersRepo.findByUserId).mockResolvedValue(mockWinemaker as never);
    vi.mocked(winemakersRepo.updateById).mockResolvedValue({
      ...mockWinemaker,
      name: "New Name",
    } as never);
    vi.mocked(winemakersRepo.findByIdWithAddress).mockResolvedValue(updated as never);

    await winemakersService.updateMyProfile(userId, { name: "New Name" });

    expect(winemakersRepo.updateById).toHaveBeenCalledWith(expect.anything(), winemakerId, {
      name: "New Name",
    });
    expect(winemakersRepo.findByIdWithAddress).toHaveBeenCalledWith(expect.anything(), winemakerId);
  });

  it("throws NOT_FOUND when winemaker profile does not exist", async () => {
    vi.mocked(winemakersRepo.findByUserId).mockResolvedValue(undefined);

    await expect(winemakersService.updateMyProfile(userId, { name: "X" })).rejects.toThrow(
      "Winemaker profile not found for this user"
    );
    expect(winemakersRepo.updateById).not.toHaveBeenCalled();
  });
});

describe("getWinemakerWines", () => {
  it("returns wines for the given winemaker", async () => {
    vi.mocked(winemakersRepo.findById).mockResolvedValue(mockWinemakerWithRelations as never);
    vi.mocked(winemakersRepo.findWinesByWinemakerId).mockResolvedValue([] as never);

    await winemakersService.getWinemakerWines(winemakerId);

    expect(winemakersRepo.findWinesByWinemakerId).toHaveBeenCalledWith(
      expect.anything(),
      winemakerId
    );
  });

  it("throws NOT_FOUND when winemaker does not exist", async () => {
    vi.mocked(winemakersRepo.findById).mockResolvedValue(undefined);

    await expect(winemakersService.getWinemakerWines(winemakerId)).rejects.toThrow(
      "Winemaker profile not found for this user"
    );
  });
});

describe("getWinemakerEvents", () => {
  it("returns events for the given winemaker", async () => {
    vi.mocked(winemakersRepo.findById).mockResolvedValue(mockWinemakerWithRelations as never);
    vi.mocked(winemakersRepo.findEventsByWinemakerId).mockResolvedValue([] as never);

    await winemakersService.getWinemakerEvents(winemakerId);

    expect(winemakersRepo.findEventsByWinemakerId).toHaveBeenCalledWith(
      expect.anything(),
      winemakerId
    );
  });

  it("throws NOT_FOUND when winemaker does not exist", async () => {
    vi.mocked(winemakersRepo.findById).mockResolvedValue(undefined);

    await expect(winemakersService.getWinemakerEvents(winemakerId)).rejects.toThrow(
      "Winemaker profile not found for this user"
    );
  });
});
