import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./supply-agreements.repository", () => ({
  supplyAgreementsRepository: {
    findById: vi.fn(),
    findByShopAndWinemaker: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    listForShop: vi.fn(),
    listForWinemaker: vi.fn(),
  },
}));

vi.mock("../shops/shops.repository", () => ({
  shopsRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("../winemakers/winemakers.repository", () => ({
  winemakersRepository: {
    findById: vi.fn(),
    findByUserId: vi.fn(),
  },
}));

import { supplyAgreementsRepository } from "./supply-agreements.repository";
import { shopsRepository } from "../shops/shops.repository";
import { winemakersRepository } from "../winemakers/winemakers.repository";
import { supplyAgreementsService } from "./supply-agreements.service";

describe("supplyAgreementsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRequest", () => {
    it("creates a new request if all checks pass", async () => {
      vi.mocked(shopsRepository.findById).mockResolvedValue({
        id: "shop-1",
        ownerUserId: "user-1",
      } as never);
      vi.mocked(supplyAgreementsRepository.findByShopAndWinemaker).mockResolvedValue(undefined);
      vi.mocked(supplyAgreementsRepository.create).mockResolvedValue({ id: "agreement-1" } as never);

      const result = await supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1");

      expect(result.id).toBe("agreement-1");
      expect(supplyAgreementsRepository.create).toHaveBeenCalledWith({
        shopId: "shop-1",
        winemakerId: "winemaker-1",
      });
    });

    it("returns existing agreement if it already exists", async () => {
      vi.mocked(shopsRepository.findById).mockResolvedValue({
        id: "shop-1",
        ownerUserId: "user-1",
      } as never);
      const existing = { id: "existing-1", status: "pending" };
      vi.mocked(supplyAgreementsRepository.findByShopAndWinemaker).mockResolvedValue(
        existing as never
      );

      const result = await supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1");

      expect(result).toBe(existing);
      expect(supplyAgreementsRepository.create).not.toHaveBeenCalled();
    });

    it("returns existing agreement even if rejected", async () => {
      vi.mocked(shopsRepository.findById).mockResolvedValue({
        id: "shop-1",
        ownerUserId: "user-1",
      } as never);
      const existing = { id: "existing-1", status: "rejected" };
      vi.mocked(supplyAgreementsRepository.findByShopAndWinemaker).mockResolvedValue(
        existing as never
      );

      const result = await supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1");

      expect(result).toBe(existing);
    });

    it("throws FORBIDDEN if user doesn't own the shop", async () => {
      vi.mocked(shopsRepository.findById).mockResolvedValue({
        id: "shop-1",
        ownerUserId: "user-other",
      } as never);

      await expect(
        supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1")
      ).rejects.toThrow("FORBIDDEN");
    });

    it("throws FORBIDDEN if shop does not exist", async () => {
      vi.mocked(shopsRepository.findById).mockResolvedValue(undefined);

      await expect(
        supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1")
      ).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("respondToRequest", () => {
    it("approves a request if user is the winemaker", async () => {
      const mockAgreement = { id: "agreement-1", winemakerId: "winemaker-1", status: "pending" };
      vi.mocked(supplyAgreementsRepository.findById).mockResolvedValue(mockAgreement as never);
      vi.mocked(winemakersRepository.findById).mockResolvedValue({
        id: "winemaker-1",
        userId: "user-wm",
      } as never);
      vi.mocked(supplyAgreementsRepository.updateStatus).mockResolvedValue({
        ...mockAgreement,
        status: "approved",
      } as never);

      const result = await supplyAgreementsService.respondToRequest(
        "user-wm",
        "agreement-1",
        "approved"
      );

      expect(result.status).toBe("approved");
      expect(supplyAgreementsRepository.updateStatus).toHaveBeenCalledWith(
        "agreement-1",
        "approved"
      );
    });

    it("throws NOT_FOUND if agreement doesn't exist", async () => {
      vi.mocked(supplyAgreementsRepository.findById).mockResolvedValue(undefined);

      await expect(
        supplyAgreementsService.respondToRequest("user-wm", "a1", "approved")
      ).rejects.toThrow("NOT_FOUND");
    });

    it("throws FORBIDDEN if user is not the winemaker of the agreement", async () => {
      vi.mocked(supplyAgreementsRepository.findById).mockResolvedValue({
        id: "a1",
        winemakerId: "wm1",
        status: "pending",
      } as never);
      vi.mocked(winemakersRepository.findById).mockResolvedValue({
        id: "wm1",
        userId: "other-user",
      } as never);

      await expect(
        supplyAgreementsService.respondToRequest("user-wm", "a1", "approved")
      ).rejects.toThrow("FORBIDDEN");
    });

    it("throws ALREADY_RESPONDED if status is not pending", async () => {
      vi.mocked(supplyAgreementsRepository.findById).mockResolvedValue({
        id: "a1",
        winemakerId: "wm1",
        status: "approved",
      } as never);
      vi.mocked(winemakersRepository.findById).mockResolvedValue({
        id: "wm1",
        userId: "user-wm",
      } as never);

      await expect(
        supplyAgreementsService.respondToRequest("user-wm", "a1", "rejected")
      ).rejects.toThrow("ALREADY_RESPONDED");
    });
  });

  describe("listForShop", () => {
    it("lists agreements for a shop if owner", async () => {
      vi.mocked(shopsRepository.findById).mockResolvedValue({
        id: "s1",
        ownerUserId: "u1",
      } as never);
      const mockList = [{ id: "a1" }];
      vi.mocked(supplyAgreementsRepository.listForShop).mockResolvedValue(mockList as never);

      const result = await supplyAgreementsService.listForShop("u1", "s1");

      expect(result).toBe(mockList);
    });

    it("throws FORBIDDEN if not the shop owner", async () => {
      vi.mocked(shopsRepository.findById).mockResolvedValue({
        id: "s1",
        ownerUserId: "other",
      } as never);

      await expect(supplyAgreementsService.listForShop("u1", "s1")).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("listForWinemaker", () => {
    it("lists agreements for the winemaker", async () => {
      vi.mocked(winemakersRepository.findByUserId).mockResolvedValue({ id: "wm1" } as never);
      const mockList = [{ id: "a1" }];
      vi.mocked(supplyAgreementsRepository.listForWinemaker).mockResolvedValue(mockList as never);

      const result = await supplyAgreementsService.listForWinemaker("u1");

      expect(result).toBe(mockList);
    });

    it("throws NOT_A_WINEMAKER if user has no winemaker profile", async () => {
      vi.mocked(winemakersRepository.findByUserId).mockResolvedValue(undefined);

      await expect(supplyAgreementsService.listForWinemaker("u1")).rejects.toThrow(
        "NOT_A_WINEMAKER"
      );
    });
  });
});
