import { beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD
import * as winemakersRepo from "./winemakers.repository";

vi.mock("./winemakers.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./winemakers.repository")>();
  return {
    ...actual,
=======

vi.mock("./winemakers.repository", () => ({
  winemakersRepository: {
>>>>>>> origin/main
    findAll: vi.fn(),
    findById: vi.fn(),
    findByIdWithAddress: vi.fn(),
    findByUserId: vi.fn(),
    findEventsByWinemakerId: vi.fn(),
    findWinesByWinemakerId: vi.fn(),
    updateById: vi.fn(),
<<<<<<< HEAD
  };
});

=======
  },
}));

import { winemakersRepository } from "./winemakers.repository";
>>>>>>> origin/main
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
<<<<<<< HEAD
    vi.mocked(winemakersRepo.findAll).mockResolvedValue([mockWinemakerWithAddress] as never);
=======
    vi.mocked(winemakersRepository.findAll).mockResolvedValue([mockWinemakerWithAddress] as never);
>>>>>>> origin/main

    const result = await winemakersService.listWinemakers();

    expect(result).toEqual([mockWinemakerWithAddress]);
<<<<<<< HEAD
    expect(winemakersRepo.findAll).toHaveBeenCalledWith(expect.anything(), expect.any(Object));
=======
    expect(winemakersRepository.findAll).toHaveBeenCalledOnce();
>>>>>>> origin/main
  });
});

describe("getWinemaker", () => {
  it("returns winemaker with wines and events", async () => {
<<<<<<< HEAD
    vi.mocked(winemakersRepo.findById).mockResolvedValue(mockWinemakerWithRelations as never);
=======
    vi.mocked(winemakersRepository.findById).mockResolvedValue(mockWinemakerWithRelations as never);
>>>>>>> origin/main

    const result = await winemakersService.getWinemaker(winemakerId);

    expect(result).toEqual(mockWinemakerWithRelations);
<<<<<<< HEAD
    expect(winemakersRepo.findById).toHaveBeenCalledWith(expect.anything(), winemakerId);
  });

  it("throws NOT_FOUND when winemaker does not exist", async () => {
    vi.mocked(winemakersRepo.findById).mockResolvedValue(undefined);

    await expect(winemakersService.getWinemaker(winemakerId)).rejects.toThrow(
      "Winemaker profile not found for this user"
    );
=======
  });

  it("throws NOT_FOUND when winemaker does not exist", async () => {
    vi.mocked(winemakersRepository.findById).mockResolvedValue(undefined);

    await expect(winemakersService.getWinemaker(winemakerId)).rejects.toThrow("NOT_FOUND");
>>>>>>> origin/main
  });
});

describe("updateMyProfile", () => {
  it("updates profile fields and re-fetches with address", async () => {
    const updated = { ...mockWinemakerWithAddress, name: "New Name" };
<<<<<<< HEAD
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
=======
    vi.mocked(winemakersRepository.findByUserId).mockResolvedValue(mockWinemaker as never);
    vi.mocked(winemakersRepository.updateById).mockResolvedValue({
      ...mockWinemaker,
      name: "New Name",
    } as never);
    vi.mocked(winemakersRepository.findByIdWithAddress).mockResolvedValue(updated as never);

    await winemakersService.updateMyProfile(userId, { name: "New Name" });

    expect(winemakersRepository.updateById).toHaveBeenCalledWith(winemakerId, { name: "New Name" });
    expect(winemakersRepository.findByIdWithAddress).toHaveBeenCalledWith(winemakerId);
  });

  it("throws NOT_FOUND when winemaker profile does not exist", async () => {
    vi.mocked(winemakersRepository.findByUserId).mockResolvedValue(undefined);

    await expect(winemakersService.updateMyProfile(userId, { name: "X" })).rejects.toThrow(
      "NOT_FOUND"
    );
    expect(winemakersRepository.updateById).not.toHaveBeenCalled();
>>>>>>> origin/main
  });
});

describe("getWinemakerWines", () => {
  it("returns wines for the given winemaker", async () => {
<<<<<<< HEAD
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
=======
    vi.mocked(winemakersRepository.findById).mockResolvedValue(mockWinemakerWithRelations as never);
    vi.mocked(winemakersRepository.findWinesByWinemakerId).mockResolvedValue([] as never);

    await winemakersService.getWinemakerWines(winemakerId);

    expect(winemakersRepository.findWinesByWinemakerId).toHaveBeenCalledWith(winemakerId);
  });

  it("throws NOT_FOUND when winemaker does not exist", async () => {
    vi.mocked(winemakersRepository.findById).mockResolvedValue(undefined);

    await expect(winemakersService.getWinemakerWines(winemakerId)).rejects.toThrow("NOT_FOUND");
>>>>>>> origin/main
  });
});

describe("getWinemakerEvents", () => {
  it("returns events for the given winemaker", async () => {
<<<<<<< HEAD
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
=======
    vi.mocked(winemakersRepository.findById).mockResolvedValue(mockWinemakerWithRelations as never);
    vi.mocked(winemakersRepository.findEventsByWinemakerId).mockResolvedValue([] as never);

    await winemakersService.getWinemakerEvents(winemakerId);

    expect(winemakersRepository.findEventsByWinemakerId).toHaveBeenCalledWith(winemakerId);
  });

  it("throws NOT_FOUND when winemaker does not exist", async () => {
    vi.mocked(winemakersRepository.findById).mockResolvedValue(undefined);

    await expect(winemakersService.getWinemakerEvents(winemakerId)).rejects.toThrow("NOT_FOUND");
>>>>>>> origin/main
  });
});
