import type { SupplyAgreement } from "@repo/shared/schemas";
import { ForbiddenError } from "@repo/shared";
import { db } from "../../db";
import { ForbiddenShopActionError } from "../shops/shops.errors";
import * as shopsRepo from "../shops/shops.repository";
import * as winemakersRepo from "../winemakers/winemakers.repository";
import {
  AlreadyRespondedError,
  NotAWinemakerError,
  SupplyAgreementNotFoundError,
} from "./supply-agreements.errors";
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
    if (!winemaker) throw new NotAWinemakerError();

    return supplyAgreementsRepo.listForWinemaker(db, winemaker.id);
  }

  async respondToRequest(
    userId: string,
    agreementId: string,
    status: "approved" | "rejected"
  ): Promise<SupplyAgreement> {
    const agreement = await supplyAgreementsRepo.findById(db, agreementId);
    if (!agreement) throw new SupplyAgreementNotFoundError();

    const winemaker = await winemakersRepo.findById(db, agreement.winemakerId);
    if (!winemaker || winemaker.userId !== userId) throw new ForbiddenError();

    if (agreement.status !== "pending") throw new AlreadyRespondedError();

    const updated = await supplyAgreementsRepo.updateStatus(db, agreementId, status);
    if (!updated) throw new SupplyAgreementNotFoundError();

    return updated;
  }
}

export const supplyAgreementsService = new SupplyAgreementsService();
