import type { SupplyAgreement } from "@repo/shared/schemas";
import { db } from "../../db";
import { ForbiddenShopActionError } from "../shops/shops.errors";
import * as shopsRepo from "../shops/shops.repository";
import * as winemakersRepo from "../winemakers/winemakers.repository";
import * as supplyAgreementsRepo from "./supply-agreements.repository";

export class SupplyAgreementsService {
  async createRequest(
    userId: string,
    winemakerId: string,
    shopId: string
  ): Promise<SupplyAgreement> {
    const shop = await shopsRepo.findById(db, shopId);
    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenShopActionError();
    }

    const existing = await supplyAgreementsRepo.findByShopAndWinemaker(db, shopId, winemakerId);
    if (existing) {
      return existing;
    }

    return supplyAgreementsRepo.create(db, { shopId, winemakerId });
  }

  async listForShop(userId: string, shopId: string): Promise<SupplyAgreement[]> {
    const shop = await shopsRepo.findById(db, shopId);
    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenShopActionError();
    }

    return supplyAgreementsRepo.listForShop(db, shopId);
  }

  async listForWinemaker(userId: string): Promise<SupplyAgreement[]> {
    const winemaker = await winemakersRepo.findByUserId(db, userId);
    if (!winemaker) {
      throw new Error("NOT_A_WINEMAKER");
    }

    return supplyAgreementsRepo.listForWinemaker(db, winemaker.id);
  }

  async respondToRequest(
    userId: string,
    agreementId: string,
    status: "approved" | "rejected"
  ): Promise<SupplyAgreement> {
    const agreement = await supplyAgreementsRepo.findById(db, agreementId);
    if (!agreement) throw new Error("NOT_FOUND");

    const winemaker = await winemakersRepo.findById(db, agreement.winemakerId);
    if (!winemaker || winemaker.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    if (agreement.status !== "pending") {
      throw new Error("ALREADY_RESPONDED");
    }

    const updated = await supplyAgreementsRepo.updateStatus(db, agreementId, status);
    if (!updated) throw new Error("NOT_FOUND");

    return updated;
  }
}

export const supplyAgreementsService = new SupplyAgreementsService();
