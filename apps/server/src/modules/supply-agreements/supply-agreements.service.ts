import type { SupplyAgreement } from "../../db/schema";
import { shopsRepository } from "../shops/shops.repository";
import { winemakersRepository } from "../winemakers/winemakers.repository";
import { supplyAgreementsRepository } from "./supply-agreements.repository";

export const supplyAgreementsService = {
  async createRequest(
    userId: string,
    winemakerId: string,
    shopId: string
  ): Promise<SupplyAgreement> {
    const shop = await shopsRepository.findById(shopId);
    if (!shop || shop.ownerUserId !== userId) {
      throw new Error("FORBIDDEN");
    }

    const existing = await supplyAgreementsRepository.findByShopAndWinemaker(shopId, winemakerId);
    if (existing) {
      if (existing.status === "rejected") {
        // Allow re-requesting if rejected? For now just return existing
        return existing;
      }
      return existing;
    }

    return supplyAgreementsRepository.create({ shopId, winemakerId });
  },

  async listForShop(userId: string, shopId: string): Promise<SupplyAgreement[]> {
    const shop = await shopsRepository.findById(shopId);
    if (!shop || shop.ownerUserId !== userId) {
      throw new Error("FORBIDDEN");
    }

    return supplyAgreementsRepository.listForShop(shopId);
  },

  async listForWinemaker(userId: string): Promise<SupplyAgreement[]> {
    const winemaker = await winemakersRepository.findByUserId(userId);
    if (!winemaker) {
      throw new Error("NOT_A_WINEMAKER");
    }

    return supplyAgreementsRepository.listForWinemaker(winemaker.id);
  },

  async respondToRequest(
    userId: string,
    agreementId: string,
    status: "approved" | "rejected"
  ): Promise<SupplyAgreement> {
    const agreement = await supplyAgreementsRepository.findById(agreementId);
    if (!agreement) throw new Error("NOT_FOUND");

    const winemaker = await winemakersRepository.findById(agreement.winemakerId);
    if (!winemaker || winemaker.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    if (agreement.status !== "pending") {
      throw new Error("ALREADY_RESPONDED");
    }

    const updated = await supplyAgreementsRepository.updateStatus(agreementId, status);
    if (!updated) throw new Error("NOT_FOUND");

    return updated;
  },
};
