import { beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD
import * as shopsRepo from "../shops/shops.repository";
import * as winemakersRepo from "../winemakers/winemakers.repository";
import * as supplyAgreementsRepo from "./supply-agreements.repository";

vi.mock("./supply-agreements.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./supply-agreements.repository")>();
  return {
    ...actual,
=======

vi.mock("./supply-agreements.repository", () => ({
  supplyAgreementsRepository: {
>>>>>>> origin/main
    create: vi.fn(),
    findById: vi.fn(),
    findByShopAndWinemaker: vi.fn(),
    listForShop: vi.fn(),
    listForWinemaker: vi.fn(),
    updateStatus: vi.fn(),
<<<<<<< HEAD
  };
});

vi.mock("../shops/shops.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../shops/shops.repository")>();
  return {
    ...actual,
    findById: vi.fn(),
  };
});

vi.mock("../winemakers/winemakers.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../winemakers/winemakers.repository")>();
  return {
    ...actual,
    findById: vi.fn(),
    findByUserId: vi.fn(),
  };
});

=======
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

import { shopsRepository } from "../shops/shops.repository";
import { winemakersRepository } from "../winemakers/winemakers.repository";
import { supplyAgreementsRepository } from "./supply-agreements.repository";
>>>>>>> origin/main
import { supplyAgreementsService } from "./supply-agreements.service";

describe("supplyAgreementsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRequest", () => {
    it("creates a new request if all checks pass", async () => {
<<<<<<< HEAD
      vi.mocked(shopsRepo.findById).mockResolvedValue({
        id: "shop-1",
        ownerUserId: "user-1",
      } as never);
      vi.mocked(supplyAgreementsRepo.findByShopAndWinemaker).mockResolvedValue(undefined);
      vi.mocked(supplyAgreementsRepo.create).mockResolvedValue({
=======
      vi.mocked(shopsRepository.findById).mockResolvedValue({
        id: "shop-1",
        ownerUserId: "user-1",
      } as never);
      vi.mocked(supplyAgreementsRepository.findByShopAndWinemaker).mockResolvedValue(undefined);
      vi.mocked(supplyAgreementsRepository.create).mockResolvedValue({
>>>>>>> origin/main
        id: "agreement-1",
      } as never);

      const result = await supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1");

      expect(result.id).toBe("agreement-1");
<<<<<<< HEAD
      expect(supplyAgreementsRepo.create).toHaveBeenCalledWith(expect.anything(), {
=======
      expect(supplyAgreementsRepository.create).toHaveBeenCalledWith({
>>>>>>> origin/main
        shopId: "shop-1",
        winemakerId: "winemaker-1",
      });
    });

    it("returns existing agreement if it already exists", async () => {
<<<<<<< HEAD
      vi.mocked(shopsRepo.findById).mockResolvedValue({
=======
      vi.mocked(shopsRepository.findById).mockResolvedValue({
>>>>>>> origin/main
        id: "shop-1",
        ownerUserId: "user-1",
      } as never);
      const existing = { id: "existing-1", status: "pending" };
<<<<<<< HEAD
      vi.mocked(supplyAgreementsRepo.findByShopAndWinemaker).mockResolvedValue(existing as never);
=======
      vi.mocked(supplyAgreementsRepository.findByShopAndWinemaker).mockResolvedValue(
        existing as never
      );
>>>>>>> origin/main

      const result = await supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1");

      expect(result).toBe(existing);
<<<<<<< HEAD
      expect(supplyAgreementsRepo.create).not.toHaveBeenCalled();
    });

    it("returns existing agreement even if rejected", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue({
=======
      expect(supplyAgreementsRepository.create).not.toHaveBeenCalled();
    });

    it("returns existing agreement even if rejected", async () => {
      vi.mocked(shopsRepository.findById).mockResolvedValue({
>>>>>>> origin/main
        id: "shop-1",
        ownerUserId: "user-1",
      } as never);
      const existing = { id: "existing-1", status: "rejected" };
<<<<<<< HEAD
      vi.mocked(supplyAgreementsRepo.findByShopAndWinemaker).mockResolvedValue(existing as never);
=======
      vi.mocked(supplyAgreementsRepository.findByShopAndWinemaker).mockResolvedValue(
        existing as never
      );
>>>>>>> origin/main

      const result = await supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1");

      expect(result).toBe(existing);
    });

    it("throws FORBIDDEN if user doesn't own the shop", async () => {
<<<<<<< HEAD
      vi.mocked(shopsRepo.findById).mockResolvedValue({
=======
      vi.mocked(shopsRepository.findById).mockResolvedValue({
>>>>>>> origin/main
        id: "shop-1",
        ownerUserId: "user-other",
      } as never);

      await expect(
        supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1")
<<<<<<< HEAD
      ).rejects.toThrow("You do not have permission to manage this shop");
    });

    it("throws FORBIDDEN if shop does not exist", async () => {
      vi.mocked(shopsRepo.findById).mockResolvedValue(undefined);

      await expect(
        supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1")
      ).rejects.toThrow("You do not have permission to manage this shop");
=======
      ).rejects.toThrow("FORBIDDEN");
    });

    it("throws FORBIDDEN if shop does not exist", async () => {
      vi.mocked(shopsRepository.findById).mockResolvedValue(undefined);

      await expect(
        supplyAgreementsService.createRequest("user-1", "winemaker-1", "shop-1")
      ).rejects.toThrow("FORBIDDEN");
>>>>>>> origin/main
    });
  });

  describe("respondToRequest", () => {
    it("approves a request if user is the winemaker", async () => {
      const mockAgreement = { id: "agreement-1", status: "pending", winemakerId: "winemaker-1" };
<<<<<<< HEAD
      vi.mocked(supplyAgreementsRepo.findById).mockResolvedValue(mockAgreement as never);
      vi.mocked(winemakersRepo.findById).mockResolvedValue({
        id: "winemaker-1",
        userId: "user-wm",
      } as never);
      vi.mocked(supplyAgreementsRepo.updateStatus).mockResolvedValue({
=======
      vi.mocked(supplyAgreementsRepository.findById).mockResolvedValue(mockAgreement as never);
      vi.mocked(winemakersRepository.findById).mockResolvedValue({
        id: "winemaker-1",
        userId: "user-wm",
      } as never);
      vi.mocked(supplyAgreementsRepository.updateStatus).mockResolvedValue({
>>>>>>> origin/main
        ...mockAgreement,
        status: "approved",
      } as never);

      const result = await supplyAgreementsService.respondToRequest(
        "user-wm",
        "agreement-1",
        "approved"
      );

      expect(result.status).toBe("approved");
<<<<<<< HEAD
      expect(supplyAgreementsRepo.updateStatus).toHaveBeenCalledWith(
        expect.anything(),
=======
      expect(supplyAgreementsRepository.updateStatus).toHaveBeenCalledWith(
>>>>>>> origin/main
        "agreement-1",
        "approved"
      );
    });

    it("throws NOT_FOUND if agreement doesn't exist", async () => {
<<<<<<< HEAD
      vi.mocked(supplyAgreementsRepo.findById).mockResolvedValue(undefined);

      await expect(
        supplyAgreementsService.respondToRequest("user-wm", "a1", "approved")
      ).rejects.toThrow("Supply agreement not found");
    });

    it("throws FORBIDDEN if user is not the winemaker of the agreement", async () => {
      vi.mocked(supplyAgreementsRepo.findById).mockResolvedValue({
=======
      vi.mocked(supplyAgreementsRepository.findById).mockResolvedValue(undefined);

      await expect(
        supplyAgreementsService.respondToRequest("user-wm", "a1", "approved")
      ).rejects.toThrow("NOT_FOUND");
    });

    it("throws FORBIDDEN if user is not the winemaker of the agreement", async () => {
      vi.mocked(supplyAgreementsRepository.findById).mockResolvedValue({
>>>>>>> origin/main
        id: "a1",
        status: "pending",
        winemakerId: "wm1",
      } as never);
<<<<<<< HEAD
      vi.mocked(winemakersRepo.findById).mockResolvedValue({
=======
      vi.mocked(winemakersRepository.findById).mockResolvedValue({
>>>>>>> origin/main
        id: "wm1",
        userId: "other-user",
      } as never);

      await expect(
        supplyAgreementsService.respondToRequest("user-wm", "a1", "approved")
<<<<<<< HEAD
      ).rejects.toThrow("Forbidden");
    });

    it("throws ALREADY_RESPONDED if status is not pending", async () => {
      vi.mocked(supplyAgreementsRepo.findById).mockResolvedValue({
=======
      ).rejects.toThrow("FORBIDDEN");
    });

    it("throws ALREADY_RESPONDED if status is not pending", async () => {
      vi.mocked(supplyAgreementsRepository.findById).mockResolvedValue({
>>>>>>> origin/main
        id: "a1",
        status: "approved",
        winemakerId: "wm1",
      } as never);
<<<<<<< HEAD
      vi.mocked(winemakersRepo.findById).mockResolvedValue({
=======
      vi.mocked(winemakersRepository.findById).mockResolvedValue({
>>>>>>> origin/main
        id: "wm1",
        userId: "user-wm",
      } as never);

      await expect(
        supplyAgreementsService.respondToRequest("user-wm", "a1", "rejected")
<<<<<<< HEAD
      ).rejects.toThrow("This request has already been responded to");
=======
      ).rejects.toThrow("ALREADY_RESPONDED");
>>>>>>> origin/main
    });
  });

  describe("listForShop", () => {
    it("lists agreements for a shop if owner", async () => {
<<<<<<< HEAD
      vi.mocked(shopsRepo.findById).mockResolvedValue({
=======
      vi.mocked(shopsRepository.findById).mockResolvedValue({
>>>>>>> origin/main
        id: "s1",
        ownerUserId: "u1",
      } as never);
      const mockList = [{ id: "a1" }];
<<<<<<< HEAD
      vi.mocked(supplyAgreementsRepo.listForShop).mockResolvedValue(mockList as never);
=======
      vi.mocked(supplyAgreementsRepository.listForShop).mockResolvedValue(mockList as never);
>>>>>>> origin/main

      const result = await supplyAgreementsService.listForShop("u1", "s1");

      expect(result).toBe(mockList);
    });

    it("throws FORBIDDEN if not the shop owner", async () => {
<<<<<<< HEAD
      vi.mocked(shopsRepo.findById).mockResolvedValue({
=======
      vi.mocked(shopsRepository.findById).mockResolvedValue({
>>>>>>> origin/main
        id: "s1",
        ownerUserId: "other",
      } as never);

<<<<<<< HEAD
      await expect(supplyAgreementsService.listForShop("u1", "s1")).rejects.toThrow(
        "You do not have permission to manage this shop"
      );
=======
      await expect(supplyAgreementsService.listForShop("u1", "s1")).rejects.toThrow("FORBIDDEN");
>>>>>>> origin/main
    });
  });

  describe("listForWinemaker", () => {
    it("lists agreements for the winemaker", async () => {
<<<<<<< HEAD
      vi.mocked(winemakersRepo.findByUserId).mockResolvedValue({ id: "wm1" } as never);
      const mockList = [{ id: "a1" }];
      vi.mocked(supplyAgreementsRepo.listForWinemaker).mockResolvedValue(mockList as never);
=======
      vi.mocked(winemakersRepository.findByUserId).mockResolvedValue({ id: "wm1" } as never);
      const mockList = [{ id: "a1" }];
      vi.mocked(supplyAgreementsRepository.listForWinemaker).mockResolvedValue(mockList as never);
>>>>>>> origin/main

      const result = await supplyAgreementsService.listForWinemaker("u1");

      expect(result).toBe(mockList);
    });

    it("throws NOT_A_WINEMAKER if user has no winemaker profile", async () => {
<<<<<<< HEAD
      vi.mocked(winemakersRepo.findByUserId).mockResolvedValue(undefined);

      await expect(supplyAgreementsService.listForWinemaker("u1")).rejects.toThrow(
        "User is not a winemaker"
=======
      vi.mocked(winemakersRepository.findByUserId).mockResolvedValue(undefined);

      await expect(supplyAgreementsService.listForWinemaker("u1")).rejects.toThrow(
        "NOT_A_WINEMAKER"
>>>>>>> origin/main
      );
    });
  });
});
