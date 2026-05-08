import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";

vi.mock("../../db", () => ({
  db: {
    transaction: vi.fn(),
  },
}));

vi.mock("./wines.repository", () => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  findWinemakerByUserId: vi.fn(),
  insert: vi.fn(),
  softDelete: vi.fn(),
  updateById: vi.fn(),
}));

import * as winesRepo from "./wines.repository";
import { winesService } from "./wines.service";

const userId = "11111111-1111-1111-1111-111111111111";
const otherUserId = "22222222-2222-2222-2222-222222222222";
const winemakerId = "33333333-3333-3333-3333-333333333333";
const otherWinemakerId = "44444444-4444-4444-4444-444444444444";
const wineId = "55555555-5555-5555-5555-555555555555";

const mockWinemaker = {
  addressId: "66666666-6666-6666-6666-666666666666",
  createdAt: new Date(),
  deletedAt: null,
  description: "A winery",
  email: "test@winery.com",
  id: winemakerId,
  name: "Test Winery",
  phone: "+420123456789",
  updatedAt: null,
  userId,
  websiteUrl: null,
};

const wineData = {
  alcoholContent: "13.50",
  attribution: "Estate grown",
  color: "red" as const,
  composition: "100% Pinot Noir",
  description: "A fine red wine",
  name: "Pinot Noir",
  quantity: 100,
  region: "Burgundy",
  type: "still" as const,
  vintageYear: 2020,
  volumeMl: 750,
};

const mockWine = {
  createdAt: new Date(),
  deletedAt: null,
  id: wineId,
  updatedAt: new Date(),
  winemaker: { id: winemakerId, name: "Test Winery" },
  winemakerId,
  ...wineData,
};

beforeEach(() => vi.clearAllMocks());

describe("createWine", () => {
  it("resolves winemaker from userId and inserts wine", async () => {
    vi.mocked(winesRepo.findWinemakerByUserId).mockResolvedValue(mockWinemaker as never);
    vi.mocked(winesRepo.insert).mockResolvedValue(mockWine as never);
    vi.mocked(winesRepo.findById).mockResolvedValue(mockWine as never);

    await winesService.createWine(userId, wineData);

    expect(winesRepo.findWinemakerByUserId).toHaveBeenCalledWith(db, userId);
    expect(winesRepo.insert).toHaveBeenCalledWith(db, winemakerId, wineData);
  });

  it("throws WinemakerNotFoundError when winemaker record does not exist", async () => {
    vi.mocked(winesRepo.findWinemakerByUserId).mockResolvedValue(undefined);

    await expect(winesService.createWine(userId, wineData)).rejects.toThrow(
      "Winemaker profile not found"
    );
    expect(winesRepo.insert).not.toHaveBeenCalled();
  });
});

describe("getWine", () => {
  it("returns wine when found", async () => {
    vi.mocked(winesRepo.findById).mockResolvedValue(mockWine as never);

    const result = await winesService.getWine(wineId);

    expect(result).toEqual(mockWine);
  });

  it("throws WineNotFoundError when wine does not exist", async () => {
    vi.mocked(winesRepo.findById).mockResolvedValue(undefined);

    await expect(winesService.getWine(wineId)).rejects.toThrow("Wine with ID");
  });
});

describe("replaceWine", () => {
  it("allows admin to update any wine without ownership check", async () => {
    vi.mocked(winesRepo.findById).mockResolvedValue(mockWine as never);
    vi.mocked(winesRepo.updateById).mockResolvedValue(mockWine as never);

    await winesService.replaceWine(wineId, otherUserId, ["admin"], wineData);

    expect(winesRepo.findWinemakerByUserId).not.toHaveBeenCalled();
    expect(winesRepo.updateById).toHaveBeenCalledWith(db, wineId, wineData);
  });

  it("allows winemaker to update own wine", async () => {
    vi.mocked(winesRepo.findById)
      .mockResolvedValueOnce(mockWine as never) // ownership check
      .mockResolvedValueOnce(mockWine as never); // re-fetch after update
    vi.mocked(winesRepo.findWinemakerByUserId).mockResolvedValue(mockWinemaker as never);
    vi.mocked(winesRepo.updateById).mockResolvedValue(mockWine as never);

    await winesService.replaceWine(wineId, userId, ["customer"], wineData);

    expect(winesRepo.updateById).toHaveBeenCalledWith(db, wineId, wineData);
  });

  it("throws ForbiddenWineActionError when winemaker tries to update another winemakers wine", async () => {
    const otherWine = { ...mockWine, winemakerId: otherWinemakerId };
    vi.mocked(winesRepo.findById).mockResolvedValue(otherWine as never);
    vi.mocked(winesRepo.findWinemakerByUserId).mockResolvedValue(mockWinemaker as never);

    await expect(winesService.replaceWine(wineId, userId, ["customer"], wineData)).rejects.toThrow(
      "permission"
    );
    expect(winesRepo.updateById).not.toHaveBeenCalled();
  });
});

describe("deleteWine", () => {
  it("soft deletes own wine", async () => {
    vi.mocked(winesRepo.findById).mockResolvedValue(mockWine as never);
    vi.mocked(winesRepo.findWinemakerByUserId).mockResolvedValue(mockWinemaker as never);

    await winesService.deleteWine(wineId, userId, ["customer"]);

    expect(winesRepo.softDelete).toHaveBeenCalledWith(db, wineId);
  });

  it("allows admin to delete any wine", async () => {
    vi.mocked(winesRepo.findById).mockResolvedValue(mockWine as never);

    await winesService.deleteWine(wineId, otherUserId, ["admin"]);

    expect(winesRepo.findWinemakerByUserId).not.toHaveBeenCalled();
    expect(winesRepo.softDelete).toHaveBeenCalledWith(db, wineId);
  });
});

describe("listWines", () => {
  it("delegates to repository with filters", async () => {
    vi.mocked(winesRepo.findAll).mockResolvedValue([mockWine] as never);

    const result = await winesService.listWines({ region: "Burgundy", type: "still" });

    expect(winesRepo.findAll).toHaveBeenCalledWith(db, { region: "Burgundy", type: "still" });
    expect(result).toEqual([mockWine]);
  });
});
